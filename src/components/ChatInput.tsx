import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Send, Paperclip, X, FileText, Image, File, Loader2, Code, FileSpreadsheet, Presentation, Music, Database } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { cn } from '@/lib/utils';
interface ChatInputProps {
  onSendMessage: (message: string, files: File[]) => void;
  disabled?: boolean;
  className?: string;
}
export const ChatInput = ({
  onSendMessage,
  disabled = false,
  className
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    toast
  } = useToast();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0 || disabled) {
      return;
    }
    onSendMessage(message, files);
    setMessage('');
    setFiles([]);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const addFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    for (const file of newFiles) {
      const validation = chatService.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: `${file.name}: ${validation.error}`
        });
      }
    }
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };
  const getFileIcon = (file: File) => {
    const extension = file.name.toLowerCase().split('.').pop();
    
    // Images
    if (file.type.startsWith('image/') || 
        (extension && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'heic', 'heif'].includes(extension))) {
      return <Image className="w-4 h-4" />;
    }

    // Audio files
    if (file.type.startsWith('audio/') || 
        (extension && ['mp3', 'wav', 'ogg', 'opus', 'flac', 'm4a', 'aac', 'webm'].includes(extension))) {
      return <Music className="w-4 h-4" />;
    }

    // Microsoft Office & LibreOffice - Excel/Calc
    if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.type.includes('opendocument.spreadsheet') ||
        (extension && ['xlsx', 'xls', 'ods', 'csv', 'tsv'].includes(extension))) {
      return <FileSpreadsheet className="w-4 h-4" />;
    }

    // Microsoft Office & LibreOffice - PowerPoint/Impress
    if (file.type.includes('powerpoint') || file.type.includes('presentation') || file.type.includes('opendocument.presentation') ||
        (extension && ['pptx', 'ppt', 'odp'].includes(extension))) {
      return <Presentation className="w-4 h-4" />;
    }

    // Code files
    if (file.type.includes('javascript') || file.type.includes('typescript') || file.type.includes('text/html') || file.type.includes('text/css') ||
        (extension && ['js', 'jsx', 'ts', 'tsx', 'css', 'html', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'kt', 'swift', 'sh', 'bash'].includes(extension))) {
      return <Code className="w-4 h-4" />;
    }

    // Data files
    if (file.type.includes('json') || file.type.includes('xml') || file.type.includes('yaml') || file.type.includes('csv') ||
        (extension && ['json', 'xml', 'yaml', 'yml', 'sql', 'db', 'toml', 'ini'].includes(extension))) {
      return <Database className="w-4 h-4" />;
    }

    // Documents (PDF, Word, OpenDocument, RTF, text files, eBooks)
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('msword') || 
        file.type.includes('opendocument.text') || file.type.includes('rtf') || file.type.startsWith('text/') ||
        file.type.includes('epub') || file.type.includes('mobi') || file.type.includes('ebook') ||
        (extension && ['pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'md', 'markdown', 'epub', 'mobi', 'azw', 'azw3'].includes(extension))) {
      return <FileText className="w-4 h-4" />;
    }

    // Default fallback
    return <File className="w-4 h-4" />;
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  return <Card className={cn("glass-strong border-white/10 shadow-glass transition-glass", isDragOver && "ring-2 ring-primary/50 scale-[1.01]", className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Attachments */}
        {files.length > 0 && <div className="flex flex-wrap gap-2">
            {files.map((file, index) => <Badge key={index} variant="secondary" className="glass-sm flex items-center gap-2 px-3 py-2 text-xs border-white/10 hover:scale-105 transition-glass">
                {getFileIcon(file)}
                <span className="max-w-32 truncate font-medium">{file.name}</span>
                <span className="text-muted-foreground">
                  ({formatFileSize(file.size)})
                </span>
                <button type="button" onClick={() => removeFile(index)} className="ml-1 hover:text-destructive transition-glass hover:scale-110">
                  <X className="w-3 h-3" />
                </button>
              </Badge>)}
          </div>}

        {/* Input Area */}
        <div className={cn("relative glass rounded-xl transition-glass border-white/10 flex flex-col w-[50vw] mx-auto", isDragOver ? "border-primary/50 bg-primary/10 scale-[1.01]" : "border-white/10", "hover:border-white/20")} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          <Textarea ref={textareaRef} value={message} onChange={e => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder={isDragOver ? "Drop files here..." : "Type your message... (Shift+Enter for new line)"} disabled={disabled} className="min-h-[80px] max-h-40 resize-none border-0 focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground mx-0" />
          
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" accept={chatService.getSupportedFileTypes().join(',')} />
              
              <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={disabled} className="h-9 w-9 p-0 glass-sm hover:glass border-white/10 hover:scale-110 transition-glass">
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>

            <Button type="submit" disabled={disabled || !message.trim() && files.length === 0} size="sm" className="h-9 px-4 bg-gradient-primary hover:scale-105 transition-glass shadow-glass glow font-medium">
              {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </>}
            </Button>
          </div>
        </div>
      </form>
    </Card>;
};