import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatsApi } from '@/lib/api/chats';
import { chatKeys } from './keys';
import { Message, Attachment, MessagesResponse } from '@/types/chat';
import { DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from '@/config/constants';
export const useMessagesQuery = (chatId: string) => {
  return useQuery({
    queryKey: chatKeys.messages(chatId),

    queryFn: () => ChatsApi.getMessages(chatId, 50),

    enabled: !!chatId,

    staleTime: 1000 * 60 * 5,
  });
};

export const useSendMessageMutation = (chatId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, attachments }: { content: string; attachments?: Attachment[] }) =>
      ChatsApi.sendMessage(chatId, content, {
        attachments,
        model: DEFAULT_MODEL,
        temperature: DEFAULT_TEMPERATURE,
        maxTokens: DEFAULT_MAX_TOKENS,
      }),

    onMutate: async ({ content, attachments }) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.messages(chatId) });

      const previousMessages = queryClient.getQueryData<MessagesResponse>(
        chatKeys.messages(chatId),
      );

      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        chatId,
        role: 'user',
        content,
        status: 'pending',
        createdAt: new Date().toISOString(),
        attachments: attachments || [],
      };

      queryClient.setQueryData<MessagesResponse>(chatKeys.messages(chatId), (old) => {
        if (!old) return { data: [tempMessage], nextCursor: null };
        return {
          ...old,
          data: [...old.data, tempMessage],
        };
      });

      return { previousMessages };
    },

    onSuccess: (result, variables, context) => {
      const { userMessage, assistantMessage } = result;

      queryClient.setQueryData<MessagesResponse>(chatKeys.messages(chatId), (old) => {
        if (!old) return { data: [userMessage, assistantMessage], nextCursor: null };

        const filtered = old.data.filter((msg) => !msg.id.startsWith('temp-'));

        return {
          ...old,
          data: [...filtered, userMessage, assistantMessage],
        };
      });

      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },

    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(chatKeys.messages(chatId), context.previousMessages);
      }
    },
  });
};
