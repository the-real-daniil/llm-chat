import {
  Chat,
  ChatsResponse,
  CreateChatRequest,
  CreateChatResponse,
  CHATS_LIMIT,
  MessagesResponse,
  Message,
  SendMessageRequest,
  SendMessageResponse,
  Attachment,
} from '@/types/chat';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export class ChatsApi {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit,
    expectedStatus: number = 200,
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (res.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (res.status !== expectedStatus) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }

    if (res.status === 204) {
      return null as T;
    }

    return await res.json();
  }

  static async getChats(limit: number = CHATS_LIMIT, cursor?: string): Promise<ChatsResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (cursor) {
      params.append('cursor', cursor);
    }
    const data = await this.request<{ data: Chat[]; nextCursor: string | null }>(
      `/chats?${params.toString()}`,
      { method: 'GET' },
    );
    return {
      data: data.data || [],
      nextCursor: data.nextCursor || null,
    };
  }

  static async createChat(title?: string | null): Promise<Chat> {
    const body: CreateChatRequest = {};
    if (title) {
      body.title = title;
    }
    const response = await this.request<CreateChatResponse>(
      '/chats/create',
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      201,
    );
    return response.data;
  }

  static async getMessages(
    chatId: string,
    limit: number = 50,
    cursor?: string,
  ): Promise<MessagesResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (cursor) {
      params.append('cursor', cursor);
    }
    try {
      const data = await this.request<{ data: Message[]; nextCursor: string | null }>(
        `/chats/${chatId}/messages?${params.toString()}`,
        { method: 'GET' },
      );
      return {
        data: data.data || [],
        nextCursor: data.nextCursor || null,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Chat not found');
      }
      throw error;
    }
  }

  static async sendMessage(
    chatId: string,
    content: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      attachments?: Attachment[];
    },
  ): Promise<{ userMessage: Message; assistantMessage: Message }> {
    const generateUUID = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const clientMessageId = generateUUID();
    const body: SendMessageRequest = {
      content: content.trim(),
      model:
        options?.model ||
        process.env.NEXT_PUBLIC_OPENROUTER_MODEL ||
        'qwen/qwen3-vl-235b-a22b-thinking',
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      clientMessageId,
    };

    if (options?.attachments && options.attachments.length > 0) {
      body.attachments = options.attachments;
    }

    try {
      const response = await this.request<SendMessageResponse>(
        `/chats/${chatId}/sendMessage`,
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
        201,
      );
      return {
        userMessage: response.data.userMessage,
        assistantMessage: response.data.assistantMessage,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('409')) throw new Error('Idempotency conflict');
        if (error.message.includes('502')) throw new Error('OpenRouter error');
        if (error.message.includes('504')) throw new Error('OpenRouter timeout');
      }
      throw error;
    }
  }
}
