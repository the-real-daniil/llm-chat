"use client";
import { useEffect, useRef, useState } from "react";
import { sendToAI } from "@/lib/ai-service2";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  avatar: string;
}

interface DialogBoxProps {
  initialMessage?: string;
}

const DialogBox = ({ initialMessage = "" }: DialogBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialMessage.trim() && !isLoading) {
      handleSendMessage(initialMessage);
      initialMessage = " ";
    }
  }, []);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;

    if (!textToSend.trim() || isLoading) return;

    if (!customText) {
      setInputText("");
    }

    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      avatar: "profile-photo.jpg",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponseText = await sendToAI(textToSend);

      // 3. Добавляем ответ AI
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        avatar: "🤖",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);

      // 4. Добавляем сообщение об ошибке
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Извините, произошла ошибка соединения. Пожалуйста, попробуйте еще раз.",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        avatar: "🤖",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      () => handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col max-h-[90vh] ">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "ai" ? "justify-start" : "justify-end"
              } gap-2`}
            >
              {message.sender === "ai" && (
                <>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm">{message.avatar}</span>
                  </div>
                  <div className="max-w-[70%]">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {message.text}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block ml-2">
                      {message.timestamp}
                    </span>
                  </div>
                </>
              )}

              {message.sender === "user" && (
                <>
                  <div className="max-w-[70%] text-right">
                    <div className="bg-blue-500 text-white rounded-2xl rounded-tr-none px-4 py-3">
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block mr-2">
                      {message.timestamp}
                    </span>
                  </div>
                  <img
                    src={message.avatar}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </>
              )}
            </div>
          ))}

          {/* Якорь для автоматической прокрутки */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Поле ввода */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <div className="flex-1 relative text-gray-500">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Введите сообщение..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2 text-xs text-gray-400">
              Enter для отправки
            </div>
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Отправить
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          AI может иногда ошибаться. Проверяйте важную информацию.
        </div>
      </div>
    </div>
  );
};

export default DialogBox;
