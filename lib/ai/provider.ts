import "server-only";

// Провайдер-абстракция для текстовых LLM-вызовов (GLM → Anthropic).
// Ключи — в env. Единая точка, чтобы не дублировать вызовы по модулям.

export function aiTextConfigured(): boolean {
  return !!(process.env.GLM_API_KEY || process.env.ANTHROPIC_API_KEY);
}

/** Имя активной текстовой модели (для ai_runs.model). */
export function activeTextModel(): string | null {
  if (process.env.GLM_API_KEY) return process.env.GLM_MODEL || "glm-4.6";
  if (process.env.ANTHROPIC_API_KEY)
    return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  return null;
}

export async function callLLM(
  system: string,
  user: string,
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const temperature = opts.temperature ?? 0.3;
  const max_tokens = opts.maxTokens ?? 1200;

  const glm = process.env.GLM_API_KEY;
  if (glm) {
    const base = process.env.GLM_BASE_URL || "https://api.z.ai/api/paas/v4";
    const model = process.env.GLM_MODEL || "glm-4.6";
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${glm}` },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok)
      throw new Error(`GLM_${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? "";
  }

  const anthropic = process.env.ANTHROPIC_API_KEY;
  if (anthropic) {
    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropic,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model, max_tokens, system, messages: [{ role: "user", content: user }] }),
    });
    if (!res.ok)
      throw new Error(`ANTHROPIC_${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    return (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
  }

  throw new Error("NO_AI");
}

/** Достаёт JSON-объект из ответа модели (с markdown-обёрткой или без). */
export function extractJson(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Модель не вернула JSON");
  return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
}
