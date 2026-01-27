import { useCallback, useState, useEffect } from "react";
import { MessageFactory } from "@/utils/messageFactory";
import { useChatMessages } from "./useChatMessages";
import { useChatSender } from "./useChatSender";
import { STORAGE_KEYS } from "@/utils/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useStorage } from "@/utils/storage/storageContext";

export const useChat = () => {
  const storage = useStorage();
  const [inputText, setInputText] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
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
  }, [searchParams, storage]);

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
  }, [storage]);
  const handleSendWithFilesAndText = useCallback(
    async (text: string, files: File[]) => {
      if (!text.trim() && files.length === 0) return;
      const chatId = storage.getActiveChat();
      console.log("записываем все в ", chatId);
      try {
        const attachments = files.length
          ? await Promise.all(
              files.map((file) => MessageFactory.createFileAttachment(file)),
            )
          : undefined;

        const userMessage = MessageFactory.createUserMessage(
          text.trim(),
          attachments,
        );
        addMessage(chatId, userMessage);
        setInputText("");
        console.log("добавили сообщение юзера", chatId);
        await sendMessage(text.trim(), attachments || [], (aiMessage) => {
          addMessage(chatId, aiMessage);
          console.log("добавили сообщение эай", chatId);
        });
      } catch (error) {
        console.error("Ошибка отправки:", error);
      }
    },
    [addMessage, sendMessage, storage],
  );

  const loadChat = useCallback(
    (chatId: string) => {
      setActiveChatId(chatId);
      storage.saveActiveChat(chatId);
    },
    [storage],
  );

  const clearActiveChat = useCallback(() => {
    setActiveChatId(null);
    storage.clearActiveChat();
  }, [storage]);

  return {
    messages,
    isLoading: isLoadingMessages || isSending,
    inputText,
    activeChatId,

    setInputText,
    createNewChat,
    loadChat,
    clearActiveChat,
    handleSendWithFilesAndText,
  };
};
