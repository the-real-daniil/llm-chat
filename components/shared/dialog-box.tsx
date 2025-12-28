"use client";
import { useEffect, useRef, useState } from "react";
import { sendToAI } from "@/lib/ai-service";

// Интерфейс для сообщения
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
  // Состояния
  const [messages, setMessages] = useState<Message[]>([]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоматическая прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Автоматически отправить initialMessage если он есть
  useEffect(() => {
    if (initialMessage.trim() && !isLoading) {
      handleSendMessage(initialMessage);
      initialMessage = " ";
    }
  }, []);

  // Функция отправки сообщения
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;

    // Проверка на пустое сообщение или уже идет загрузка
    if (!textToSend.trim() || isLoading) return;

    // Очищаем поле ввода
    if (!customText) {
      setInputText("");
    }

    // 1. Создаем и добавляем сообщение пользователя
    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      avatar: "👤",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 2. Отправляем запрос к нейронке
      console.log("Отправляю запрос к AI:", textToSend);
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
      console.log("Получен ответ от AI:", aiResponseText);
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

  // Обработка нажатия Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Очистка чата
  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Чат очищен. Чем могу помочь?",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        avatar: "🤖",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок чата */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-700">Чат с AI</h3>
        <button
          onClick={handleClearChat}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
        >
          Очистить чат
        </button>
      </div>

      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "ai" ? "justify-start" : "justify-end"
              } gap-2`}
            >
              {/* Аватар и сообщение AI */}
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

              {/* Сообщение пользователя */}
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
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-sm text-white">{message.avatar}</span>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Индикатор "AI печатает..." */}
          {isLoading && (
            <div className="flex justify-start gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

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
