import { useCallback, useState, useEffect } from "react";
import { MessageFactory } from "@/utils/messageFactory";
import { useChatMessages } from "./useChatMessages";
import { useChatSender } from "./useChatSender";
import { STORAGE_KEYS } from "@/utils/constants";
import { useSearchParams } from "next/navigation";
import { useStorage } from "@/utils/storage/storageContext";

export const useChat = () => {
  const storage = useStorage();
  const [inputText, setInputText] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const {
    messages,
    isLoading: isLoadingMessages,
    addMessage,
  } = useChatMessages(activeChatId);
  const { isSending, sendMessage } = useChatSender();

  useEffect(() => {
    try {
      const urlChatId = searchParams?.get("chat");
      if (urlChatId) {
        setActiveChatId(urlChatId);
        storage.saveActiveChat(urlChatId);
        return;
      }
    } catch (error) {}
    setActiveChatId(null);
  }, [searchParams]);

  const createNewChat = useCallback(() => {
    const newChatId = `chat_${Date.now()}`;

    const key = `${STORAGE_KEYS.CHAT_PREFIX}${newChatId}`;
    try {
      localStorage.setItem(key, JSON.stringify([]));
    } catch (error) {
      console.log("Ошибка создания чата:", error);
    }

    setActiveChatId(newChatId);
    storage.saveActiveChat(newChatId);

    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 100);

    return newChatId;
  }, []);

  const handleSend = useCallback(async () => {
    const textToSend = inputText.trim();
    if (!textToSend) return;

    let chatId = activeChatId;
    if (!chatId) {
      chatId = createNewChat();
    }

    const userMessage = MessageFactory.createUserMessage(textToSend);
    addMessage(chatId, userMessage);
    setInputText("");

    await sendMessage(textToSend, (aiMessage) => {
      addMessage(chatId, aiMessage);
    });
  }, [inputText, activeChatId, addMessage, sendMessage, createNewChat]);

  const sendMessageWithText = useCallback(
    async (text: string) => {
      const textToSend = text.trim();
      if (!textToSend) return;

      let chatId = activeChatId;
      if (!chatId) {
        chatId = createNewChat();
      }

      const userMessage = MessageFactory.createUserMessage(textToSend);
      addMessage(chatId, userMessage);

      await sendMessage(textToSend, (aiMessage) => {
        addMessage(chatId, aiMessage);
      });

      return chatId;
    },
    [activeChatId, addMessage, sendMessage, createNewChat]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const loadChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    storage.saveActiveChat(chatId);
  }, []);

  const clearActiveChat = useCallback(() => {
    setActiveChatId(null);
    storage.clearActiveChat();
  }, []);

  return {
    messages,
    isLoading: isLoadingMessages || isSending,
    inputText,
    activeChatId,

    setInputText,
    handleSend,
    handleKeyPress,
    createNewChat,
    loadChat,
    clearActiveChat,
    sendMessageWithText,
  };
};
