import { StreamResponse, FunctionCall, FunctionResponse } from '../services/chatService';

export interface ParsedMessageContent {
  type: 'text' | 'function_call' | 'function_response';
  content: string;
  functionCall?: FunctionCall;
  functionResponse?: FunctionResponse;
  timestamp: number;
}

export interface ParsedMessage {
  id: string;
  role: 'user' | 'model';
  content: ParsedMessageContent[];
  isStreaming: boolean;
  finishReason?: string;
  timestamp: number;
}

class ADKParser {
  private messageCounter = 0;

  parseStreamResponse(response: StreamResponse): ParsedMessageContent[] {
    const parsedContent: ParsedMessageContent[] = [];

    if (response.content?.parts) {
      for (const part of response.content.parts) {
        const timestamp = Date.now();

        if (part.text) {
          parsedContent.push({
            type: 'text',
            content: part.text,
            timestamp,
          });
        }

        if (part.functionCall) {
          parsedContent.push({
            type: 'function_call',
            content: this.formatFunctionCall(part.functionCall),
            functionCall: part.functionCall,
            timestamp,
          });
        }

        if (part.functionResponse) {
          parsedContent.push({
            type: 'function_response',
            content: this.formatFunctionResponse(part.functionResponse),
            functionResponse: part.functionResponse,
            timestamp,
          });
        }
      }
    }

    return parsedContent;
  }

  createMessage(
    role: 'user' | 'model',
    content: string | ParsedMessageContent[],
    isStreaming = false
  ): ParsedMessage {
    this.messageCounter++;
    
    let parsedContent: ParsedMessageContent[];
    
    if (typeof content === 'string') {
      parsedContent = [{
        type: 'text',
        content,
        timestamp: Date.now(),
      }];
    } else {
      parsedContent = content;
    }

    return {
      id: `msg_${this.messageCounter}_${Date.now()}`,
      role,
      content: parsedContent,
      isStreaming,
      timestamp: Date.now(),
    };
  }

  updateMessage(message: ParsedMessage, newContent: ParsedMessageContent[]): ParsedMessage {
    return {
      ...message,
      content: [...message.content, ...newContent],
      timestamp: Date.now(),
    };
  }

  finalizeMessage(message: ParsedMessage, finishReason?: string): ParsedMessage {
    return {
      ...message,
      isStreaming: false,
      finishReason,
    };
  }

  private formatFunctionCall(functionCall: FunctionCall): string {
    const argsStr = Object.keys(functionCall.args).length > 0 
      ? JSON.stringify(functionCall.args, null, 2)
      : '{}';
    
    return `🔧 Calling function: ${functionCall.name}\nArguments:\n${argsStr}`;
  }

  private formatFunctionResponse(functionResponse: FunctionResponse): string {
    let resultStr: string;
    
    try {
      if (typeof functionResponse.result === 'string') {
        resultStr = functionResponse.result;
      } else {
        resultStr = JSON.stringify(functionResponse.result, null, 2);
      }
    } catch (error) {
      resultStr = 'Error formatting response';
    }

    return `✅ Function result:\n${resultStr}`;
  }

  // Utility method to extract all text content from a message
  getMessageText(message: ParsedMessage): string {
    return message.content
      .filter(part => part.type === 'text')
      .map(part => part.content)
      .join(' ');
  }

  // Utility method to get function calls from a message
  getFunctionCalls(message: ParsedMessage): FunctionCall[] {
    return message.content
      .filter(part => part.type === 'function_call' && part.functionCall)
      .map(part => part.functionCall!)
      .filter(Boolean);
  }

  // Utility method to get function responses from a message
  getFunctionResponses(message: ParsedMessage): FunctionResponse[] {
    return message.content
      .filter(part => part.type === 'function_response' && part.functionResponse)
      .map(part => part.functionResponse!)
      .filter(Boolean);
  }

  // Utility method to check if message has streaming content
  hasStreamingContent(message: ParsedMessage): boolean {
    return message.isStreaming || message.content.some(part => 
      part.type === 'function_call' && !message.content.some(
        response => response.type === 'function_response' && 
                   response.functionResponse?.id === part.functionCall?.id
      )
    );
  }
}

export const adkParser = new ADKParser();