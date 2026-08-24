import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabaseServer } from "@/lib/supabase/server";
import { userWantsAi } from "@/lib/classify";
import {
  parseResumeFile,
  resumeParsingConfigured,
  resumeParsingModel,
} from "@/lib/ai/parseResumeFile";
import { getPrompt } from "@/lib/ai/prompts";
import type { ImportedResume } from "@/lib/resumeImport";
import { allowAiCall } from "@/lib/ratelimit";
import { getLocale } from "@/lib/i18n";

// Разбор файла может занять десятки секунд — как и распознавание документа.
export const maxDuration = 60;
export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 МБ — тот же потолок, что у /api/classify
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const M = {
  ru: {
    notEnabled: "Распознавание не включено в настройках профиля.",
    limit: "Дневной лимит ИИ-запросов исчерпан. Попробуйте завтра.",
    noFile: "Файл не передан",
    tooBig: "Файл больше 10 МБ",
    unsupported: "Поддерживаются JPG, PNG, WEBP, PDF",
    unavailable: "Разбор резюме сейчас недоступен.",
    pdf: "PDF пока не разбирается. Загрузите фото или скриншот резюме.",
    failed: "Не удалось разобрать файл",
  },
  en: {
    notEnabled: "Recognition isn't enabled in your profile settings.",
    limit: "Daily AI request limit reached. Try again tomorrow.",
    noFile: "No file provided",
    tooBig: "File is larger than 10 MB",
    unsupported: "Supported: JPG, PNG, WEBP, PDF",
    unavailable: "Resume parsing is currently unavailable.",
    pdf: "PDF isn't supported yet. Upload a photo or screenshot of the resume.",
    failed: "Couldn't read the file",
  },
  id: {
    notEnabled: "Pengenalan belum diaktifkan di pengaturan profil Anda.",
    limit: "Batas permintaan AI harian tercapai. Coba lagi besok.",
    noFile: "Tidak ada berkas",
    tooBig: "Berkas lebih dari 10 MB",
    unsupported: "Didukung: JPG, PNG, WEBP, PDF",
    unavailable: "Pembacaan resume saat ini tidak tersedia.",
    pdf: "PDF belum didukung. Unggah foto atau tangkapan layar resume.",
    failed: "Gagal membaca berkas",
  },
  uz: {
    notEnabled: "Aniqlash profil sozlamalaringizda yoqilmagan.",
    limit: "Kunlik AI soʻrovlari chegarasiga yetildi. Ertaga urinib koʻring.",
    noFile: "Fayl yuborilmadi",
    tooBig: "Fayl 10 MB dan katta",
    unsupported: "Qoʻllab-quvvatlanadi: JPG, PNG, WEBP, PDF",
    unavailable: "Rezyumeni oʻqish hozircha mavjud emas.",
    pdf: "PDF hozircha qoʻllab-quvvatlanmaydi. Rezyume suratini yuklang.",
    failed: "Faylni oʻqib boʻlmadi",
  },
} as const;

/**
 * Журнал прогона (v1.1 §11.5): что за промпт, какая модель, чем кончилось.
 * Ни файла, ни разобранных данных не храним — только хеш входа и счётчики,
 * иначе журнал сам стал бы копилкой персональных данных.
 */
async function logRun(
  supabase: Awaited<ReturnType<typeof getSupabaseServer>>,
  userId: string,
  inputDigest: string,
  outcome: { state: "completed"; parsed: ImportedResume } | { state: "failed"; reason: string }
): Promise<void> {
  const output =
    outcome.state === "completed"
      ? {
          experience: outcome.parsed.sections.experience.length,
          education: outcome.parsed.sections.education.length,
          skills: outcome.parsed.sections.skills.length,
          languages: outcome.parsed.sections.languages.length,
          basics_filled: (
            ["full_name", "headline", "location", "contact", "email", "about"] as const
          ).filter((k) => outcome.parsed[k].length > 0).length,
        }
      : { reason: outcome.reason };

  // Журнал не должен ломать сам разбор: при ошибке записи просто идём дальше.
  await supabase.from("ai_runs").insert({
    kind: "resume_import",
    subject_type: "resume",
    subject_id: userId,
    prompt_version: getPrompt("resume_import").version,
    model: resumeParsingModel(),
    input_digest: inputDigest,
    output,
    state: outcome.state,
    created_by: userId,
  });
}

/** Загруженный файл CV → структурный профиль для предзаполнения формы. */
export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = M[await getLocale()];

  // Тот же выключатель, что у распознавания документов: без явного согласия
  // человека файл в модель не уходит.
  if (!userWantsAi(user)) {
    return NextResponse.json({ error: t.notEnabled }, { status: 403 });
  }
  if (!resumeParsingConfigured()) {
    return NextResponse.json({ error: t.unavailable }, { status: 503 });
  }
  if (!(await allowAiCall(supabase, user.id))) {
    return NextResponse.json({ error: t.limit }, { status: 429 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: t.noFile }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: t.tooBig }, { status: 413 });
  }
  const mediaType = file.type || "application/octet-stream";
  if (!ALLOWED.includes(mediaType)) {
    return NextResponse.json({ error: t.unsupported }, { status: 415 });
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const digest = createHash("sha256").update(base64).digest("hex");

  try {
    const parsed = await parseResumeFile(base64, mediaType);
    await logRun(supabase, user.id, digest, { state: "completed", parsed });
    return NextResponse.json(parsed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    // Код ошибки провайдера, без его текста: в журнале не должно быть ни
    // фрагментов файла, ни чужих сообщений.
    await logRun(supabase, user.id, digest, {
      state: "failed",
      reason: msg.split(":")[0].slice(0, 40) || "unknown",
    });
    if (msg === "NO_API_KEY") {
      return NextResponse.json({ error: t.unavailable }, { status: 503 });
    }
    if (msg === "PDF_UNSUPPORTED") {
      return NextResponse.json({ error: t.pdf }, { status: 415 });
    }
    // Сообщения провайдера наружу не отдаём — они не локализованы и ничего
    // человеку не объясняют. Детали остаются в логах.
    console.error("resume parse failed", msg);
    return NextResponse.json({ error: t.failed }, { status: 502 });
  }
}
