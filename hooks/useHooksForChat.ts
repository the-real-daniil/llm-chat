import { AIError, sendToAI } from '@/lib/ai-service';
import { FileAttachment, Message } from '@/types/chat';
import { STORAGE_KEYS } from '@/utils/constants';
import { MessageFactory } from '@/utils/messageFactory';
import { useStorage } from '@/utils/storage/storageContext';
import { useCallback } from 'react';

interface MessageInputProps {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsSending: (isSending: boolean) => void;
  setInputText: (text: string) => void;
}

export const useHooksForChat = ({ setMessages, setIsSending, setInputText }: MessageInputProps) => {
  const storage = useStorage();

  const createNewChat = useCallback(() => {
    const newChatId = `chat_${Date.now()}`;
    const key = `${STORAGE_KEYS.CHAT_PREFIX}${newChatId}`;
    try {
      localStorage.setItem(key, JSON.stringify([]));
    } catch (error) {}
    return newChatId;
  }, [storage]);

  const handleSendMessage = async (text: string, files: File[]) => {
    setIsSending(true);
    try {
      const attachments = files.length
        ? await Promise.all(files.map((file) => MessageFactory.createFileAttachment(file)))
        : undefined;

      const userMessage = MessageFactory.createUserMessage(text.trim(), attachments);
      updateMessagesInState(userMessage);
      setInputText('');
      const aiResponseText = await sendMessage(text.trim(), attachments || []);
      updateMessagesInState(aiResponseText);
    } catch (error) {
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = async (text: string, files: FileAttachment[]): Promise<Message> => {
    try {
      const aiResponseText = await sendToAI(text, files);
      const aiMessage = MessageFactory.createAIMessage(aiResponseText);

      return aiMessage;
    } catch (error) {
      const aiError =
        error instanceof AIError
          ? error
          : new AIError(error instanceof Error ? error.message : 'Неизвестная ошибка', 'UNKNOWN');
      const errorMessage = MessageFactory.createAIMessage(`Ошибка: ${aiError.message}`);
      return errorMessage;
    }
  };
  const updateMessagesInState = (newMessages: Message) => {
    setMessages((prev: Message[]) => [...prev, newMessages]);
  };

  return {
    createNewChat,
    handleSendMessage,
  };
};
