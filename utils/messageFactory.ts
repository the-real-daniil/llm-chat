import { FileAttachment, Message, MessageContent } from '@/types/chat';

export class MessageFactory {
  static createUserMessage(text: string, files?: FileAttachment[]): Message {
    const content: MessageContent[] = [];
    if (text.trim()) {
      content.push({ type: 'text', text: text.trim() });
    }
    if (files && files.length > 0) {
      files.forEach((file) => {
        if (file.type.startsWith('image/')) {
          content.push({
            type: 'image_url',
            image_url: {
              url: `data:${file.type};base64,${file.base64}`,
            },
          });
        } else if (file.type.startsWith('audio/')) {
          const format = file.name.split('.').pop()?.toLowerCase() || 'wav';
          content.push({
            type: 'input_audio',
            input_audio: {
              data: file.base64,
              format: format,
            },
          });
        } else {
          content.push({
            type: 'file',
            file: {
              name: file.name,
              type: file.type,
              size: file.size,
              file: file.file,
              base64: file.base64,
            },
          });
        }
      });
    }
    return {
      id: Date.now(),
      content,
      sender: 'user',
      timestamp: this.formatTimestamp(),
      avatar: '/profile-photo.jpg',
    };
  }

  static createAIMessage(text: string): Message {
    return {
      id: Date.now() + 1,
      content: [{ type: 'text', text }],
      sender: 'ai',
      timestamp: this.formatTimestamp(),
      avatar: '/ai-photo.jpg',
    };
  }

  static createErrorMessage(): Message {
    return {
      id: Date.now() + 1,
      content: [
        {
          type: 'text',
          text: 'Извините, произошла ошибка соединения. Пожалуйста, попробуйте еще раз.',
        },
      ],
      sender: 'ai',
      timestamp: this.formatTimestamp('time'),
      avatar: '🤖',
    };
  }

  static generateInitialTitle(firstMessage: string): string {
    const cleanText = firstMessage.trim();
    if (cleanText.length <= 30) return cleanText;
    return cleanText.substring(0, 30) + '...';
  }

  static async createFileAttachment(file: File): Promise<FileAttachment> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const daraUrl = reader.result as string;
        const base64String = daraUrl.split(',')[1];
        const format = this.getFileFormat(file.type);
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          file: file,
          base64: base64String,
        });
      };
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsDataURL(file);
    });
  }

  private static getFileFormat(mimeType: string): 'pdf' | 'image_url' | 'text' | 'unknown' {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('image')) return 'image_url';
    if (mimeType.includes('text')) return 'text';
    return 'unknown';
  }

  private static formatTimestamp(format: 'full' | 'time' = 'full'): string {
    const date = new Date();

    if (format === 'time') {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}
