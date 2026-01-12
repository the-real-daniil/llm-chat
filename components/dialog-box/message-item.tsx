import { Message } from "@/types/chat";
import { memo } from "react";

interface MessageItemProps {
  message: Message;
}

const MessageItem = memo(({ message }: MessageItemProps) => {
  return (
    <div>
      <div
        className={`flex justify-start mb-1 p-4 px-8 md:px-32 lg:px-40 ${
          message.sender === "ai"
            ? "border border-gray-300 border-solid rounded-lg shadow"
            : ""
        }`}
      >
        <div className="mr-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow">
            <img
              src={message.avatar}
              alt={message.sender === "user" ? "User avatar" : "AI avatar"}
              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
            />
          </div>
        </div>
        <div className="flex flex-col max-w-[80%]">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {message.sender === "user" ? "Mauro Sicard" : "LanguageGUI"}
            </span>
            <span className="text-xs text-gray-500">{message.timestamp}</span>
          </div>
          <p className="text-gray-500 whitespace-pre-wrap text-sm">
            {message.text}
          </p>
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";

export default MessageItem;
