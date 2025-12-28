// /lib/ai-service.ts (переименуйте или создайте новый файл)

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

/**
 * Отправляет сообщение через OpenRouter AI
 * @param content Текст сообщения от пользователя
 * @returns Ответ от AI ассистента
 */
export async function sendToOpenRouter(content: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const model =
    process.env.NEXT_PUBLIC_OPENROUTER_MODEL || "xiaomi/mimo-v2-flash:free";
  const baseUrl = "https://openrouter.ai/api/v1";

  // Проверяем наличие API ключа
  if (!apiKey) {
    console.warn("⚠️ OpenRouter API key is not configured, using mock mode");
    return sendToAIMock(content);
  }

  // Формируем сообщение
  const messages: ChatMessage[] = [
    {
      role: "user",
      content: content.trim(),
    },
  ];

  // Конфигурация запроса для OpenRouter
  const requestBody = {
    model,
    messages,
    stream: false,
    max_tokens: 1000,
    temperature: 0.7,
  };

  try {
    console.log("📤 Отправка запроса к OpenRouter API...");
    console.log("🤖 Модель:", model);
    console.log("📝 Сообщение:", content);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // Для OpenRouter требуется
        "X-Title": "LLM Chat App", // Для OpenRouter
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Обработка HTTP ошибок
    if (!response.ok) {
      let errorMessage = `HTTP ошибка! Статус: ${response.status}`;

      try {
        const errorData = await response.json();
        errorMessage += ` - ${
          errorData.error?.message || JSON.stringify(errorData)
        }`;
      } catch {
        const textError = await response.text();
        errorMessage += ` - ${textError}`;
      }

      console.error("❌ Ошибка OpenRouter API:", errorMessage);

      // Если это ошибка аутентификации или лимита, переключаемся на мок
      if (
        response.status === 401 ||
        response.status === 402 ||
        response.status === 429
      ) {
        return sendToAIMock(content);
      }

      throw new Error(errorMessage);
    }

    // Парсим ответ
    const data: AIResponse = await response.json();

    console.log("✅ Успешный ответ от OpenRouter");

    // Проверяем наличие контента в ответе
    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.choices?.[0]?.message?.content) {
      console.error("❌ Неверный формат ответа:", data);
      throw new Error("Неверный формат ответа от AI");
    }

    const aiResponse = data.choices[0].message.content;
    console.log("💬 Длина ответа:", aiResponse.length, "символов");

    return aiResponse;
  } catch (err: any) {
    console.error("❌ Ошибка при вызове OpenRouter API:", err);

    // Обработка различных типов ошибок
    if (err.name === "AbortError") {
      return "⏱️ Время ожидания ответа истекло. Пожалуйста, попробуйте еще раз.";
    }

    return sendToAIMock(content);
  }
}

/**
 * Улучшенная мок-функция для разработки
 */
export async function sendToAIMock(content: string): Promise<string> {
  console.log("🤖 Используется мок-режим AI. Сообщение:", content);

  // Имитация задержки сети
  await new Promise((resolve) =>
    setTimeout(resolve, 600 + Math.random() * 400)
  );

  // Умные ответы в зависимости от типа сообщения
  const contentLower = content.toLowerCase();

  // Приветствия
  if (contentLower.match(/(привет|здравств|добрый|hi|hello)/)) {
    const greetings = [
      "Привет! 👋 Я ваш AI-помощник. Рад вас видеть! Чем могу помочь?",
      "Здравствуйте! 😊 Я готов ответить на ваши вопросы и помочь с задачами.",
      "Приветствую! Я AI-ассистент. Как ваши дела? Чем могу быть полезен сегодня?",
      "Привет! Я модель xiaomi/mimo-v2-flash от OpenRouter. Готова к диалогу!",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Вопросы
  if (contentLower.includes("?")) {
    const answers = [
      `Интересный вопрос! "${content}" - давайте разберемся в этой теме подробнее.`,
      `Вы спрашиваете о "${content.substring(
        0,
        50
      )}...". Это важная тема, требующая внимательного рассмотрения.`,
      `Отличный вопрос! На тему "${content.substring(
        0,
        40
      )}..." у меня есть несколько мыслей...`,
      `По поводу вашего вопроса: я думаю, здесь стоит учитывать несколько факторов.`,
    ];
    return answers[Math.floor(Math.random() * answers.length)];
  }

  // Помощь
  if (contentLower.match(/(помощь|help|возможност|умеешь|можешь)/)) {
    return (
      `Я могу помочь с:\n\n` +
      `📝 **Генерация текста** - статьи, письма, идеи\n` +
      `❓ **Ответы на вопросы** - на различные темы\n` +
      `💡 **Решение задач** - анализ, планирование\n` +
      `🎨 **Креативные задачи** - сценарии, стихи, идеи\n` +
      `🔧 **Программирование** - код, объяснения\n\n` +
      `Просто напишите, что вам нужно!`
    );
  }

  // Общие ответы
  const responses = [
    `Я понял ваше сообщение: "${content}". Спасибо за обращение! Чем еще могу помочь?`,
    `Интересно! "${content.substring(
      0,
      60
    )}..." - продолжим разговор на эту тему?`,
    `Записал: "${content}". Есть ли у вас дополнительные вопросы или уточнения?`,
    `Спасибо за сообщение! Я AI-ассистент, использующий модель xiaomi/mimo-v2-flash через OpenRouter.`,
    `📨 Ваше сообщение получено. В реальном режиме здесь был бы сгенерированный AI-ответ.`,
    `Я проанализировал ваше сообщение и готов помочь с дальнейшим обсуждением этой темы.`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Универсальная функция отправки сообщения (использует OpenRouter)
 */
export async function sendToAI(content: string): Promise<string> {
  return sendToOpenRouter(content);
}

/**
 * Проверяет конфигурацию API
 */
export function checkAIConfig() {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const model =
    process.env.NEXT_PUBLIC_OPENROUTER_MODEL || "xiaomi/mimo-v2-flash:free";

  return {
    provider: "OpenRouter",
    apiKeyConfigured: !!apiKey,
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : "Не настроен",
    model,
    baseUrl: "https://openrouter.ai/api/v1",
    mode: apiKey ? "real" : "mock",
  };
}
