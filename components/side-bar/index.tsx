'use client';
import Button from '../ui/button';
import ProfileBar from './profile-bar';
import PlusIcon from '@/assets/icons/plus-icon';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Chat } from '@/types/chat';
import { useLoadChats } from '@/hooks/useLoadChat';

const SideBar = () => {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const { loadChats } = useLoadChats({ setChats });
  useEffect(() => {
    const load = async () => {
      try {
        const cursor = await loadChats();
        setNextCursor(cursor);
      } finally {
      }
    };
    load();
    window.addEventListener('updateChats', load);
    return () => window.removeEventListener('updateChats', load);
  }, [loadChats]);

  const handleNewChat = () => {
    router.push('/');
  };

  const handleOpenChat = (chatId: string) => {
    router.push(`/chats/${chatId}`);
  };
  const handleLoadMore = async () => {
    if (!nextCursor) return;

    const cursor = await loadChats(nextCursor);
    setNextCursor(cursor);
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
                  className={`flex justify-between items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100`}
                  onClick={() => handleOpenChat(chat.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm">{chat.title || 'New Chat'}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {chat.lastMessagePreview || 'No messages'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {!!nextCursor && (
        <div className="text-black w-[300px]">
          <Button label={'Load more chats..'} onClickButton={handleLoadMore} />
        </div>
      )}
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
