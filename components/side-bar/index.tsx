// components/side-bar/index.tsx
"use client";
import ChatHistory from "./chat-history";
import Button from "../ui/button";
import ProfileBar from "./profile-bar";
import PlusIcon from "@/assets/icons/plus-icon";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { useState, useEffect } from "react";
import { StorageService, ChatInfo } from "@/utils/storage/localStorage";

const SideBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { createNewChat, loadChat, activeChatId, clearActiveChat } = useChat();
  const [chats, setChats] = useState<ChatInfo[]>([]);

  // Загружаем список чатов
  useEffect(() => {
    const loadChats = () => {
      const loadedChats = StorageService.getChatsList();
      setChats(loadedChats);
    };

    loadChats();

    // Слушаем изменения в localStorage
    const handleStorageChange = () => {
      loadChats();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleNewChat = () => {
    // Активный чат остается сохраненным в localStorage
    // Просто переходим на главную страницу для отображения empty state
    router.push("/");
  };

  const handleOpenChat = (chatId: string) => {
    loadChat(chatId);

    // Всегда переходим на страницу /chat с параметром chat
    router.push(`/chat?chat=${chatId}`);
  };

  // Удаление чата
  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.deleteChat(chatId);

    // Обновляем список
    const updatedChats = StorageService.getChatsList();
    setChats(updatedChats);

    // Если удаляем активный чат, очищаем его и показываем empty state
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
