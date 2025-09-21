import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ParsedMessage } from '@/utils/adkParser';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessagePreviewProps {
  message: ParsedMessage;
  onClose: () => void;
}

export const MessagePreview = ({ message, onClose }: MessagePreviewProps) => {
  // Extract text content from the message
  const textContent = message.content
    .filter(part => part.type === 'text')
    .map(part => part.content)
    .join('\n\n');

  if (!textContent.trim()) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-background border shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-lg">Response Preview</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-archivo prose-p:leading-relaxed prose-pre:bg-muted prose-pre:text-muted-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 text-foreground">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0 text-foreground">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0 text-foreground">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-base font-semibold mb-2 mt-3 first:mt-0 text-foreground">{children}</h4>,
                  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-foreground">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-foreground">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground bg-muted/30 py-2 rounded-r">
                      {children}
                    </blockquote>
                  ),
                  code: ({ className, children, ...props }: any) => {
                    const isInline = !className || !className.includes('language-');
                    if (isInline) {
                      return <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground border" {...props}>{children}</code>;
                    }
                    return (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4 border">
                        <code className="text-sm font-mono text-foreground" {...props}>{children}</code>
                      </pre>
                    );
                  },
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 border rounded-lg">
                      <table className="min-w-full">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border px-4 py-3 font-semibold text-left text-foreground">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-4 py-3 text-foreground">{children}</td>
                  ),
                  hr: () => <hr className="my-6 border-border" />,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                  a: ({ children, href }) => (
                    <a href={href} className="text-primary hover:text-primary/80 underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {textContent}
              </ReactMarkdown>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};