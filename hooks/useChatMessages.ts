import { Message } from "@/types/chat";
import { useStorage } from "@/utils/storage/storageContext";
import { useCallback, useEffect, useRef, useState } from "react";

export const useChatMessages = (chatId?: string | null) => {
  const storage = useStorage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(!!chatId);
  const prevChatIdRef = useRef<string | null | undefined>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) {
        setMessages([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const loadedMessages = storage.loadMessages(chatId);

        setMessages(loadedMessages);
      } catch (error) {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (chatId !== prevChatIdRef.current) {
      console.log(`🔄 ChatId изменился: ${prevChatIdRef.current} → ${chatId}`);
      prevChatIdRef.current = chatId;
      loadMessages();
    }
  }, [chatId]);

  const addMessage = useCallback((id: string, message: Message) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, message];

      try {
        storage.saveMessages(id, updatedMessages);
      } catch (error) {
        console.error("Ошибка сохранения:", error);
      }

      return updatedMessages;
    });
  }, []);

  const clearMessages = useCallback((id: string) => {
    setMessages([]);
    try {
      storage.saveMessages(id, []);
    } catch (error) {
      console.error("Ошибка очистки:", error);
    }
  }, []);

  const reloadMessages = useCallback(() => {
    if (!chatId) return;

    setIsLoading(true);
    try {
      const loadedMessages = storage.loadMessages(chatId);
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Ошибка перезагрузки сообщений:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  return {
    messages,
    isLoading,
    addMessage,
    clearMessages,
    reloadMessages,
    messageCount: messages.length,
  };
};
