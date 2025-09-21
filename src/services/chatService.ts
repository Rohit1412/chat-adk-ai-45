import { Session } from './sessionService';

export interface MessagePart {
  text?: string;
  inlineData?: {
    displayName: string;
    data: string; // base64 encoded
    mimeType: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: MessagePart[];
}

export interface ChatRequest {
  appName: string;
  userId: string;
  sessionId: string;
  newMessage: ChatMessage;
  streaming: boolean;
  stateDelta: Record<string, unknown>;
}

export interface FunctionCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface FunctionResponse {
  id: string;
  result: unknown;
}

export interface StreamResponse {
  content: {
    parts: Array<{
      text?: string;
      functionCall?: FunctionCall;
      functionResponse?: FunctionResponse;
    }>;
    role: 'model';
  };
  finishReason?: string;
}

class ChatService {
  private readonly BASE_URL = 'https://574a2aa1ee07.ngrok-free.app';

  async sendMessage(
    session: Session,
    message: string,
    files: File[] = [],
    onStreamData: (data: StreamResponse) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      // Prepare message parts
      const parts: MessagePart[] = [];
      
      // Add text if provided
      if (message.trim()) {
        parts.push({ text: message });
      }

      // Add files if provided
      for (const file of files) {
        const base64Data = await this.fileToBase64(file);
        parts.push({
          inlineData: {
            displayName: file.name,
            data: base64Data,
            mimeType: file.type,
          },
        });
      }

      if (parts.length === 0) {
        throw new Error('Message must contain either text or files');
      }

      // Prepare request payload
      const requestPayload: ChatRequest = {
        appName: session.appName,
        userId: session.userId,
        sessionId: session.sessionId,
        newMessage: {
          role: 'user',
          parts,
        },
        streaming: true,
        stateDelta: {},
      };

      // Send request to streaming endpoint
      const response = await fetch(`${this.BASE_URL}/run_sse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Process Server-Sent Events stream
      await this.processEventStream(response, onStreamData, onComplete, onError);
    } catch (error) {
      console.error('Error sending message:', error);
      onError(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  }

  private async processEventStream(
    response: Response,
    onStreamData: (data: StreamResponse) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete();
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = line.slice(6); // Remove 'data: ' prefix
              if (jsonData.trim() === '[DONE]') {
                onComplete();
                return;
              }
              
              const parsedData: StreamResponse = JSON.parse(jsonData);
              onStreamData(parsedData);
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError, line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing event stream:', error);
      onError(error instanceof Error ? error : new Error('Stream processing error'));
    } finally {
      reader.releaseLock();
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      
      reader.readAsDataURL(file);
    });
  }

  // Utility method to get supported file types
  getSupportedFileTypes(): string[] {
    return [
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      'image/heic',
      'image/heif',
      
      // Documents - PDF
      'application/pdf',
      
      // Microsoft Office - Word
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      
      // Microsoft Office - Excel  
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/csv',
      'application/csv',
      
      // Microsoft Office - PowerPoint
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.oasis.opendocument.presentation', // .odp
      
      // OpenDocument formats
      'application/vnd.oasis.opendocument.text', // .odt
      'application/vnd.oasis.opendocument.spreadsheet', // .ods
      'application/vnd.oasis.opendocument.graphics', // .odg
      
      // Rich Text and Documents
      'application/rtf',
      'text/rtf',
      'text/richtext',
      
      // Text formats
      'text/plain',
      'text/markdown',
      'text/xml',
      'application/xml',
      'text/yaml',
      'application/yaml',
      'text/x-yaml',
      
      // Data formats
      'application/json',
      'application/ld+json',
      'text/tab-separated-values',
      'application/vnd.ms-access',
      
      // Archive formats
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/gzip',
      'application/x-tar',
      
      // eBook formats
      'application/epub+zip',
      'application/x-mobipocket-ebook',
      'application/vnd.amazon.ebook',
      
      // Code files - Web
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'text/typescript',
      'application/typescript',
      'text/jsx',
      'text/tsx',
      
      // Code files - Backend
      'text/x-python',
      'application/x-python-code',
      'text/x-java-source',
      'text/x-csharp',
      'text/x-php',
      'text/x-ruby',
      'text/x-go',
      'text/x-rust',
      'text/x-kotlin',
      'text/x-swift',
      
      // Code files - Systems
      'text/x-c',
      'text/x-c++',
      'text/x-c#',
      'text/x-objective-c',
      'text/x-shellscript',
      'application/x-sh',
      
      // Config files
      'application/toml',
      'text/x-ini',
      'text/x-properties',
      'application/x-yaml',
      
      // Audio files
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/mp4',
      'audio/m4a',
      'audio/aac',
      'audio/ogg',
      'audio/opus',
      'audio/flac',
      'audio/webm',
      
      // Video files (for future support)
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo',
    ];
  }

  // Utility method to validate file
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 20 * 1024 * 1024; // 20MB (increased from 10MB)
    const supportedTypes = this.getSupportedFileTypes();

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 20MB' };
    }

    // Check MIME type first
    if (supportedTypes.includes(file.type)) {
      return { valid: true };
    }

    // Fallback to file extension if MIME type is not available or recognized
    const extension = file.name.toLowerCase().split('.').pop();
    const supportedExtensions = [
      // Images
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'heic', 'heif',
      
      // Documents
      'pdf', 'doc', 'docx', 'odt', 'rtf',
      
      // Spreadsheets
      'xls', 'xlsx', 'ods', 'csv', 'tsv',
      
      // Presentations
      'ppt', 'pptx', 'odp',
      
      // Text formats
      'txt', 'md', 'markdown', 'xml', 'yaml', 'yml', 'json', 'toml', 'ini',
      
      // Code files
      'html', 'css', 'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp',
      'cs', 'php', 'rb', 'go', 'rs', 'kt', 'swift', 'sh', 'bash',
      
      // Audio
      'mp3', 'wav', 'ogg', 'opus', 'flac', 'm4a', 'aac', 'webm',
      
      // Video
      'mp4', 'mov', 'avi', 'webm', 'ogg',
      
      // Archives
      'zip', 'rar', '7z', 'tar', 'gz',
      
      // eBooks
      'epub', 'mobi', 'azw', 'azw3'
    ];

    if (extension && supportedExtensions.includes(extension)) {
      return { valid: true };
    }

    return { 
      valid: false, 
      error: `File type "${file.type || 'unknown'}" (${extension ? `.${extension}` : 'no extension'}) is not supported`
    };
  }
}

export const chatService = new ChatService();