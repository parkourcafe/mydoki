import "server-only";

// AI-полировка вакансии (Фаза 2). Из «сырого» черновика (ответы визарда)
// делает профессиональный текст 4 блоков + скрининг-вопросы. Провайдер:
// GLM (OpenAI-совместимый), запасной — Anthropic. Если ключей нет — не
// вызывается (кнопка AI не показывается).

export function aiTextConfigured(): boolean {
  return !!(process.env.GLM_API_KEY || process.env.ANTHROPIC_API_KEY);
}

async function callLLM(system: string, user: string): Promise<string> {
  const glm = process.env.GLM_API_KEY;
  if (glm) {
    const base = process.env.GLM_BASE_URL || "https://api.z.ai/api/paas/v4";
    const model = process.env.GLM_MODEL || "glm-4.6";
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${glm}` },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 1000,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`GLM_${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
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
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok) throw new Error(`ANTHROPIC_${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    return (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
  }

  throw new Error("NO_AI");
}

export type PolishResult = {
  who: string;
  purpose: string;
  expect: string;
  skills: string;
  questions: string[];
};

const SYSTEM = `Ты — опытный HR-редактор. Тебе дают черновик вакансии для малого бизнеса (кафе, отели, ассистенты; рынок в т.ч. Индонезия).
Перепиши его в профессиональную, тёплую и конкретную вакансию.
Верни ТОЛЬКО JSON-объект (без markdown, без пояснений) со строго такими ключами:
- "who": кого ищем — 1–2 предложения;
- "purpose": для чего / зачем эта роль — 1–2 предложения;
- "expect": что человек будет делать — 2–4 коротких пункта через перенос строки;
- "skills": какие навыки и требования — 1–3 предложения;
- "questions": массив из 2–3 коротких скрининг-вопросов кандидату (строки).
ПРАВИЛА:
- Пиши на том же языке, что и черновик (обычно русский).
- НЕ добавляй требований к возрасту, полу, религии, национальности или внешности — это дискриминация. «Презентабельность» переформулируй как «опрятный вид и вежливое общение».
- Не выдумывай факты, которых нет в черновике (зарплату, документы). Только улучшай формулировки.
- Коротко и по делу, без воды и клише вроде «стрессоустойчивый, коммуникабельный».`;

function pickJson(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Модель не вернула JSON");
  return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
}

/** Полирует черновик вакансии. Бросает при отсутствии AI или ошибке. */
export async function polishVacancy(
  title: string,
  rawDescription: string
): Promise<PolishResult> {
  const user = `Должность: ${title || "(не указана)"}\n\nЧерновик описания:\n${rawDescription || "(пусто)"}`;
  const text = await callLLM(SYSTEM, user);
  const raw = pickJson(text);
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  return {
    who: str(raw.who),
    purpose: str(raw.purpose),
    expect: str(raw.expect),
    skills: str(raw.skills),
    questions: Array.isArray(raw.questions)
      ? raw.questions.filter((q): q is string => typeof q === "string" && q.trim().length > 0).slice(0, 3)
      : [],
  };
}
