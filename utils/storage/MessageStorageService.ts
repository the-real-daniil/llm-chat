import { Message } from "@/types/chat";
import { STORAGE_KEYS } from "../constants";

export interface ChatInfo {
  id: string;
  title: string;
  updatedAt: number;
  lastMessage?: string;
  messageCount: number;
}
interface IStorge {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  readonly length: number;
  key(index: number): string | null;
}

const localStorageProvider: IStorge = {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  },
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  },
  removeItem(key: string): void {
    localStorage.removeItem(key);
  },
  clear(): void {
    localStorage.clear();
  },
  get length(): number {
    return localStorage.length;
  },
  key(index: number): string | null {
    return localStorage.key(index);
  },
};
const getMessageText = (message: Message): string => {
  const textContent = message.content?.find((item) => item.type === "text");
  return textContent?.text || "";
};
export class MessageStorageService {
  private storage: IStorge;
  constructor(storage: IStorge = localStorageProvider) {
    this.storage = storage;
  }

  saveMessages(chatId: string, messages: Message[]): void {
    try {
      const key = `${STORAGE_KEYS.CHAT_PREFIX}${chatId}`;
      this.storage.setItem(key, JSON.stringify(messages));

      this.updateChatInfo(chatId, messages);

      console.log(`Сохранено ${messages.length} сообщений для чата ${chatId}`);
    } catch (error) {
      console.log("Ошибка сохранения в localStorage:", error);
    }
  }

  updateChatInfo(chatId: string, messages: Message[]): void {
    try {
      const chats = this.getChatsList();

      if (messages.length === 0) {
        const filteredChats = chats.filter((chat) => chat.id !== chatId);
        this.storage.setItem(
          STORAGE_KEYS.CHATS_LIST,
          JSON.stringify(filteredChats)
        );
        return;
      }

      let chatInfo = chats.find((chat) => chat.id === chatId);

      if (!chatInfo) {
        chatInfo = {
          id: chatId,
          title: this.generateChatTitle(messages),
          updatedAt: Date.now(),
          lastMessage:
            messages.length > 0
              ? getMessageText(messages[messages.length - 1])
              : "",
          messageCount: messages.length,
        };
        chats.unshift(chatInfo);
      } else {
        chatInfo.title = this.generateChatTitle(messages);
        chatInfo.updatedAt = Date.now();
        chatInfo.lastMessage =
          messages.length > 0
            ? getMessageText(messages[messages.length - 1])
            : "";
        chatInfo.messageCount = messages.length;

        const index = chats.indexOf(chatInfo);
        if (index > 0) {
          chats.splice(index, 1);
          chats.unshift(chatInfo);
        }
      }

      this.storage.setItem(STORAGE_KEYS.CHATS_LIST, JSON.stringify(chats));
    } catch (error) {
      console.error("Ошибка обновления информации о чате:", error);
    }
  }

  private generateChatTitle(messages: Message[]): string {
    if (messages.length === 0) return "New Chat";

    const firstUserMessage = messages.find((msg) => msg.sender === "user");
    if (firstUserMessage) {
      const text = getMessageText(firstUserMessage);
      return text.length > 30 ? text.substring(0, 30) + "..." : text;
    }

    return `Chat with ${messages.length} messages`;
  }

  getChatsList(): ChatInfo[] {
    try {
      const data = this.storage.getItem(STORAGE_KEYS.CHATS_LIST);
      const chats: ChatInfo[] = data ? JSON.parse(data) : [];

      const validChats = chats.filter((chat) => {
        const messages = this.loadMessages(chat.id);
        return messages.length > 0;
      });

      if (validChats.length !== chats.length) {
        this.storage.setItem(
          STORAGE_KEYS.CHATS_LIST,
          JSON.stringify(validChats)
        );
      }

      return validChats;
    } catch (error) {
      console.error("Ошибка загрузки списка чатов:", error);
      return [];
    }
  }

  deleteChat(chatId: string): void {
    try {
      const key = `${STORAGE_KEYS.CHAT_PREFIX}${chatId}`;
      this.storage.removeItem(key);

      const chats = this.getChatsList();
      const filteredChats = chats.filter((chat) => chat.id !== chatId);
      this.storage.setItem(
        STORAGE_KEYS.CHATS_LIST,
        JSON.stringify(filteredChats)
      );
    } catch (error) {
      console.error("Ошибка удаления чата:", error);
    }
  }

  loadMessages(chatId: string): Message[] {
    try {
      const key = `${STORAGE_KEYS.CHAT_PREFIX}${chatId}`;
      const data = this.storage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error("Ошибка загрузки из this.storage:", err);
      return [];
    }
  }

  saveActiveChat(chatId: string): void {
    this.storage.setItem(STORAGE_KEYS.ACTIVE_CHAT, chatId);
  }

  getActiveChat(): string | null {
    return this.storage.getItem(STORAGE_KEYS.ACTIVE_CHAT);
  }

  clearActiveChat(): void {
    this.storage.removeItem(STORAGE_KEYS.ACTIVE_CHAT);
  }

  clearLS(): void {
    this.storage.clear();
  }
}
