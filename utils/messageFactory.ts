import { FileAttachment, Message, MessageContent } from "@/types/chat";

export class MessageFactory {
  static createUserMessage(text: string, files?: FileAttachment[]): Message {
    const content: MessageContent[] = [];
    if (text.trim()) {
      content.push({ type: "text", text: text.trim() });
    }
    const docs =
      files?.filter(
        (f) =>
          f.type === "application/pdf" ||
          f.type === "text/plain" ||
          f.type === "application/msword" ||
          f.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) || [];
    docs.forEach((file) => {
      content.push({ type: "file", file });
    });
    const images = files?.filter((f) => f.type.startsWith("image/")) || [];
    images.forEach((file) => {
      content.push({
        type: "image_url",
        image_url: {
          url: `data.${file.type};base64,${file.base64}`,
        },
      });
    });
    const audio = files?.filter((f) => f.type.startsWith("audio/"));
    audio?.forEach((file) => {
      content.push({
        type: "input_audio",
        input_audio: {
          data: file.base64,
          format: file.name.split(".").pop() || "mp3",
        },
      });
    });
    return {
      id: Date.now(),
      content,
      sender: "user",
      timestamp: this.formatTimestamp(),
      avatar: "/profile-photo.jpg",
    };
  }

  static createAIMessage(text: string): Message {
    return {
      id: Date.now() + 1,
      content: [{ type: "text", text }],
      sender: "ai",
      timestamp: this.formatTimestamp(),
      avatar: "/ai-photo.jpg",
    };
  }

  static createErrorMessage(): Message {
    return {
      id: Date.now() + 1,
      content: [
        {
          type: "text",
          text: "Извините, произошла ошибка соединения. Пожалуйста, попробуйте еще раз.",
        },
      ],
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

  static async createFileAttachment(file: File): Promise<FileAttachment> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const daraUrl = reader.result as string;
        const base64String = daraUrl.split(",")[1];
        const format = this.getFileFormat(file.type);

        console.log(
          `📁 Создание FileAttachment: ${file.name}, тип: ${file.type}, формат: ${format}`
        );

        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          file: file,
          base64: base64String,
        });
      };
      reader.onerror = () => reject(new Error("Ошибка чтения файла"));
      reader.readAsDataURL(file);
    });
  }

  private static getFileFormat(
    mimeType: string
  ): "pdf" | "image" | "text" | "unknown" {
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.includes("image")) return "image";
    if (mimeType.includes("text")) return "text";
    return "unknown";
  }

  static createFileOnlyMessage(files: FileAttachment[]): Message {
    const content = files.map((file) => ({
      type: "file" as const,
      file,
    }));

    return {
      id: Date.now(),
      content,
      sender: "user",
      timestamp: this.formatTimestamp(),
      avatar: "/profile-photo.jpg",
    };
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
