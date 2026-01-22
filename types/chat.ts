export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  file: File;
  base64: string;
}
export interface MessageContent {
  type: "text" | "file" | "image_url" | "input_audio";
  text?: string;
  file?: FileAttachment;
  image_url?: {
    url: string;
  };
  input_audio?: {
    data: string;
    format: string;
  };
}

export interface Message {
  id: number;
  content: MessageContent[];
  sender: "user" | "ai";
  timestamp: string;
  avatar: string;
}
export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: number;
  messageCount: number;
}

export interface ChatState {
  activeChatId: string | null;
  sessions: ChatSession[];
  isLoading: boolean;
}
