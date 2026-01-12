"use client";
import { Message } from "@/types/chat";
import MessageItem from "./message-item";
import { memo } from "react";

interface MessagesListProps {
  messages: Message[];
}

export const MessagesList = memo(({ messages }: MessagesListProps) => {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="h-full">
      <div className="space-y-2 max-w-4xl mx-auto">
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="mx-4 text-xs text-gray-500 bg-white px-4 py-1 rounded-full border border-gray-200">
            {messages[0].timestamp}
          </span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>
        <div className="space-y-6 text-gray-700">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
      </div>
    </div>
  );
});

MessagesList.displayName = "MessagesList";
