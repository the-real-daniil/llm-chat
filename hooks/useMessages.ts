'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChatsApi } from '@/lib/api/chats';
import { Chat, Message, Attachment, CHATS_LIMIT } from '@/types/chat';
import { useParams } from 'next/navigation';

export const useChats = () => {
  const params = useParams();
  const nowChatId = params.id as string;

  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [loadedChatId, setLoadedChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatsError, setChatsError] = useState<string | null>(null);

  const createChat = useCallback(async (title?: string | null) => {
    try {
      setChatsError(null);
      const newChat = await ChatsApi.createChat(title);
      setChats((prev) => [newChat, ...prev]);
      setLoadedChatId(newChat.id);
      return newChat.id;
    } catch (err) {
      setChatsError(err instanceof Error ? err.message : 'Failed to create chat');
      throw err;
    }
  }, []);

  const sendMessage = useCallback(
    async (
      chatId: string,
      content: string,
      options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
        attachments?: Attachment[];
      },
    ) => {
      if (!chatId) return console.error('НЕТ АЙДИ ЧАТА ДЛЯ ОТПРАВКИ СООБЩЕНИЯ');
      if (!content.trim() && (!options?.attachments || options.attachments.length === 0))
        return console.error('НИЧЕГО НЕТ В СООБЩЕНИИ ДЛЯ ЛЛМ');
      setIsSending(true);
      setMessagesError(null);

      try {
        const tempUserMessage: Message = {
          id: `temp-${Date.now()}`,
          chatId: chatId,
          role: 'user',
          content: content,
          status: 'pending',
          createdAt: new Date().toISOString(),

          attachments: options?.attachments || [],
        };

        setMessages((prev) => [...prev, tempUserMessage]);
        const { userMessage, assistantMessage } = await ChatsApi.sendMessage(
          chatId,
          content,
          options,
        );
        setMessages((prev) =>
          prev
            .filter((msg) => msg.id !== tempUserMessage.id)
            .concat([userMessage, assistantMessage]),
        );
        const eventStorage = new CustomEvent('updateChats', { bubbles: true });
        window.dispatchEvent(eventStorage);
        setLoadedChatId(chatId);
      } catch (err) {
        setMessagesError(err instanceof Error ? err.message : 'Failed to send message');
        setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('temp-')));
      } finally {
        setIsSending(false);
      }
    },

    [],
  );

  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const response = await ChatsApi.getMessages(chatId, 50);
      setMessages(response.data);
      setMessagesError(null);
    } catch (err) {
      setMessagesError(err instanceof Error ? err.message : 'Failed to load messages');
    }
  }, []);
  useEffect(() => {
    if (nowChatId && nowChatId !== loadedChatId) {
      loadMessages(nowChatId).then(() => {
        setLoadedChatId(nowChatId);
      });
    }
  }, [nowChatId, loadedChatId, loadMessages]);

  return {
    messages,
    isSending,
    messagesError,

    createChat,

    sendMessage,
    loadMessages,
  };
};
