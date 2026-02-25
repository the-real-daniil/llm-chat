'use client';

import React, { useState, useCallback } from 'react';
import { ChatsApi } from '@/lib/api/chats';
import { Chat } from '@/types/chat';

interface useChatProps {
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

export const useLoadChats = ({ setChats }: useChatProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadChats = useCallback(async (cursor?: string, limit?: number) => {
    try {
      const response = await ChatsApi.getChats(limit, cursor);

      if (cursor) {
        setChats((prev) => [...prev, ...response.data]);
      } else {
        setChats(response.data);
      }

      return response.nextCursor;
    } catch (err) {
      console.error('Failed to load chats:', err);

      throw err;
    }
  }, []);

  return {
    loadChats,
  };
};
