import { useCallback, useState, useEffect } from "react";
import { MessageFactory } from "@/utils/messageFactory";
import { useChatMessages } from "./useChatMessages";
import { useChatSender } from "./useChatSender";
import { StorageService } from "@/utils/storage/localStorage";
import { STORAGE_KEYS } from "@/utils/constants";
import { useSearchParams } from "next/navigation";

export const useChat = () => {
  const [inputText, setInputText] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const {
    messages,
    isLoading: isLoadingMessages,
    addMessage,
  } = useChatMessages(activeChatId);
  const { isSending, sendMessage } = useChatSender();

  // Загрузка активного чата при монтировании и из URL
  useEffect(() => {
    // Проверяем URL параметры
    try {
      const urlChatId = searchParams?.get("chat");
      if (urlChatId) {
        setActiveChatId(urlChatId);
        StorageService.saveActiveChat(urlChatId);
        return;
      }
    } catch (error) {

    }
    setActiveChatId(null);
  }, [searchParams]);

  // Создание нового чата с начальной записью
  const createNewChat = useCallback(() => {
    const newChatId = `chat_${Date.now()}`;

    const key = `${STORAGE_KEYS.CHAT_PREFIX}${newChatId}`;
    try {
      localStorage.setItem(key, JSON.stringify([]));
    } catch (error) {
      console.log("Ошибка создания чата:", error);
    }

    setActiveChatId(newChatId);
    StorageService.saveActiveChat(newChatId);

    // Принудительно обновляем UI
    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 100);

    return newChatId;
  }, []);

  // Отправка сообщения
  const handleSend = useCallback(async () => {
    const textToSend = inputText.trim();
    if (!textToSend) return;

    // Если нет активного чата, создаем новый
    let chatId = activeChatId;
    if (!chatId) {
      chatId = createNewChat();
    }

    // Создаем сообщение пользователя
    const userMessage = MessageFactory.createUserMessage(textToSend);
    addMessage(chatId, userMessage);
    setInputText("");

    // Отправляем AI
    await sendMessage(textToSend, (aiMessage) => {
      addMessage(chatId, aiMessage);
    });
  }, [inputText, activeChatId, addMessage, sendMessage, createNewChat]);

  // Отправка сообщения с текстом (для использования из других компонентов)
  const sendMessageWithText = useCallback(
    async (text: string) => {
      const textToSend = text.trim();
      if (!textToSend) return;

      // Если нет активного чата, создаем новый
      let chatId = activeChatId;
      if (!chatId) {
        chatId = createNewChat();
      }

      // Создаем сообщение пользователя
      const userMessage = MessageFactory.createUserMessage(textToSend);
      addMessage(chatId, userMessage);

      // Отправляем AI
      await sendMessage(textToSend, (aiMessage) => {
        addMessage(chatId, aiMessage);
      });

      return chatId;
    },
    [activeChatId, addMessage, sendMessage, createNewChat]
  );

  // Обработка нажатия клавиши
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Загрузка конкретного чата
  const loadChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    StorageService.saveActiveChat(chatId);
  }, []);

  // Очистка активного чата
  const clearActiveChat = useCallback(() => {
    setActiveChatId(null);
    StorageService.clearActiveChat();
  }, []);

  return {
    // Состояние
    messages,
    isLoading: isLoadingMessages || isSending,
    inputText,
    activeChatId,

    // Действия
    setInputText,
    handleSend,
    handleKeyPress,
    createNewChat,
    loadChat,
    clearActiveChat,
    sendMessageWithText,
  };
};
