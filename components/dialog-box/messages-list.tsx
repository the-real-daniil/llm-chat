"use client";

import { Message } from "@/types/chat";
import MessageItem from "./message-item";
import { memo } from "react";

interface MessagesListProps {
  messages: Message[];
}

export const MessagesList = memo(({ messages }: MessagesListProps) => {
  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-6 text-sm">
        Напишите что-нибудь, чтобы начать.
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center my-3">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="mx-3 text-xs text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-200">
          {messages[0].timestamp.split(", ")[0]}
        </span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      <div className="space-y-1">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>
    </>
  );
});

MessagesList.displayName = "MessagesList";
