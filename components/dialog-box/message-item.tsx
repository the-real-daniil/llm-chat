import { Message } from "@/types/chat";
import { memo } from "react";

interface MessageItemProps {
  message: Message;
}

const MessageItem = memo(({ message }: MessageItemProps) => {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-2 max-w-full ${
        message.sender === "ai" ? "border border-gray-200 rounded-lg" : ""
      }`}
    >
      <div className="flex-shrink-0 w-8 h-8">
        <img
          src={message.avatar}
          alt={message.sender === "user" ? "User avatar" : "AI avatar"}
          className="w-8 h-8 rounded-full object-cover border border-white shadow"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900">
            {message.sender === "user" ? "Вы" : "AI"}
          </span>
          <span className="text-xs text-gray-500">{message.timestamp}</span>
        </div>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
          {message.content.map((item, index) => {
            if (item.type === "text") {
              return (
                <div key={index} className="mb-1">
                  {item.text}
                </div>
              );
            }
            if (item.type === "file" && item.file) {
              return (
                <div
                  key={index}
                  className="mb-2 p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    {item.file.type === "pdf" ? (
                      "📄"
                    ) : item.file.type === "image" ? (
                      <div className="mt-2">
                        <img
                          src={item.image_url?.url}
                          alt="Загруженное изображение"
                          className="max-w-full h-auto riunded-lg border border-gray-200"
                          style={{ maxHeight: "400px" }}
                        />
                      </div>
                    ) : (
                      "📎"
                    )}
                    <span className="font-medium text-xs">
                      {item.file.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Прикрепленный файл
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
});

MessageItem.displayName = "MessageItem";

export default MessageItem;
