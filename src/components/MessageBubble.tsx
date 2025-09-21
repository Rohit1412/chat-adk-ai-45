import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ParsedMessage, ParsedMessageContent } from '@/utils/adkParser';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Bot, Settings, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RotatingText } from './RotatingText';

interface MessageBubbleProps {
  message: ParsedMessage;
  className?: string;
}

export const MessageBubble = ({ message, className }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;

  return (
    <div className={cn(
      "flex w-full gap-6 p-6",
      isUser ? "justify-end" : "justify-start",
      className
    )}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glass glow float">
          <Bot className="w-6 h-6 text-white" />
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "space-y-4",
        isUser ? "max-w-[75%] flex flex-col items-end" : "max-w-[85%]"
      )}>
        {/* Multiple Message Bubbles - one for each content piece */}
        <div className="space-y-3">
          {message.content.map((content, index) => (
            <div key={index} className={cn(
              "bento-box animate-scale-in transition-glass",
              isUser 
                ? "chat-bubble-user" 
                : "chat-bubble-agent"
            )}>
              <MessageContent content={content} isUser={isUser} />
            </div>
          ))}
        </div>

        {/* Streaming Indicator */}
        {isStreaming && (
          <div className={cn(
            "bento-box transition-glass",
            isUser 
              ? "chat-bubble-user" 
              : "chat-bubble-agent"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <RotatingText 
                messages={
                  message.content.some(c => c.type === 'function_call' && 
                    !message.content.some(r => r.type === 'function_response' && 
                      r.functionResponse?.id === c.functionCall?.id)) 
                    ? ['Processing function call...', 'Executing request...', 'Handling parameters...', 'Running operation...']
                    : ['Thinking...', 'Analyzing...', 'Planning next steps...', 'Browsing data...', 'Diving deeper...', 'Processing insights...', 'Connecting dots...', 'Formulating response...']
                }
                className="text-sm"
                interval={1800}
              />
            </div>
          </div>
        )}

        {/* Message Status */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
          <Clock className="w-3 h-3" />
          {new Date(message.timestamp).toLocaleTimeString()}
          {message.finishReason && (
            <>
              <span>•</span>
              <Badge variant="outline" className="text-xs glass-sm border-primary/20">
                {message.finishReason}
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl glass flex items-center justify-center shadow-glass">
          <User className="w-6 h-6 text-foreground" />
        </div>
      )}
    </div>
  );
};

interface MessageContentProps {
  content: ParsedMessageContent;
  isUser: boolean;
}

const MessageContent = ({ content, isUser }: MessageContentProps) => {
  switch (content.type) {
    case 'text':
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-sans prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:text-foreground prose-code:bg-muted/50 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom components for better styling
              h1: ({ children }) => <h1 className="text-xl font-bold mb-4 mt-6 first:mt-0 bg-gradient-primary bg-clip-text text-transparent">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-semibold mb-3 mt-5 first:mt-0 text-foreground">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-4 first:mt-0 text-foreground">{children}</h3>,
              p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-foreground/90">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 pl-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 pl-2">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed text-foreground/90">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary/30 pl-4 my-3 italic text-muted-foreground glass-sm p-3 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              code: ({ className, children, ...props }: any) => {
                const isInline = !className || !className.includes('language-');
                if (isInline) {
                  return <code className="glass-sm px-2 py-1 rounded-md text-sm font-mono text-foreground" {...props}>{children}</code>;
                }
                return (
                  <pre className="glass p-4 rounded-xl overflow-x-auto my-3 border border-white/10">
                    <code className="text-sm font-mono text-foreground" {...props}>{children}</code>
                  </pre>
                );
              },
              table: ({ children }) => (
                <div className="overflow-x-auto my-3">
                  <table className="min-w-full glass rounded-xl border border-white/10">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-white/10 px-4 py-3 bg-muted/20 font-semibold text-left text-foreground">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border border-white/10 px-4 py-3 text-foreground/90">{children}</td>
              ),
            }}
          >
            {content.content}
          </ReactMarkdown>
        </div>
      );

    case 'function_call':
      const functionName = content.functionCall?.name || 'Unknown';
      const args = content.functionCall?.args || {};
      
      return (
        <div className="glass rounded-xl p-4 border border-primary/20 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <Settings className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Calling {functionName}</span>
            </div>
          </div>
          {Object.keys(args).length > 0 && (
            <div className="mt-3 glass-sm p-3 rounded-lg border border-white/10">
              <div className="font-medium mb-2 text-muted-foreground text-xs uppercase tracking-wide">Arguments:</div>
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/80">
                {JSON.stringify(args, null, 2)}
              </pre>
            </div>
          )}
        </div>
      );

    case 'function_response':
      return (
        <div className="glass rounded-xl p-3 border border-success/20 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">Function completed successfully</span>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-sm italic opacity-70 glass-sm p-3 rounded-lg">
          Unknown content type
        </div>
      );
  }
};