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
        avatar: "ai-photo.jpg",
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
    <div className="flex flex-col h-[calc(100%-64px)] pl-32 pr-32">
      <div className="flex-1 p-4 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <div className="space-y-2 max-w-4xl mx-auto">
          <div className="text-center"></div>
          {/* Сообщения */}
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex justify-start mb-1 p-4 ml-40 mr-40 ${
                    message.sender === "ai"
                      ? "border border-solid rounded-lg"
                      : ""
                  }`}
                >
                  <div className="mr-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow">
                      <img
                        src={message.avatar}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col max-w-[80%]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {message.sender === "user"
                          ? "Mauro Sicard"
                          : "LanguageGUI"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp}
                      </span>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap text-sm">
                      {message.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Якорь для автоматической прокрутки */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white p-4 text-gray-500 border-t">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2 border border-gray-300 rounded-2xl p-1 shadow-sm">
            <div className="flex-1 pl-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="How can I help you?"
                className="w-full py-2 resize-none focus:outline-none text-sm"
                rows={1}
                disabled={isLoading}
                style={{ minHeight: "40px", maxHeight: "100px" }}
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2.5 m-1 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 11 11" fill="none">
                <path
                  d="M10.5164 0.262479C10.2772 0.023263 9.92882 -0.0594891 9.60894 0.0434294L0.622343 2.9321C0.280903 3.04197 0.044469 3.33126 0.00552683 3.688C-0.0334153 4.04404 0.135566 4.37783 0.445017 4.55794L3.62715 6.41395L6.37604 3.66435C6.5798 3.4606 6.91011 3.4606 7.11386 3.66435C7.31761 3.8681 7.31761 4.19842 7.11386 4.40217L4.36427 7.15176L6.22028 10.3339C6.38369 10.6134 6.67228 10.7782 6.99008 10.7782C7.02346 10.7782 7.05753 10.7762 7.09161 10.7727C7.44765 10.7337 7.73763 10.4973 7.84681 10.1566L10.7362 1.17067C10.8391 0.848697 10.7549 0.501 10.5164 0.262479Z"
                  fill="currentColor"
                />
              </svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogBox;
