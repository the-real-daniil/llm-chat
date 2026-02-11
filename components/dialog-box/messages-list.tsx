import { Message } from '@/types/chat';
import MessageItem from './message-item';

interface MessagesListProps {
  messages: Message[];
}

export const MessagesList = ({ messages }: MessagesListProps) => {
  return (
    <>
      <div className="flex items-center my-3">
        <div className="flex-1 border-t border-gray-200"></div>
        {/* <span className="mx-3 text-xs text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-200">
          {messages[0].timestamp.split(", ")[0]}
        </span> */}
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      <div className="space-y-1">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>
    </>
  );
};
