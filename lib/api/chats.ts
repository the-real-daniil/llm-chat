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
  static async getChats(limit: number = CHATS_LIMIT, cursor?: string): Promise<ChatsResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (cursor) {
      params.append('cursor', cursor);
    }
    const res = await fetch(`${API_BASE}/chats?${params.toString()}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch chats');
    }

    const data = await res.json();

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

    const res = await fetch(`${API_BASE}/chats/create`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (res.status !== 201) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create chat');
    }

    const response: CreateChatResponse = await res.json();
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
    const res = await fetch(`${API_BASE}/chats/${chatId}/messages?${params.toString()}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (res.status === 404) {
      throw new Error('Chat not found');
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch messages');
    }

    const data = await res.json();

    return {
      data: data.data || [],
      nextCursor: data.nextCursor || null,
    };
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
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
    const clientMessageId = generateUUID();
    const body: SendMessageRequest = {
      content: content.trim(),
      model: options?.model || 'qwen/qwen3-vl-235b-a22b-thinking',
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      clientMessageId: clientMessageId,
    };
    if (options?.attachments && options.attachments.length > 0) {
      body.attachments = options.attachments;
    }

    const res = await fetch(`${API_BASE}/chats/${chatId}/sendMessage`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (res.status === 404) {
      throw new Error('Chat not found');
    }
    if (res.status === 409) {
      throw new Error('Idempotency conflict');
    }
    if (res.status === 502) {
      throw new Error('OpenRouter error');
    }
    if (res.status === 504) {
      throw new Error('OpenRouter timeout');
    }
    if (res.status !== 201) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to send message');
    }

    const response: SendMessageResponse = await res.json();

    return {
      userMessage: response.data.userMessage,
      assistantMessage: response.data.assistantMessage,
    };
  }
}
