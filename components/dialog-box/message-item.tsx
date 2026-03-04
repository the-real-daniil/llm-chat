import { Message } from '@/types/chat';
import Button from '../ui/button';
import CopyIcon from '@/assets/icons/copy-icon';
import ReplayIcon from '@/assets/icons/reply-icon';
import Image from 'next/image';
import { getFileIcon, getFileSize, getImageUrl, isFile, isImage } from '@/utils/file-utils';

interface MessageItemProps {
  message: Message;
  handleResend: (message: Message) => void;
}

const MessageItem = ({ message, handleResend }: MessageItemProps) => {
  const handleCopy = async () => {
    const text = message.content;
    try {
      await navigator.clipboard.writeText(text);
      console.log('Скопировано в буфер!');
    } catch (err) {
      console.error('Не удалось скопировать', err);
      console.log('Не удалось скопировать');
    }
  };

  const avatarSrc = message.role === 'user' ? '/profile-photo.jpg' : '/ai-photo.jpg';
  const avatarAlt = message.role === 'user' ? 'User avatar' : 'AI avatar';
  const formattedDate = new Date(message.createdAt).toLocaleTimeString();
  const images = message.attachments?.filter(isImage) || [];
  const files = message.attachments?.filter(isFile) || [];
  return (
    <div
      data-sender={message.role === 'user' ? 'user' : 'ai'}
      className={`flex items-start gap-3 px-4 py-2 max-w-full ${
        message.role === 'assistant' ? 'border border-gray-200 rounded-lg' : ''
      }`}>
      <div className="flex-shrink-0 w-8 h-8">
        <Image
          src={avatarSrc}
          width={32}
          height={32}
          alt={avatarAlt}
          className="w-8 h-8 rounded-full object-cover border border-white shadow"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900">
              {message.role === 'user' ? 'You' : 'AI'}
            </span>
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>
          {message.role === 'assistant' && (
            <div className="flex gap-1">
              <Button
                label=""
                className="p-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-blue-700 hover:text-gray-900"
                onClickButton={handleCopy}
                icon={<CopyIcon />}
              />
              <Button
                label=""
                icon={<ReplayIcon />}
                onClickButton={() => handleResend(message)}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-blue-700 hover:text-gray-900 min-w-0 w-8 h-8 flex items-center justify-center"
              />
            </div>
          )}
        </div>

        {message.content && (
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words mb-3">
            {message.content}
          </div>
        )}

        {images.length > 0 && (
          <div className={`grid gap-2 mb-3 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {images.map((img, index) => {
              const imgUrl = getImageUrl(img);

              return (
                <div key={index} className="relative cursor-pointer group">
                  <Image
                    src={imgUrl}
                    width={400}
                    height={300}
                    alt={'Image'}
                    className="rounded-lg border border-gray-200 shadow-sm object-cover w-full h-auto max-h-64"
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-2 mb-2">
            {files.map((file, index) => (
              <a
                key={index}
                href={getImageUrl(file) || '#'}
                download={file.name}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors max-w-md">
                <span className="text-2xl">{getFileIcon(file)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {file.name || 'Файл'}
                  </div>
                  {file.size && (
                    <div className="text-xs text-gray-500">{getFileSize(file.size)}</div>
                  )}
                </div>
                <span className="text-blue-600 text-sm">↓</span>
              </a>
            ))}
          </div>
        )}

        {message.status === 'pending' && (
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-2">
            <span className="animate-pulse">⏳</span> Отправка...
          </div>
        )}
        {message.status === 'failed' && (
          <div className="text-xs text-red-500 flex items-center gap-1 mt-2">
            <span>❌</span> Ошибка отправки
          </div>
        )}
      </div>
      {message.status === 'failed' && (
        <div className="text-xs text-red-500 flex items-center gap-1 mt-2">
          <span>❌</span> Ошибка отправки
        </div>
      )}
    </div>
  );
};

export default MessageItem;
