import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LogOut, MessageSquare, User, Settings, Trash2, Download, FileText, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Session, sessionService } from '@/services/sessionService';
import { chatService, StreamResponse } from '@/services/chatService';
import { adkParser, ParsedMessage } from '@/utils/adkParser';
import { MessageBubble } from './MessageBubble';
import { MessagePreview } from './MessagePreview';
import { ChatInput } from './ChatInput';
import { cn } from '@/lib/utils';
interface ChatInterfaceProps {
  session: Session;
  onSessionEnd: () => void;
}
export const ChatInterface = ({
  session,
  onSessionEnd
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ParsedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<ParsedMessage | null>(null);
  const [previewMessage, setPreviewMessage] = useState<ParsedMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // Load messages from localStorage on component mount
  useEffect(() => {
    const storedMessages = sessionService.getStoredMessages(session.sessionId);
    if (storedMessages.length > 0) {
      setMessages(storedMessages);
    }
  }, [session.sessionId]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      sessionService.storeMessages(session.sessionId, messages);
    }
  }, [messages, session.sessionId]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage]);
  const handleSendMessage = async (messageText: string, files: File[]) => {
    if (!messageText.trim() && files.length === 0) return;

    // Add user message
    const userMessage = adkParser.createMessage('user', messageText);
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create initial streaming message for agent response
    const streamingMessage = adkParser.createMessage('model', [], true);
    setCurrentStreamingMessage(streamingMessage);
    try {
      await chatService.sendMessage(session, messageText, files, (streamData: StreamResponse) => {
        // Parse stream data
        const newContent = adkParser.parseStreamResponse(streamData);
        if (newContent.length > 0) {
          setCurrentStreamingMessage(prev => {
            if (!prev) return null;
            return adkParser.updateMessage(prev, newContent);
          });
        }
      }, () => {
        // On completion
        setIsLoading(false);
        setCurrentStreamingMessage(prev => {
          if (prev) {
            const finalMessage = adkParser.finalizeMessage(prev, 'STOP');
            setMessages(current => [...current, finalMessage]);
          }
          return null;
        });
      }, (error: Error) => {
        // On error
        setIsLoading(false);
        setCurrentStreamingMessage(null);
        toast({
          variant: "destructive",
          title: "Message Failed",
          description: error.message
        });

        // Add error message
        const errorMessage = adkParser.createMessage('model', `Sorry, I encountered an error: ${error.message}`);
        setMessages(prev => [...prev, errorMessage]);
      });
    } catch (error) {
      setIsLoading(false);
      setCurrentStreamingMessage(null);
      console.error('Failed to send message:', error);
    }
  };
  const handleEndSession = async () => {
    try {
      await sessionService.terminateSession(session);
      toast({
        title: "Session Ended",
        description: "Your chat session has been terminated."
      });
      onSessionEnd();
    } catch (error) {
      console.error('Error ending session:', error);
      // Still end session locally even if backend call fails
      sessionService.deleteSession();
      sessionService.clearMessages(session.sessionId);
      onSessionEnd();
    }
  };
  const handleClearChat = () => {
    setMessages([]);
    setCurrentStreamingMessage(null);
    sessionService.clearMessages(session.sessionId);
    toast({
      title: "Chat Cleared",
      description: "All messages have been removed."
    });
  };
  const handleExportChat = () => {
    // Only export final responses (model messages with text content)
    const finalResponses = messages.filter(msg => msg.role === 'model' && msg.content.some(part => part.type === 'text' && part.content.trim()));
    let markdownContent = `# Chat Export\n\n`;
    markdownContent += `**Exported on:** ${new Date().toLocaleString()}\n\n`;
    markdownContent += `**Session:** ${session.appName}\n\n`;
    markdownContent += `---\n\n`;
    finalResponses.forEach((msg, index) => {
      const textContent = adkParser.getMessageText(msg);
      if (textContent.trim()) {
        markdownContent += `## Response ${index + 1}\n\n`;
        markdownContent += `**Time:** ${new Date(msg.timestamp).toLocaleString()}\n\n`;
        markdownContent += `${textContent}\n\n`;
        markdownContent += `---\n\n`;
      }
    });
    const dataBlob = new Blob([markdownContent], {
      type: 'text/markdown'
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-export-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Chat Exported",
      description: "Final responses exported as markdown."
    });
  };
  return <div className="h-screen lovable-gradient-bg flex flex-col relative overflow-hidden">
      {/* Header */}
      <Card className="glass-strong rounded-none border-x-0 border-t-0 border-b border-white/10 shadow-glass z-10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glass glow">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
                InsightSprout
              </CardTitle>
              <Button variant="ghost" size="sm" className="mt-1 h-8 w-8 p-0 glass-sm hover:glass border-white/10 hover:scale-110 transition-glass">
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/agent-info')}
              className="h-8 glass-sm hover:glass border-white/10"
            >
              <Info className="w-4 h-4 mr-1" />
              Info
            </Button>
            {messages.length > 0 && <>
                <Button variant="ghost" size="sm" onClick={handleExportChat} className="h-8 glass-sm hover:glass border-white/10">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClearChat} className="h-8 glass-sm hover:glass border-white/10">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </>}
            <Button variant="outline" size="sm" onClick={handleEndSession} className="h-8 glass border-white/20 hover:border-destructive/30">
              <LogOut className="w-4 h-4 mr-1" />
              End Session
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-5xl mx-auto">
          {messages.length === 0 && !currentStreamingMessage ? <div className="flex items-center justify-center h-full min-h-[60vh]">
              <div className="text-center space-y-6 p-8">
                <div className="bento-box w-24 h-24 flex items-center justify-center mx-auto float">
                  <MessageSquare className="w-12 h-12 text-primary animate-glow" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Ready to Analyze Startups
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Send a message or upload files to get started with InsightSprout and unlock powerful AI-driven startup analysis.
                  </p>
                </div>
              </div>
            </div> : <div className="space-y-6 p-4">
              {/* Bento Grid Layout for Messages */}
              {messages.map(message => <div key={message.id} className="relative group animate-fade-in">
                  <MessageBubble message={message} />
                  {message.role === 'model' && !message.isStreaming && adkParser.getMessageText(message).trim() && <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewMessage(message)} className="h-8 w-8 p-0 glass-sm backdrop-blur-md border-white/20 shadow-glass-sm hover:scale-110">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>}
                </div>)}
              
              {currentStreamingMessage && <div className="animate-fade-in">
                  <MessageBubble message={currentStreamingMessage} className="animate-pulse" />
                </div>}
              
              <div ref={messagesEndRef} />
            </div>}
        </div>
      </div>

      {/* Input Area */}
      <div className="max-w-5xl mx-auto">
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>

      {/* Preview Modal */}
      {previewMessage && <MessagePreview message={previewMessage} onClose={() => setPreviewMessage(null)} />}
    </div>;
};