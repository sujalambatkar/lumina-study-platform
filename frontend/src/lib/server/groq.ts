import "server-only";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function groq(body: Record<string, unknown>): Promise<Response> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new ApiError(503, "The AI service isn't configured. Set GROQ_API_KEY on the server.");
  return fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, reasoning_effort: "low", ...body }),
    signal: AbortSignal.timeout(45_000),
  });
}

async function failure(res: Response): Promise<ApiError> {
  if (res.status === 429) return new ApiError(429, "The AI is busy right now. Please try again in a moment.");
  return new ApiError(502, `The AI service returned an error (${res.status}).`);
}

/** Single JSON-mode completion. */
export async function groqJson<T>(system: string, user: string, maxTokens = 2000): Promise<T> {
  const res = await groq({
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: maxTokens,
  });
  if (!res.ok) throw await failure(res);
  const data = await res.json();
  try {
    return JSON.parse(data.choices[0].message.content) as T;
  } catch {
    throw new ApiError(502, "The AI returned an unreadable response. Please try again.");
  }
}

/** Streaming completion, yielding plain text tokens. */
export async function groqStream(system: string, user: string, maxTokens = 900): Promise<ReadableStream<Uint8Array>> {
  const res = await groq({
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
    stream: true,
    temperature: 0.2,
    max_tokens: maxTokens,
  });
  if (!res.ok || !res.body) throw await failure(res);

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  return res.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
          try {
            const token = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content;
            if (token) controller.enqueue(encoder.encode(token));
          } catch { /* partial line */ }
        }
      },
    })
  );
}
