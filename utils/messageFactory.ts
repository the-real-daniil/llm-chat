import { Message } from "@/types/chat";

export class MessageFactory {
  static createUserMessage(text: string): Message {
    return {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: this.formatTimestamp(),
      avatar: "/profile-photo.jpg",
    };
  }

  static createAIMessage(text: string): Message {
    return {
      id: Date.now() + 1,
      text,
      sender: "ai",
      timestamp: this.formatTimestamp(),
      avatar: "/ai-photo.jpg",
    };
  }

  static createErrorMessage(): Message {
    return {
      id: Date.now() + 1,
      text: "Извините, произошла ошибка соединения. Пожалуйста, попробуйте еще раз.",
      sender: "ai",
      timestamp: this.formatTimestamp("time"),
      avatar: "🤖",
    };
  }

  static generateInitialTitle(firstMessage: string): string {
    const cleanText = firstMessage.trim();
    if (cleanText.length <= 30) return cleanText;
    return cleanText.substring(0, 30) + "...";
  }
  private static formatTimestamp(format: "full" | "time" = "full"): string {
    const date = new Date();

    if (format === "time") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
}
