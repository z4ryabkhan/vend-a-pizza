// Thin OpenRouter chat-completions client. OpenRouter exposes an
// OpenAI-compatible API, so a single fetch wrapper serves every model.

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  /** Hint OpenRouter to return strict JSON. */
  responseFormatJson?: boolean;
  signal?: AbortSignal;
}

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to your environment (.env.local)."
    );
  }
  return key;
}

/**
 * Calls an OpenRouter chat model and returns the assistant message text.
 * Throws on non-2xx responses with a useful message.
 */
export async function chatCompletion(
  opts: ChatCompletionOptions
): Promise<string> {
  const { model, messages, temperature = 0.7, maxTokens = 1500 } = opts;

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    signal: opts.signal,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      // OpenRouter attribution headers (optional but recommended).
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_SITE_NAME || "FounderCouncil AI",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(opts.responseFormatJson
        ? { response_format: { type: "json_object" } }
        : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter request failed for "${model}" (${res.status}): ${detail.slice(
        0,
        500
      )}`
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`OpenRouter returned an empty response for "${model}".`);
  }
  return content.trim();
}
