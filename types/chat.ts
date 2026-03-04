export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  messageCount: number;
}

export interface ChatsResponse {
  data: Chat[];
  nextCursor: string | null;
}

export interface CreateChatRequest {
  title?: string | null;
}

export interface CreateChatResponse {
  data: Chat;
}

export const CHATS_LIMIT = 20;

export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  status: 'ok' | 'pending' | 'failed';
  createdAt: string;
  attachments: Attachment[];

  llm?: {
    provider?: string | null;
    model?: string | null;
    requestId?: string | null;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
}

export interface Attachment {
  type: 'image' | 'file' | 'audio';
  mimeType: string;
  data?: string;
  url?: string;
  name: string;
  size: number;
  status?: 'pending' | 'uploaded' | 'error';
}

export interface MessagesResponse {
  data: Message[];
  nextCursor: string | null;
}

export interface SendMessageRequest {
  content: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  clientMessageId: string;
  attachments?: Attachment[];
}

export interface SendMessageResponse {
  data: {
    userMessage: Message;
    assistantMessage: Message;
  };
}
