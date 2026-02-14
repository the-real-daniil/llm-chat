import { useCallback } from 'react';
import { Message } from '@/types/chat';

export const useFileUtils = () => {
  const extractFilesFromMessage = useCallback((userMessage: Message): File[] => {
    const files: File[] = [];

    userMessage.content.forEach((item) => {
      if (item.file?.file instanceof File) {
        files.push(item.file.file);
        return;
      }

      if (item.file?.name && item.file?.base64) {
        try {
          const dataUrl = `data:${item.file.type};base64,${item.file.base64}`;
          const file = dataUrlToFile(dataUrl, item.file.name);
          if (file) files.push(file);
        } catch (err) {
          console.error('❌ не удалось воссоздать файл из base64', item.file.name, err);
        }
        return;
      }

      if (item.image_url?.url?.startsWith('data:')) {
        try {
          const url = item.image_url.url;
          const mimeMatch = url.match(/data:([^;]+);/);
          const ext = mimeMatch ? mimeMatch[1].split('/').pop() : 'png';
          const filename = `image.${ext}`;

          const file = dataUrlToFile(url, filename);
          if (file) files.push(file);
        } catch (err) {
          console.error('❌ Не удалось создать файл из image_url:', err);
        }
      }
    });

    return files;
  }, []);

  const getMessageText = useCallback((message: Message): string => {
    return message.content
      .filter((item) => item.type === 'text')
      .map((item) => item.text)
      .join('');
  }, []);

  const findPreviousUserMessage = useCallback(
    (messages: Message[], currentMessageId: string | number) => {
      const currentIndex = messages.findIndex((m) => m.id === currentMessageId);

      if (currentIndex === -1) {
        return null;
      }

      for (let i = currentIndex - 1; i >= 0; i--) {
        if (messages[i].sender === 'user') {
          return messages[i];
        }
      }

      return null;
    },
    [],
  );
  const dataUrlToFile = (dataUrl: string, filename: string): File | null => {
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
  return {
    extractFilesFromMessage,
    getMessageText,
    findPreviousUserMessage,
    dataUrlToFile,
  };
};
