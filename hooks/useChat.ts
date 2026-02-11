import { useCallback, useState, useEffect } from 'react';
import { MessageFactory } from '@/utils/messageFactory';
import { useChatMessages } from './useChatMessages';
import { useChatSender } from './useChatSender';
import { STORAGE_KEYS } from '@/utils/constants';

import { useStorage } from '@/utils/storage/storageContext';

export const useChat = () => {
  const storage = useStorage();
  const [inputText, setInputText] = useState('');

  const { messages, isLoading: isLoadingMessages, addMessage } = useChatMessages();
  const { isSending, sendMessage } = useChatSender();

  const createNewChat = useCallback(() => {
    const newChatId = `chat_${Date.now()}`;

    const key = `${STORAGE_KEYS.CHAT_PREFIX}${newChatId}`;
    try {
      localStorage.setItem(key, JSON.stringify([]));
    } catch (error) {
      console.log('Ошибка создания чата:', error);
    }

    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 100);

    return newChatId;
  }, [storage]);
  const handleSendWithFilesAndText = async (chatId: string, text: string, files: File[]) => {
    if (!text.trim() && files.length === 0) return;

    try {
      const attachments = files.length
        ? await Promise.all(files.map((file) => MessageFactory.createFileAttachment(file)))
        : undefined;

      const userMessage = MessageFactory.createUserMessage(text.trim(), attachments);
      addMessage(chatId, userMessage);
      setInputText('');

      const aiResponseText = await sendMessage(text.trim(), attachments || []);
      addMessage(chatId, aiResponseText);
    } catch (error) {
      console.error('Ошибка отправки:', error);
    }
  };

  return {
    messages,
    isLoading: isLoadingMessages || isSending,
    inputText,

    setInputText,
    createNewChat,

    handleSendWithFilesAndText,
  };
};
