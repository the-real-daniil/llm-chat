"use client";
import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { MessagesList } from "./messages-list";
import { MessageInput } from "./message-input";

const DialogBox = () => {
  const {
    messages,
    isLoading,
    inputText,
    setInputText,
    handleSend,
    handleKeyPress,
  } = useChat();

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100%-64px)]">
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto [&::-webkit-scrollbar]:hidden"
      >
        <MessagesList messages={messages} />
      </div>

      <MessageInput
        inputText={inputText}
        isLoading={isLoading}
        onInputChange={setInputText}
        onSend={handleSend}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default DialogBox;
