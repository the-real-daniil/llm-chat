'use client';
import { useEffect, useRef, useState } from 'react';
import { MessagesList } from './messages-list';
import { MessageInput } from './message-input';
import MainHeader from '../main-area/main-header';
import { useParams } from 'next/navigation';
import { useChats } from '@/hooks/useMessages';
import { Attachment, Message } from '@/types/chat';
import { useFileUtils } from '@/hooks/useFileUtils';

const DialogBox = () => {
  const params = useParams();
  const chatId = params.id as string;
  const [inputText, setInputText] = useState('');

  const { messages, isSending, sendMessage } = useChats();
  const { extractFilesFromMessage, getMessageText, findPreviousUserMessage } = useFileUtils();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  const handleSendMessage = async (chatId: string, content: string, attachments?: Attachment[]) => {
    await sendMessage(chatId, content, {
      attachments: attachments,
      model: 'qwen/qwen3-vl-235b-a22b-thinking',
      temperature: 0.7,
      maxTokens: 1024,
    });
  };
  useEffect(() => {
    const handleFirstMessage = (event: CustomEvent) => {
      handleSendMessage(event.detail.chatId, event.detail.message);
    };

    window.addEventListener('firstMessageSended', handleFirstMessage as EventListener);

    return () => {
      window.removeEventListener('firstMessageSended', handleFirstMessage as EventListener);
    };
  }, [chatId]);
  const handleResend = async (message: Message) => {
    const userMessage = findPreviousUserMessage(messages, message.id);

    if (!userMessage) {
      console.error('Не найдено предыдущее сообщение пользователя');
      return;
    }

    const text = getMessageText(userMessage);

    const files = extractFilesFromMessage(userMessage);

    await sendMessage(chatId, text, {
      attachments: files.map((file) => ({
        name: file.name,
        type: file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('audio/')
            ? 'audio'
            : 'file',
        mimeType: file.type,
        size: file.size,

        status: 'pending',
      })),
      model: 'qwen/qwen3-vl-235b-a22b-thinking',
      temperature: 0.7,
      maxTokens: 1024,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-shrink-0  bg-white z-10">
        <MainHeader />
      </div>

      <div className="flex-1 overflow-y-auto px-8 md:px-32 lg:px-40 py-4">
        <MessagesList messages={messages} handleResend={handleResend} />
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0  bg-white z-10">
        <MessageInput
          inputText={inputText}
          isSending={isSending}
          onInputChange={setInputText}
          sendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default DialogBox;
