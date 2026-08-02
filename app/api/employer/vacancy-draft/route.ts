import { NextResponse } from "next/server";
import { getUser } from "@/lib/queries";
import { buildDraft, type Answers } from "@/lib/vacancyWizard";
import { polishVacancy } from "@/lib/vacancyAI";

// Сборка + AI-полировка черновика вакансии. Вынесено в route handler (а не
// server action), чтобы вызов из диалога НЕ перерисовывал страницу и не сбивал
// уже введённые ответы. Возвращает готовый черновик для предзаполнения формы.
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  let body: { answers?: Answers; defaultCompany?: string };
  try {
    body = (await req.json()) as { answers?: Answers; defaultCompany?: string };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const draft = buildDraft(body.answers ?? {}, body.defaultCompany ?? "");

  try {
    const p = await polishVacancy(draft.title, draft.description ?? "");
    const block = (emoji: string, label: string, text: string) =>
      text.trim() ? `${emoji} ${label}\n${text.trim()}` : "";
    const description =
      [
        block("🏠", "О месте", p.place),
        block("👤", "Кого ищем", p.who),
        block("🎯", "Для чего", p.purpose),
        block("✅", "Что ожидаем", p.expect),
        block("🧩", "Какие навыки", p.skills),
      ]
        .filter(Boolean)
        .join("\n\n") || draft.description;
    const aiQuestions = p.questions.map((q) => ({
      question: q,
      type: "text" as const,
      required: false,
    }));
    return NextResponse.json({
      draft: {
        ...draft,
        description,
        screening_questions: [...draft.screening_questions, ...aiQuestions],
      },
      aiUsed: true,
    });
  } catch {
    return NextResponse.json({ draft, aiUsed: false });
  }
}
