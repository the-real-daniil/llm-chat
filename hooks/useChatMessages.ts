import { Message } from "@/types/chat";
import { useStorage } from "@/utils/storage/storageContext";
import { useCallback, useEffect, useRef, useState } from "react";

export const useChatMessages = (chatId?: string | null) => {
  const storage = useStorage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(!!chatId);
  const prevChatIdRef = useRef<string | null | undefined>(null);
  useEffect(() => {
    console.log("✅ Компонент смонтирован");
    return () => console.log("🗑️ Компонент размонтирован");
  }, []);
  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) {
        setMessages([]);
        setIsLoading(false);
        console.log("вызав при переходе на null");
        return;
      }

      setIsLoading(true);
      try {
        console.log("выззвали загрузку");
        const loadedMessages = storage.loadMessagesFromStorage(chatId);
        setMessages(loadedMessages);
        console.log("загруженные сообщения", loadedMessages);
        return;
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
  }, [chatId, storage]);

  const addMessage = useCallback(
    (id: string, message: Message) => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, message];

        try {
          storage.saveMessages(id, updatedMessages);
        } catch (error) {
          console.error("Ошибка сохранения:", error);
        }

        return updatedMessages;
      });
    },
    [storage],
  );

  const clearMessages = useCallback(
    (id: string) => {
      setMessages([]);
      try {
        storage.saveMessages(id, []);
      } catch (error) {
        console.error("Ошибка очистки:", error);
      }
    },
    [storage],
  );

  return {
    messages,
    isLoading,
    addMessage,
    clearMessages,

    messageCount: messages.length,
  };
};
