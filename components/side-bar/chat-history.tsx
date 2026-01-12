// components/side-bar/chat-history.tsx (обновленная версия)
"use client";
import { useState, useEffect } from "react";
import { StorageService, ChatInfo } from "@/utils/storage/localStorage";

interface ChatHistoryProps {
  onSelectChat: (chatId: string) => void;
  activeChatId?: string | null;
}

const ChatHistory = ({ onSelectChat, activeChatId }: ChatHistoryProps) => {
  const [chats, setChats] = useState<ChatInfo[]>([]);

  useEffect(() => {
    const loadChats = () => {
      const loadedChats = StorageService.getChatsList();
      setChats(loadedChats);
    };

    loadChats();

    // Обновляем при изменениях в хранилище
    const interval = setInterval(loadChats, 2000); // Каждые 2 секунды

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-1">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`p-3 rounded-lg cursor-pointer transition-colors ${
            activeChatId === chat.id
              ? "bg-blue-50 border border-blue-200"
              : "hover:bg-gray-100"
          }`}
          onClick={() => onSelectChat(chat.id)}
        >
          <div className="font-medium text-sm truncate">
            {chat.title || "New Chat"}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>
              {chat.messageCount} message{chat.messageCount !== 1 ? "s" : ""}
            </span>
            <span>{new Date(chat.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
