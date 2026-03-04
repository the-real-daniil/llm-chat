'use client';
import { AttachIcon } from '@/assets/icons/attach-icon';
import SendIcon from '@/assets/icons/send-icon';
import Button from '@/components/ui/button';
import { Attachment, SendMessageRequest } from '@/types/chat';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';

interface MessageInputProps {
  inputText: string;
  isSending: boolean;
  onInputChange: (text: string) => void;
  sendMessage: (chatId: string, content: string, attachments?: Attachment[]) => Promise<void>;
}

export const MessageInput = ({
  inputText,
  isSending,
  onInputChange,

  sendMessage,
}: MessageInputProps) => {
  const params = useParams();
  const chatId = params.id as string;

  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    try {
      const attachments = await Promise.all(files.map(fileToAttachment));
      setSelectedAttachments((prev) => [...prev, ...attachments]);
    } catch (error) {
      console.error('Error processing files:', error);
    }

    e.target.value = '';
  };
  const removeAttachment = (index: number) => {
    setSelectedAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const fileToAttachment = (file: File): Promise<Attachment> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64Data = reader.result as string;
        const base64 = base64Data.split(',')[1];

        let type: 'image' | 'file' | 'audio' = 'file';
        if (file.type.startsWith('image/')) {
          type = 'image';
        } else if (file.type.startsWith('audio/')) {
          type = 'audio';
        }

        const attachment: Attachment = {
          type: type,
          mimeType: file.type,
          data: base64,
          name: file.name,
          size: file.size,
          url: base64Data,
          status: 'pending',
        };

        resolve(attachment);
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };
  const handleSendMessage = async () => {
    await sendMessage(chatId, inputText, selectedAttachments);
    setSelectedAttachments([]);
    onInputChange('');
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

            {selectedAttachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedAttachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="text-xs bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <button
                      onClick={() => removeAttachment(index)}
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
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Выберите файл"
                />
                <AttachIcon />
              </div>
            </div>

            <Button
              label="Send"
              onClickButton={handleSendMessage}
              disabled={isSending || (!inputText.trim() && selectedAttachments.length === 0)}
              className="px-4 py-2.5 m-1 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
              icon={<SendIcon />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
