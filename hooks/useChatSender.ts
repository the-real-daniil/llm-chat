import { sendToAI, AIError } from "@/lib/ai-service";
import { Message } from "@/types/chat";
import { MessageFactory } from "@/utils/messageFactory";
import { useCallback, useState } from "react";

export const useChatSender = () => {
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(
    async (
      text: string,
      onSuccess: (message: Message) => void,
      onError?: (error: AIError) => void
    ): Promise<void> => {
      if (!text.trim() || isSending) return;

      setIsSending(true);

      try {
        const aiResponseText = await sendToAI(text);
        const aiMessage = MessageFactory.createAIMessage(aiResponseText);
        onSuccess(aiMessage);
      } catch (error) {
        const aiError =
          error instanceof AIError
            ? error
            : new AIError(
                error instanceof Error ? error.message : "Неизвестная ошибка",
                "UNKNOWN"
              );

        // Создаем сообщение об ошибке с более информативным текстом
        const errorMessage = MessageFactory.createAIMessage(
          `Ошибка: ${aiError.message}`
        );
        onSuccess(errorMessage);

        if (onError) {
          onError(aiError);
        }
      } finally {
        setIsSending(false);
      }
    },
    [isSending]
  );

  return {
    isSending,
    sendMessage,
  };
};
