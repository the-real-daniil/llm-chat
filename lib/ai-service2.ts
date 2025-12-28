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
export async function sendToAI(content: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const model = process.env.NEXT_PUBLIC_OPENROUTER_MODEL;
  const baseUrl = "https://openrouter.ai/api/v1";

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
    const contoller = new AbortController();
    const timeoutId = setTimeout(() => contoller.abort(), 30_000);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "LLM Chat App",
      },
      body: JSON.stringify(requestBody),
      signal: contoller.signal,
    });
    clearTimeout(timeoutId);
    const data: AiResponse = await response.json();
    console.log("Ответ получен!");
    const aiResponse = data.choices[0].message.content;
    return aiResponse;
  } catch (err: any) {
    console.error("Ошибка - ", err);
    return `Была ошибка ${err}`;
  }
}
