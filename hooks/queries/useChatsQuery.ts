import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatsApi } from '@/lib/api/chats';
import { chatKeys } from './keys';
import { ChatsResponse, CHATS_LIMIT, Chat } from '@/types/chat';

export const useChatsInfiniteQuery = () => {
  return useInfiniteQuery<ChatsResponse, Error>({
    queryKey: chatKeys.lists(),

    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as string | undefined;
      return await ChatsApi.getChats(CHATS_LIMIT, cursor);
    },

    initialPageParam: undefined,

    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,

    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateChatMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title?: string | null) => ChatsApi.createChat(title),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },

    onError: (error) => {
      console.error('Failed to create chat:', error);
    },
  });
};
