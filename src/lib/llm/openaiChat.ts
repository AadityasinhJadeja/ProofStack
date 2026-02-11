import { debugLog } from "@/lib/utils/debug";

export type OpenAIMessageRole = "system" | "user";

export interface OpenAIMessage {
  role: OpenAIMessageRole;
  content: string;
}

interface OpenAIChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
}

type OpenAIMessageContent = string | Array<{ type?: string; text?: string }> | undefined;

function normalizeContent(content: OpenAIMessageContent): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (part.type === "text" && typeof part.text === "string" ? part.text : ""))
      .join("\n")
      .trim();
  }

  return "";
}

/**
 * Sends a chat completion request to OpenAI and returns the first message content.
 */
export async function callOpenAIChat(
  messages: OpenAIMessage[],
  options: OpenAIChatOptions = {},
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const model = options.model ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.2,
  };

  if (typeof options.maxTokens === "number") {
    body.max_tokens = options.maxTokens;
  }

  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  debugLog("llm", "request", {
    model,
    messageCount: messages.length,
    jsonMode: options.jsonMode === true,
  });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    debugLog("llm", "response_error", { status: response.status, body: text.slice(0, 500) });
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = (await response.json()) as OpenAIChatResponse;
  const first = data.choices?.[0]?.message?.content;
  const text = normalizeContent(first);

  if (!text) {
    throw new Error("OpenAI response did not include text content");
  }

  debugLog("llm", "response_ok", { length: text.length });
  return text;
}
