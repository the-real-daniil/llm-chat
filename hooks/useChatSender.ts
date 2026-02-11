import { sendToAI, AIError } from '@/lib/ai-service';
import { FileAttachment, Message } from '@/types/chat';
import { MessageFactory } from '@/utils/messageFactory';
import { useCallback, useState } from 'react';

export const useChatSender = () => {
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (text: string, files: FileAttachment[]): Promise<Message> => {
    setIsSending(true);

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
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    sendMessage,
  };
};
