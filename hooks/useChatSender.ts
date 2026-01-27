import { sendToAI, AIError } from "@/lib/ai-service";
import { FileAttachment, Message } from "@/types/chat";
import { MessageFactory } from "@/utils/messageFactory";
import { useCallback, useState } from "react";

export const useChatSender = () => {
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(
    async (
      text: string,
      files: FileAttachment[],
      onSuccess: (message: Message) => void,
      onError?: (error: AIError) => void,
    ): Promise<void> => {
      if (!text.trim() && files.length === 0) return;

      setIsSending(true);

      try {
        const aiResponseText = await sendToAI(text, files);
        const aiMessage = MessageFactory.createAIMessage(aiResponseText);
        onSuccess(aiMessage);
      } catch (error) {
        const aiError =
          error instanceof AIError
            ? error
            : new AIError(
                error instanceof Error ? error.message : "Неизвестная ошибка",
                "UNKNOWN",
              );

        const errorMessage = MessageFactory.createAIMessage(
          `Ошибка: ${aiError.message}`,
        );
        onSuccess(errorMessage);

        if (onError) {
          onError(aiError);
        }
      } finally {
        setIsSending(false);
      }
    },
    [],
  );

  return {
    isSending,
    sendMessage,
  };
};
