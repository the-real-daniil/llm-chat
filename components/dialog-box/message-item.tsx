import { Message } from '@/types/chat';
import Button from '../ui/button';
import CopyIcon from '@/assets/icons/copy-icon';
import ReplayIcon from '@/assets/icons/reply-icon';
import Image from 'next/image';

interface MessageItemProps {
  message: Message;
}

const MessageItem = ({ message }: MessageItemProps) => {
  const handleCopy = async (message: Message) => {
    const text = message.content.map((item) => item.text).join('');
    try {
      await navigator.clipboard.writeText(text);
      alert('Скопировано в буфер!');
    } catch (err) {
      console.error('Не удалось скопировать', err);
      alert('Не удалось скопировать');
    }
  };
  const handleResend = () => {
    const allMessages = Array.from(document.querySelectorAll('[data-message-id]')).map((el) => ({
      id: el.getAttribute('data-message-id'),
      sender: el.getAttribute('data-sender'),
    }));

    const currentIndex = allMessages.findIndex((m) => m.id === String(message.id));

    if (currentIndex === -1) {
      console.log('❌ [handleResend] Текущее сообщение не найдено в DOM');
      return;
    }

    const userMessageBefore = [...allMessages]
      .slice(0, currentIndex)
      .reverse()
      .find((m) => m.sender === 'user');

    if (!userMessageBefore) {
      console.log('❌ [handleResend] Нет user-сообщения перед этим AI');
      return;
    }

    window.dispatchEvent(
      new CustomEvent('resend-user-message', {
        detail: { messageId: userMessageBefore.id },
      }),
    );
  };

  return (
    <div
      data-message-id={message.id}
      data-sender={message.sender === 'user' ? 'user' : 'ai'}
      className={`flex items-start gap-3 px-4 py-2 max-w-full ${
        message.sender === 'ai' ? 'border border-gray-200 rounded-lg' : ''
      }`}>
      <div className="flex-shrink-0 w-8 h-8">
        <Image
          src={message.avatar}
          width={4}
          height={4}
          alt={message.sender === 'user' ? 'User avatar' : 'AI avatar'}
          className="w-8 h-8 rounded-full object-cover border border-white shadow"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2 mb-1">
          <div>
            <span className="font-medium text-sm text-gray-900">
              {message.sender === 'user' ? 'You' : 'AI'}
            </span>
            <span className="text-xs text-gray-500">{message.timestamp}</span>
          </div>
          <div>
            {message.sender === 'ai' && (
              <div className="flex">
                <Button
                  label={''}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-blue-700 hover:text-gray-900"
                  onClickButton={() => handleCopy(message)}
                  icon={<CopyIcon />}
                />
                <Button
                  label=""
                  icon={<ReplayIcon />}
                  onClickButton={() => handleResend()}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-blue-700 hover:text-gray-900 min-w-0 w-8 h-8 flex items-center justify-center"
                />
              </div>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
          {message.content.map((item, index) => {
            if (item.type === 'text') {
              return (
                <div key={index} className="mb-1">
                  {item.text}
                </div>
              );
            }

            if (item.type === 'image_url' && item.image_url?.url) {
              return (
                <div key={index} className="mt-2">
                  <Image
                    src={item.image_url.url}
                    width={400}
                    height={400}
                    alt="Вложенное изображение"
                    className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                    loading="lazy"
                  />
                </div>
              );
            }
            if (item.type === 'file' && item.file?.file) {
              return (
                <div
                  key={index}
                  className="mt-2   p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm max-w-xs">
                  <span className="text-blue-600 text-lg">📄</span>
                  <div className="flex justify-between">
                    <span>{item.file.name}</span>
                    <span>{(Number(item.file.size) / 1024 / 8).toFixed(1) + 'mb'}</span>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
