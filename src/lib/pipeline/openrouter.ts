import { pipelineConfig } from "@/lib/config";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const apiKey = pipelineConfig.openRouterApiKey;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in .env.local");
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://seestew.com",
      "X-Title": "SeeStew Story Pipeline",
    },
    body: JSON.stringify({
      model: pipelineConfig.openRouterModel,
      messages,
      max_tokens: options?.maxTokens ?? 12000,
      temperature: options?.temperature ?? 0.65,
      response_format: { type: "json_object" },
    }),
  });

  const data = (await res.json()) as OpenRouterResponse;
  if (!res.ok) {
    throw new Error(data.error?.message ?? `OpenRouter error ${res.status}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenRouter");
  return content;
}
