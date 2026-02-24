'use client';
import { AttachIcon } from '@/assets/icons/attach-icon';
import SendIcon from '@/assets/icons/send-icon';
import Button from '@/components/ui/button';
import { useRef, useState } from 'react';

interface MessageInputProps {
  inputText: string;
  isSending: boolean;
  onInputChange: (text: string) => void;
  handleSendWithFilesAndText: (text: string, files: File[]) => Promise<void>;
}

export const MessageInput = ({
  inputText,
  isSending,
  onInputChange,

  handleSendWithFilesAndText,
}: MessageInputProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    await handleSendWithFilesAndText(inputText, selectedFiles);
    setSelectedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return (
    <div className="p-4 text-gray-500 px-8 md:px-32 lg:px-40">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-2 border border-gray-300 rounded-2xl p-1 shadow-sm">
          <div className="pl-3">
            <textarea
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can I help you?"
              className="w-full h-24 py-2 resize-none focus:outline-none text-sm overflow-hidden"
              rows={1}
              disabled={isSending}
              style={{ minHeight: '40px', maxHeight: '100px' }}
            />

            {selectedFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="text-xs bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    {file.type.includes('pdf') ? '📄' : file.type.includes('image') ? '🖼️' : '📎'}
                    <span className="font-medium truncate max-w-[150px]">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-500 hover:text-red-500 text-sm ml-1"
                      title="Удалить файл">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between gap-2 max-w-[93%] ml-4 border-t items-center pt-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Выберите файл"
                />
                <AttachIcon />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.mp3"
                multiple
                className="hidden"
              />
            </div>

            <Button
              label="Send"
              onClickButton={handleSendMessage}
              disabled={isSending || (!inputText.trim() && selectedFiles.length === 0)}
              className="px-4 py-2.5 m-1 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
              icon={<SendIcon />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
