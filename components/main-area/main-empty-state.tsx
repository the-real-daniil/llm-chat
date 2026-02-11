'use client';
import { useState } from 'react';
import PaperPlaneIcon from '../../assets/icons/paper-plane-icon';
import Button from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useChat } from '@/hooks/useChat';

const MainEmptyState = () => {
  const name = 'Mauro Sicard';
  const [areaTextValue, setAreaTextValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();
  const { handleSendWithFilesAndText, createNewChat } = useChat();
  const handleSend = () => {
    const textToSend = areaTextValue.trim();
    if (!textToSend || isSending) return;

    setIsSending(true);
    const newChatId = createNewChat();

    try {
      router.push(`/chats/${newChatId}`);
      handleSendWithFilesAndText(newChatId, textToSend, []);
      // window.location.reload();
    } catch (error) {
      router.push('/');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex justify-center items-center mt-10 px-4">
      <div
        className={`flex flex-col items-center justify-center rounded-3xl
         w-[775px] h-[235px] p-11 border border-gray-400
          bg-gradient-to-b from-white-200 via-purple-200 to-blue-200 shadow-lg`}>
        <h1 className="text-2xl text-gray-600 font-bold">Welcome back, {name}</h1>
        <h4 className="text-gray-600 mt-2">Напиши мне, пожалуйста</h4>
        <div className="relative flex-1 w-full">
          <textarea
            onKeyDown={handleKeyPress}
            placeholder="Сообщение для супер-пупер-дупер-мега нейронки!!!"
            className="w-full h-18 resize-none pl-4 pr-14 overflow-hidden rounded-lg border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:text-gray-600"
            value={areaTextValue}
            onChange={(e) => setAreaTextValue(e.target.value)}
            disabled={isSending}
          />
          <Button
            label=""
            disabled={!areaTextValue.trim() || isSending}
            className="absolute right-0 bottom-4 bg-white hover:bg-white cursor-pointer disabled:cursor-not-allowed "
            onClickButton={handleSend}
            icon={<PaperPlaneIcon />}
          />
        </div>
      </div>
    </div>
  );
};
export default MainEmptyState;
