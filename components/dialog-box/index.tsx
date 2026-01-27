"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { MessagesList } from "./messages-list";
import { MessageInput } from "./message-input";
import MainHeader from "../main-area/main-header";

const DialogBox = () => {
  const {
    messages,
    isLoading,
    inputText,
    setInputText,
    handleSendWithFilesAndText,
    activeChatId,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleResend = (e: CustomEvent) => {
      console.log(
        "👂 [DialogBox] Событие 'resend-user-message' поймано",
        e.detail,
      );
      const { messageId } = e.detail;
      console.log("Повторяем сообщение ", messageId);
      if (!messageId) return;

      const userMessage = messages.find(
        (m) => String(m.id) === String(messageId),
      );
      if (!userMessage) {
        console.log(
          "❌ [DialogBox] Сообщение не найдено в messages:",
          messageId,
        );
        return;
      }

      const text = userMessage.content.map((item) => item.text).join("");

      // Для отправки в handleSendWithFilesAndText
      const files: File[] = [];

      const dataUrlToFile = (dataUrl: string, filename: string): File => {
        const arr = dataUrl.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";

        const base64String = arr[1];
        const byteString = atob(base64String);

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeType });
        return new File([blob], filename, { type: mimeType });
      };

      userMessage.content.forEach((item) => {
        // 1. Обычные файлы (PDF, TXT и т.д.)
        if (item.file?.file) {
          files.push(item.file.file);
        } else if (item.file?.name && item.file?.base64) {
          try {
            const dataurl = `data:${item.file.type};base64,${item.file.base64}`;
            const file = dataUrlToFile(dataurl, item.file.name);
            files.push(file);
          } catch (err) {
            console.error(
              "не удаллось воссоздать файл из base64",
              item.file.name,
              err,
            );
          }
        }
        // 2. Изображения, добавленные как image_url
        if (item.image_url?.url) {
          try {
            // Извлекаем расширение для имени
            const url = item.image_url.url;
            const mimeMatch = url.match(/:(.*?);/);
            const ext = mimeMatch
              ? mimeMatch[1].split("/").pop()?.split(";")[0]
              : "png";
            const filename = `image.${ext}`;

            const file = dataUrlToFile(url, filename);
            files.push(file);
          } catch (err) {
            console.error("❌ Не удалось создать файл из image_url:", err);
          }
        }
      });
      // Отправляем
      console.log("📤 Отправляем файлы:", files);
      handleSendWithFilesAndText(text, files);
    };

    window.addEventListener(
      "resend-user-message",
      handleResend as EventListener,
    );

    return () => {
      window.removeEventListener(
        "resend-user-message",
        handleResend as EventListener,
      );
    };
  }, [messages, handleSendWithFilesAndText]);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-shrink-0  bg-white z-10">
        <MainHeader />
      </div>

      <div className="flex-1 overflow-y-auto px-8 md:px-32 lg:px-40 py-4">
        <MessagesList messages={messages} key={activeChatId} />
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0  bg-white z-10">
        <MessageInput
          inputText={inputText}
          isLoading={isLoading}
          onInputChange={setInputText}
          handleSendWithFilesAndText={handleSendWithFilesAndText}
        />
      </div>
    </div>
  );
};

export default DialogBox;
