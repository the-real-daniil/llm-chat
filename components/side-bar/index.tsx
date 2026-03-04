'use client';
import Button from '../ui/button';
import ProfileBar from './profile-bar';
import PlusIcon from '@/assets/icons/plus-icon';
import { useRouter } from 'next/navigation';

import { Chat } from '@/types/chat';
import { useChatsInfiniteQuery, useCreateChatMutation } from '@/hooks/queries/useChatsQuery';

const SideBar = () => {
  const router = useRouter();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } =
    useChatsInfiniteQuery();
  const { mutate: createChat, isPending: isCreating } = useCreateChatMutation();
  const chats: Chat[] = data?.pages.flatMap((page) => page.data) || [];
  const handleNewChat = () => {
    router.push('/');
  };
  const handleOpenChat = (chatId: string) => {
    router.push(`/chats/${chatId}`);
  };
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="w-[300px] h-full p-4 flex flex-col border-r border-gray-200">
      <ProfileBar />

      <div className="flex-1 overflow-auto mt-4">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Chat History</h3>

          {isLoading ? (
            <p className="text-gray-500 text-sm italic">Loading chats...</p>
          ) : chats.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No chats yet</p>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex justify-between items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => handleOpenChat(chat.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm">{chat.title || 'New Chat'}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {chat.lastMessagePreview || 'No messages'}
                    </div>
                  </div>
                </div>
              ))}

              {isFetchingNextPage && (
                <p className="text-gray-400 text-sm text-center py-2">Loading more...</p>
              )}
            </div>
          )}
        </div>
      </div>

      {hasNextPage && (
        <div className="px-4 pb-2">
          <Button
            label={isFetchingNextPage ? 'Loading...' : 'Load more chats'}
            onClickButton={handleLoadMore}
            disabled={isFetchingNextPage}
            className="w-full text-sm"
          />
        </div>
      )}

      <Button
        label={isCreating ? 'Creating...' : 'Start new chat'}
        icon={<PlusIcon />}
        onClickButton={handleNewChat}
        disabled={isCreating}
        className="h-10 w-full mt-4"
      />
    </div>
  );
};

export default SideBar;
