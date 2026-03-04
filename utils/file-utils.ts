import { Message, Attachment } from '@/types/chat';

export const attachmentToFile = (attachment: Attachment): File | null => {
  try {
    if (attachment.url && attachment.url.startsWith('data:')) {
      return dataUrlToFile(attachment.url, attachment.name || 'file');
    }

    if (attachment.data && attachment.mimeType) {
      const dataUrl = `data:${attachment.mimeType};base64,${attachment.data}`;
      return dataUrlToFile(dataUrl, attachment.name || 'file');
    }

    return null;
  } catch (err) {
    console.error('❌ Ошибка конвертации attachment в File:', err);
    return null;
  }
};

export const getImageUrl = (attachment: Attachment): string => {
  if (attachment.url) {
    return attachment.url;
  }

  if (attachment.data && attachment.mimeType) {
    return `data:${attachment.mimeType};base64,${attachment.data}`;
  }

  return '';
};

export const isImage = (attachment: Attachment): boolean => {
  return attachment.type === 'image' || attachment.mimeType?.startsWith('image/');
};

export const isAudio = (attachment: Attachment): boolean => {
  return attachment.type === 'audio' || attachment.mimeType?.startsWith('audio/');
};

export const isFile = (attachment: Attachment): boolean => {
  return (
    attachment.type === 'file' ||
    (!attachment.mimeType?.startsWith('image/') && !attachment.mimeType?.startsWith('audio/'))
  );
};

export const getFileIcon = (attachment: Attachment): string => {
  if (isAudio(attachment)) return '🎵';
  if (attachment.mimeType?.includes('pdf')) return '📄';
  if (attachment.mimeType?.includes('word') || attachment.mimeType?.includes('document'))
    return '📝';
  if (attachment.mimeType?.includes('text')) return '📃';
  if (attachment.mimeType?.includes('zip') || attachment.mimeType?.includes('rar')) return '📦';
  return '📎';
};

export const getFileSize = (size?: number): string => {
  if (!size) return '';

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const extractFilesFromMessage = (userMessage: Message): File[] => {
  const files: File[] = [];

  userMessage.attachments?.forEach((attachment) => {
    const file = attachmentToFile(attachment);
    if (file) files.push(file);
  });

  return files;
};

export const getMessageText = (message: Message): string => {
  return message.content;
};

export const findPreviousUserMessage = (messages: Message[], currentMessageId: string) => {
  const currentIndex = messages.findIndex((m) => m.id === currentMessageId);

  if (currentIndex === -1) {
    return null;
  }

  for (let i = currentIndex - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      return messages[i];
    }
  }

  return null;
};

export const dataUrlToFile = (dataUrl: string, filename: string): File | null => {
  try {
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.error('❌ Неверный формат data URL');
      return null;
    }

    const mimeType = matches[1];
    const base64String = matches[2];

    const byteCharacters = atob(base64String);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: mimeType });
    return new File([blob], filename, { type: mimeType });
  } catch (error) {
    console.error('❌ Ошибка в dataUrlToFile:', error);
    return null;
  }
};
