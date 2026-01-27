"use client";
import Button from "../ui/button";
import ProfileBar from "./profile-bar";
import PlusIcon from "@/assets/icons/plus-icon";
import { useRouter } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { useState, useEffect } from "react";
import { ChatInfo } from "@/utils/storage/MessageStorageService";
import { useStorage } from "@/utils/storage/storageContext";

const SideBar = () => {
  const storage = useStorage();
  const router = useRouter();

  const { loadChat, activeChatId, clearActiveChat } = useChat();
  const [chats, setChats] = useState<ChatInfo[]>([]);

  useEffect(() => {
    const loadChats = () => {
      const loadedChats = storage.getChatsList();
      setChats(loadedChats);
    };

    loadChats();

    const handleStorageChange = () => {
      loadChats();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleNewChat = () => {
    router.push("/");
  };

  const handleOpenChat = (chatId: string) => {
    loadChat(chatId);

    router.push(`/chat?chat=${chatId}`);
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storage.deleteChat(chatId);

    const updatedChats = storage.getChatsList();
    setChats(updatedChats);

    if (activeChatId === chatId) {
      clearActiveChat();
      router.push("/");
    }
  };

  return (
    <div className="w-[300px] h-full p-4 flex flex-col border-r border-gray-200">
      <ProfileBar />

      <div className="flex-1 overflow-auto mt-4">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Chat History</h3>
          {chats.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No chats yet</p>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex justify-between items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                    activeChatId === chat.id
                      ? "bg-blue-50 border border-blue-200"
                      : ""
                  }`}
                  onClick={() => handleOpenChat(chat.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm">
                      {chat.title || "New Chat"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {chat.lastMessage || "No messages"}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="ml-2 text-gray-400 hover:text-red-500 p-1"
                    title="Delete chat"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button
        label="Start new chat"
        icon={<PlusIcon />}
        onClickButton={handleNewChat}
        className="h-10 w-full mt-4"
      />
    </div>
  );
};

export default SideBar;
