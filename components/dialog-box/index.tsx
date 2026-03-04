'use client';

import { useEffect, useRef, useState } from 'react';
import { MessagesList } from './messages-list';
import { MessageInput } from './message-input';
import MainHeader from '../main-area/main-header';
import { useParams } from 'next/navigation';
import { Attachment, Message } from '@/types/chat';
import MainEmptyState from '../main-area/main-empty-state';
import { useMessagesQuery, useSendMessageMutation } from '@/hooks/queries/useMessagesQuery';
import {
  findPreviousUserMessage,
  extractFilesFromMessage,
  getMessageText,
} from '@/utils/file-utils';
import { useQueryClient } from '@tanstack/react-query';

const DialogBox = () => {
  const params = useParams();
  const chatId = params.id as string;
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messagesData, isLoading, error } = useMessagesQuery(chatId);
  const messages = messagesData?.data || [];
  const { mutate: sendMessage, isPending: isSending } = useSendMessageMutation(chatId);

  const queryClient = useQueryClient();
  useEffect(() => {
    const pendingMessage = queryClient.getQueryData<string>(['pendingMessage', chatId]);
    if (pendingMessage && messages.length === 0 && !isSending) {
      sendMessage({ content: pendingMessage, attachments: [] });
      queryClient.removeQueries({ queryKey: ['pendingMessage', chatId] });
    }
  }, [chatId, messages, sendMessage, queryClient, isSending]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (
    messageChatId: string,
    content: string,
    attachments?: Attachment[],
  ) => {
    if (messageChatId !== chatId) return;

    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    sendMessage({ content, attachments });
    setInputText('');
  };

  const handleResend = async (message: Message) => {
    const userMessage = findPreviousUserMessage(messages, message.id);
    if (!userMessage) return;

    const text = getMessageText(userMessage);
    const files = extractFilesFromMessage(userMessage);

    sendMessage({
      content: text,
      attachments: files.map((f) => ({
        name: f.name,
        mimeType: f.type,
        type: f.type.startsWith('image/') ? 'image' : 'file',
        size: f.size,
        data: (f as any).data,
      })),
    });
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center">Loading messages...</div>;
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        Error loading messages
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-shrink-0 bg-white z-10">
        <MainHeader />
      </div>

      {chatId ? (
        <>
          <div className="flex-1 overflow-y-auto px-8 md:px-32 lg:px-40 py-4">
            <MessagesList messages={messages} handleResend={handleResend} />
            <div ref={messagesEndRef} />
          </div>

          <div className="flex-shrink-0 bg-white z-10">
            <MessageInput
              inputText={inputText}
              isSending={isSending}
              onInputChange={setInputText}
              sendMessage={handleSendMessage}
            />
          </div>
        </>
      ) : (
        <MainEmptyState />
      )}
    </div>
  );
};

export default DialogBox;
