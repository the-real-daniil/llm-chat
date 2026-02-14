'use client';
import { useEffect, useRef, useState } from 'react';
import { MessagesList } from './messages-list';
import { MessageInput } from './message-input';
import MainHeader from '../main-area/main-header';
import { useParams } from 'next/navigation';
import { useStorage } from '@/utils/storage/storageContext';
import { Message } from '@/types/chat';
import { useHooksForChat } from '@/hooks/useHooksForChat';
import { useFileUtils } from '@/hooks/useFileUtils';

const DialogBox = () => {
  const storage = useStorage();
  const params = useParams();
  const chatId = params.id as string;
  const [messages, setMessages] = useState<Message[]>(() =>
    storage.loadMessagesFromStorage(chatId),
  );
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    storage.saveMessages(chatId, messages);
  }, [messages]);

  const { handleSendMessage } = useHooksForChat({
    setMessages,
    setIsSending,
    setInputText,
  });
  const { extractFilesFromMessage, getMessageText, findPreviousUserMessage, dataUrlToFile } =
    useFileUtils();
  useEffect(() => {
    const handleFirstMessage = (event: CustomEvent) => {
      if (event.detail.chatId !== chatId) {
        return;
      }

      handleSendMessage(event.detail.message, []);

      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 100);
    };
    window.addEventListener('firstMessageSended', handleFirstMessage as EventListener);
    return () => {
      window.removeEventListener('firstMessageSended', handleFirstMessage as EventListener);
    };
  }, []);

  const handleResend = async (message: Message) => {
    const userMessage = findPreviousUserMessage(messages, message.id);
    if (!userMessage) {
      return;
    }
    const text = getMessageText(userMessage);
    const files = extractFilesFromMessage(userMessage);
    handleSendMessage(text, files);
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
          handleSendWithFilesAndText={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default DialogBox;
