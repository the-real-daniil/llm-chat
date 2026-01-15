interface ChatMessage {
  role: "ai" | "user" | "system";
  content: string;
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

export async function sendToAI(content: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const model = process.env.NEXT_PUBLIC_OPENROUTER_MODEL;
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

  if (!content.trim()) {
    throw new AIError("Сообщение не может быть пустым", "EMPTY_CONTENT");
  }

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: content.trim(),
    },
  ];

  const requestBody = {
    model,
    messages,
    stream: false,
    max_tokens: 1000,
    temperature: 0.7,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AIError(
        errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
        "API_ERROR",
        response.status
      );
    }

    const data: AiResponse = await response.json();

    if (data.error) {
      throw new AIError(data.error.message, "API_ERROR");
    }

    if (!data.choices || data.choices.length === 0) {
      throw new AIError("Пустой ответ от API", "EMPTY_RESPONSE");
    }

    return data.choices[0].message.content;
  } catch (err) {
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
