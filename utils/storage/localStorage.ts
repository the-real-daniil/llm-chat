// utils/storage/localStorage.ts
import { Message } from "@/types/chat";
import { STORAGE_KEYS } from "../constants";

export interface ChatInfo {
  id: string;
  title: string;
  updatedAt: number;
  lastMessage?: string;
  messageCount: number;
}

export class StorageService {
  // Сохранение сообщений и обновление информации о чате
  static saveMessages(chatId: string, messages: Message[]): void {
    try {
      const key = `${STORAGE_KEYS.CHAT_PREFIX}${chatId}`;
      localStorage.setItem(key, JSON.stringify(messages));

      // ОБНОВЛЯЕМ ИНФОРМАЦИЮ О ЧАТЕ
      this.updateChatInfo(chatId, messages);

      console.log(`Сохранено ${messages.length} сообщений для чата ${chatId}`);
    } catch (error) {
      console.log("Ошибка сохранения в localStorage:", error);
    }
  }

  // Обновление информации о чате
  static updateChatInfo(chatId: string, messages: Message[]): void {
    try {
      const chats = this.getChatsList();

      // Если в чате нет сообщений, удаляем его из списка (если он там есть)
      if (messages.length === 0) {
        const filteredChats = chats.filter((chat) => chat.id !== chatId);
        localStorage.setItem(STORAGE_KEYS.CHATS_LIST, JSON.stringify(filteredChats));
        return;
      }

      // Находим или создаем чат
      let chatInfo = chats.find((chat) => chat.id === chatId);

      if (!chatInfo) {
        // Создаем новый чат только если есть сообщения
        chatInfo = {
          id: chatId,
          title: this.generateChatTitle(messages),
          updatedAt: Date.now(),
          lastMessage:
            messages.length > 0 ? messages[messages.length - 1].text : "",
          messageCount: messages.length,
        };
        chats.unshift(chatInfo); // Новые чаты в начало
      } else {
        // Обновляем существующий чат
        chatInfo.title = this.generateChatTitle(messages);
        chatInfo.updatedAt = Date.now();
        chatInfo.lastMessage =
          messages.length > 0 ? messages[messages.length - 1].text : "";
        chatInfo.messageCount = messages.length;

        // Перемещаем обновленный чат в начало
        const index = chats.indexOf(chatInfo);
        if (index > 0) {
          chats.splice(index, 1);
          chats.unshift(chatInfo);
        }
      }

      // Сохраняем обновленный список чатов
      localStorage.setItem(STORAGE_KEYS.CHATS_LIST, JSON.stringify(chats));
    } catch (error) {
      console.error("Ошибка обновления информации о чате:", error);
    }
  }

  // Генерация заголовка чата на основе сообщений
  private static generateChatTitle(messages: Message[]): string {
    if (messages.length === 0) return "New Chat";

    // Используем первое пользовательское сообщение как заголовок
    const firstUserMessage = messages.find((msg) => msg.sender === "user");
    if (firstUserMessage) {
      const text = firstUserMessage.text;
      return text.length > 30 ? text.substring(0, 30) + "..." : text;
    }

    return `Chat with ${messages.length} messages`;
  }

  // Получение списка всех чатов
  static getChatsList(): ChatInfo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHATS_LIST);
      const chats: ChatInfo[] = data ? JSON.parse(data) : [];
      
      // Фильтруем чаты без сообщений
      const validChats = chats.filter((chat) => {
        const messages = this.loadMessages(chat.id);
        return messages.length > 0;
      });
      
      // Если были удалены пустые чаты, сохраняем обновленный список
      if (validChats.length !== chats.length) {
        localStorage.setItem(STORAGE_KEYS.CHATS_LIST, JSON.stringify(validChats));
      }
      
      return validChats;
    } catch (error) {
      console.error("Ошибка загрузки списка чатов:", error);
      return [];
    }
  }

  // Удаление чата
  static deleteChat(chatId: string): void {
    try {
      // Удаляем сообщения чата
      const key = `${STORAGE_KEYS.CHAT_PREFIX}${chatId}`;
      localStorage.removeItem(key);

      // Удаляем из списка чатов
      const chats = this.getChatsList();
      const filteredChats = chats.filter((chat) => chat.id !== chatId);
      localStorage.setItem(
        STORAGE_KEYS.CHATS_LIST,
        JSON.stringify(filteredChats)
      );
    } catch (error) {
      console.error("Ошибка удаления чата:", error);
    }
  }

  // Остальные методы остаются без изменений...
  static loadMessages(chatId: string): Message[] {
    try {
      const key = `${STORAGE_KEYS.CHAT_PREFIX}${chatId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error("Ошибка загрузки из localStorage:", err);
      return [];
    }
  }

  static saveActiveChat(chatId: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT, chatId);
  }

  static getActiveChat(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT);
  }

  static clearActiveChat(): void {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT);
  }

  static clearLS(): void {
    localStorage.clear();
  }
}
