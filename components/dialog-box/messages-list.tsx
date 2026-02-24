import { Message } from '@/types/chat';
import MessageItem from './message-item';

interface MessagesListProps {
  messages: Message[];
  handleResend: (message: Message) => void;
}

export const MessagesList = ({ messages, handleResend }: MessagesListProps) => {
  return (
    <>
      <div className="space-y-1">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} handleResend={handleResend} />
        ))}
      </div>
    </>
  );
};
