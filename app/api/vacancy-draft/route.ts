import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n";
import { allowAiCall } from "@/lib/ratelimit";
import { generateVacancyDraft, type VacancyDraftAnswer } from "@/lib/llm";

export const maxDuration = 60;

// Простой env-гейт (§8): AI-freeform отключается без единого касания manual/
// template-путей. Значение "off" гасит слой. НЕ платформа фиче-флагов.
function aiComposerEnabled(): boolean {
  return process.env.VACANCY_AI_COMPOSER !== "off";
}

const MAX_INPUT = 4000; // защита от гигантских промптов
const MAX_ANSWERS = 6; // D5: до 6 уточняющих (1 freeform уже отдельно)

const M = {
  ru: {
    disabled: "AI-помощник сейчас отключён.",
    limit: "Дневной лимит ИИ-запросов исчерпан. Попробуйте завтра.",
    noInput: "Опишите, кто вам нужен.",
    unavailable: "AI-помощник сейчас недоступен.",
    failed: "Не удалось сгенерировать черновик. Попробуйте ещё раз.",
  },
  en: {
    disabled: "The AI helper is currently disabled.",
    limit: "Daily AI request limit reached. Try again tomorrow.",
    noInput: "Describe who you need.",
    unavailable: "The AI helper is currently unavailable.",
    failed: "Could not generate a draft. Please try again.",
  },
  id: {
    disabled: "Asisten AI sedang dinonaktifkan.",
    limit: "Batas permintaan AI harian tercapai. Coba lagi besok.",
    noInput: "Jelaskan siapa yang Anda butuhkan.",
    unavailable: "Asisten AI saat ini tidak tersedia.",
    failed: "Gagal membuat draf. Coba lagi.",
  },
  uz: {
    disabled: "AI yordamchisi hozircha o‘chirilgan.",
    limit: "Kunlik AI so‘rovlari chegarasiga yetildi. Ertaga urinib ko‘ring.",
    noInput: "Kim kerakligini yozing.",
    unavailable: "AI yordamchisi hozircha mavjud emas.",
    failed: "Draft yaratib bo‘lmadi. Qayta urining.",
  },
} as const;

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = M[await getLocale()];

  // Env-гейт слоя.
  if (!aiComposerEnabled()) {
    return NextResponse.json({ error: t.disabled }, { status: 403 });
  }

  // Per-employer rate limit (D7) — переиспользуем механизм ai_usage.
  if (!(await allowAiCall(supabase, user.id))) {
    return NextResponse.json({ error: t.limit }, { status: 429 });
  }

  let body: { freeform?: unknown; answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: t.noInput }, { status: 400 });
  }

  const freeform = typeof body.freeform === "string" ? body.freeform.trim() : "";
  if (!freeform) {
    return NextResponse.json({ error: t.noInput }, { status: 400 });
  }

  const answers: VacancyDraftAnswer[] = Array.isArray(body.answers)
    ? body.answers
        .filter(
          (a): a is { question: string; answer: string } =>
            !!a &&
            typeof a === "object" &&
            typeof (a as { question?: unknown }).question === "string" &&
            typeof (a as { answer?: unknown }).answer === "string"
        )
        .slice(0, MAX_ANSWERS)
        .map((a) => ({ question: a.question, answer: a.answer }))
    : [];

  const locale = await getLocale();

  try {
    const { draft, fieldsGenerated } = await generateVacancyDraft(
      freeform.slice(0, MAX_INPUT),
      answers,
      locale
    );
    return NextResponse.json({ draft, fields_generated: fieldsGenerated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : t.failed;
    if (msg === "NO_API_KEY") {
      return NextResponse.json({ error: t.unavailable }, { status: 503 });
    }
    if (msg === "NO_JSON") {
      // Модель вернула невалидный JSON — деградируем мягко (§11.3).
      return NextResponse.json({ error: t.failed, error_type: "parse" }, { status: 502 });
    }
    return NextResponse.json({ error: t.failed, error_type: "generation" }, { status: 502 });
  }
}
