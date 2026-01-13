// src/components/dialog-box/MessageInput.tsx
"use client";
import SendIcon from "@/assets/icons/send-icon";
import Button from "@/components/ui/button";
import { StorageService } from "@/utils/storage/localStorage";

interface MessageInputProps {
  inputText: string;
  isLoading: boolean;
  onInputChange: (text: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const MessageInput = ({
  inputText,
  isLoading,
  onInputChange,
  onSend,
  onKeyPress,
}: MessageInputProps) => {
  return (
    <div className="p-4 text-gray-500 px-8 md:px-32 lg:px-40">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-2 border border-gray-300 rounded-2xl p-1 shadow-sm">
          <div className="pl-3">
            <textarea
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyPress}
              placeholder="How can I help you?"
              className="w-full h-24 py-2 resize-none focus:outline-none text-sm overflow-hidden"
              rows={1}
              disabled={isLoading}
              style={{ minHeight: "40px", maxHeight: "100px" }}
            />
          </div>
          <div className="flex justify-end gap-2 max-w-[93%] ml-4 border-t items-end pt-2">
            <Button
              label="Send"
              onClickButton={onSend}
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2.5 m-1 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
              icon={<SendIcon />}
            />
           
          </div>
        </div>
      </div>
    </div>
  );
};
