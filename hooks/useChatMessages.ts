import { Message } from '@/types/chat';
import { useStorage } from '@/utils/storage/storageContext';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export const useChatMessages = () => {
  const params = useParams();
  const nowActiveChat = params.id as string;

  const storage = useStorage();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(!!nowActiveChat);
  const prevChatIdRef = useRef<string | null | undefined>(null);
  const loadMessages = async (needLoadChatId: string | null) => {
    if (!needLoadChatId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const loadedMessages = storage.loadMessagesFromStorage(needLoadChatId);
      setMessages(loadedMessages);

      return;
    } catch (error) {
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (nowActiveChat !== prevChatIdRef.current) {
      prevChatIdRef.current = nowActiveChat;
      loadMessages(nowActiveChat);
    }
  }, [nowActiveChat, storage]);

  const addMessage = (id: string, message: Message) => {
    const oldMessage = storage.loadMessagesFromStorage(id);
    oldMessage.push(message);
    try {
      storage.saveMessages(id, oldMessage);
      loadMessages(id);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  return {
    messages,
    isLoading,
    addMessage,
    loadMessages,
  };
};
