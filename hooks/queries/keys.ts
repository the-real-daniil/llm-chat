export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};
export const chatKeys = {
  all: ['chats'] as const,

  lists: () => [...chatKeys.all, 'list'] as const,

  messages: (chatId: string) => ['messages', chatId] as const,
};
