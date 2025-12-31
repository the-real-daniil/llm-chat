"use client";
import { useEffect, useRef, useState } from "react";
import { sendToAI } from "@/lib/ai-service";
import SendIcon from "@/assets/icons/send-icon";
import Button from "@/components/ui/button";

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
      timestamp: new Date().toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      avatar: "profile-photo.jpg",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponseText = await sendToAI(textToSend);

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date().toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        avatar: "ai-photo.jpg",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);

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
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100%-64px)] pl-32 pr-32">
      <div className="flex-1 p-4 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <div className="space-y-2 max-w-4xl mx-auto">
          {messages.length > 0 && (
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="mx-4 text-xs text-gray-500 bg-white px-4 py-1 rounded-full border border-gray-200">
                {messages[0].timestamp}
              </span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
          )}
          <div className="space-y-6 text-gray-700">
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex justify-start mb-1 p-4 ml-40 mr-40 ${
                    message.sender === "ai"
                      ? "border border-gray-300 border-solid rounded-lg shadow"
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
                    <p className="text-gray-500 whitespace-pre-wrap text-sm">
                      {message.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 text-gray-500 ml-40 mr-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-2 border border-gray-300 rounded-2xl p-1 shadow-sm">
            <div className=" pl-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="How can I help you?"
                className="w-full h-24 py-2 resize-none focus:outline-none text-sm overflow-hidden"
                rows={1}
                disabled={isLoading}
                style={{ minHeight: "40px", maxHeight: "100px" }}
              />
            </div>
            <div className="flex justify-end max-w-[93%] ml-4 border-t items-end">
              <Button
                label="Send"
                onClickButton={() => handleSendMessage()}
                disabled={isLoading || !inputText.trim()}
                className=" px-4 py-2.5 m-1 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
                icon={<SendIcon />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogBox;
