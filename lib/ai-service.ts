import { FileAttachment } from "@/types/chat";

interface ChatMessage {
  role: "ai" | "user" | "system";
  content: Array<{
    type: "text" | "file" | "image_url" | "input_audio";
    text?: string;
    file?: { filename: string; file_data: string };
    image_url?: { url: string };
    inpuy_audio?: {
      data: string;
      format: string;
    };
  }>;
}

interface AiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export class AIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AIError";
  }
}

export async function sendToAI(
  content: string,
  files?: FileAttachment[]
): Promise<string> {
  console.log("🚀 sendToAI вызвана!");
  console.log("📝 Текст:", content);
  console.log("📁 Файлы:", files);

  const apiKey = localStorage.getItem("openrouter_api_key");
  console.log("🔑 API ключ:", apiKey ? "✅ Найден" : "❌ Отсутствует");

  const model = process.env.NEXT_PUBLIC_OPENROUTER_MODEL;
  console.log("🤖 Модель:", model || "❌ Не настроена");
  const baseUrl = "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new AIError(
      "API ключ не настроен. Установите NEXT_PUBLIC_OPENROUTER_API_KEY в переменных окружения.",
      "MISSING_API_KEY"
    );
  }

  if (!model) {
    throw new AIError(
      "Модель не настроена. Установите NEXT_PUBLIC_OPENROUTER_MODEL в переменных окружения.",
      "MISSING_MODEL"
    );
  }

  if (!content.trim() && (!files || files.length === 0)) {
    throw new AIError("Сообщение не может быть пустым", "EMPTY_CONTENT");
  }

  // Формируем массив контента для сообщения
  const messageContent: ChatMessage["content"] = [];

  // Добавляем текстовую часть
  if (content.trim()) {
    messageContent.push({
      type: "text",
      text: content.trim(),
    });
  }

  // Добавляем файлы
  if (files && files.length > 0) {
    const docs = files.filter((f) => f.type.startsWith("application/"));
    docs.forEach((file) => {
      messageContent.push({
        type: "file",
        file: {
          filename: file.name,
          file_data: `data:${file.type};base64,${file.base64}`,
        },
      });
    });
    const images = files.filter((f) => f.type.startsWith("image/"));
    images.forEach((file) => {
      messageContent.push({
        type: "image_url",
        image_url: {
          url: `data:${file.type};base64,${file.base64}`,
        },
      });
    });
    const audio = files?.filter((f) => f.type.startsWith("audio/"));
    audio.forEach((file) => {
      const format = file.name.split(".").pop()?.toLowerCase();
      const validFormats = ["mp3", "wav", "aac", "flac", "webm"];
      const fmt = validFormats.includes(format || "") ? format : "mp3";
      messageContent.push({
        type: "input_audio",
        inpuy_audio: {
          data: file.base64,
          format: fmt!,
        },
      });
    });
  }

  console.log("📦 Сформированный контент сообщения:", messageContent);

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: messageContent,
    },
  ];

  const requestBody = {
    model,
    messages,
    stream: false,
    max_tokens: 1000,
    temperature: 0.7,
  };

  console.log("📤 Тело запроса к OpenRouter:", {
    model,
    messages,
    hasFiles: files?.length || 0,
    fileCount: files?.length || 0,
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    console.log("🌐 Отправляем запрос к OpenRouter...");

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-type": "application/json",
        "HTTP-Referer":
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000",
        "X-Title": "LLM Chat App",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`📥 Получен ответ: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Ошибка API:", errorData);
      throw new AIError(
        errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
        "API_ERROR",
        response.status
      );
    }

    const data: AiResponse = await response.json();
    console.log("✅ Успешный ответ от API:", data);

    if (data.error) {
      throw new AIError(data.error.message, "API_ERROR");
    }

    if (!data.choices || data.choices.length === 0) {
      throw new AIError("Пустой ответ от API", "EMPTY_RESPONSE");
    }

    const result = data.choices[0].message.content;
    console.log("📝 Текст ответа AI:", result);

    return result;
  } catch (err) {
    console.error("❌ Ошибка в sendToAI:", err);

    if (err instanceof AIError) {
      throw err;
    }

    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new AIError(
          "Превышено время ожидания ответа (30 секунд)",
          "TIMEOUT"
        );
      }
      throw new AIError(`Ошибка соединения: ${err.message}`, "NETWORK_ERROR");
    }

    throw new AIError("Неизвестная ошибка при отправке запроса", "UNKNOWN");
  }
}
