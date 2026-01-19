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
    handleSend,
    handleKeyPress,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-shrink-0  bg-white z-10">
        <MainHeader />
      </div>

      <div className="flex-1 overflow-y-auto px-8 md:px-32 lg:px-40 py-4">
        <MessagesList messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0  bg-white z-10">
        <MessageInput
          inputText={inputText}
          isLoading={isLoading}
          onInputChange={setInputText}
          onSend={handleSend}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
};

export default DialogBox;
