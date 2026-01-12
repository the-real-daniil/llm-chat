import { Message } from "@/types/chat";
import { StorageService } from "@/utils/storage/localStorage";
import { useCallback, useEffect, useRef, useState } from "react";

export const useChatMessages = (chatId?: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  // Начальное состояние isLoading зависит от наличия chatId
  const [isLoading, setIsLoading] = useState(!!chatId);
  const prevChatIdRef = useRef<string | null | undefined>(null); // Следим за предыдущим chatId

  // Загрузка сообщений при изменении chatId
  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) {
        setMessages([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {

        const loadedMessages = StorageService.loadMessages(chatId);

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

  // Добавление сообщения
  const addMessage = useCallback((id: string, message: Message) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, message];

      try {
        StorageService.saveMessages(id, updatedMessages);
      } catch (error) {
        console.error("Ошибка сохранения:", error);
      }

      return updatedMessages;
    });
  }, []);

  // Очистка сообщений
  const clearMessages = useCallback((id: string) => {
    setMessages([]);
    try {
      StorageService.saveMessages(id, []);
    } catch (error) {
      console.error("Ошибка очистки:", error);
    }
  }, []);

  // Принудительная перезагрузка сообщений
  const reloadMessages = useCallback(() => {
    if (!chatId) return;

    setIsLoading(true);
    try {
      const loadedMessages = StorageService.loadMessages(chatId);
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
