import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { classifyDocument, userWantsAi } from "@/lib/classify";
import { allowAiCall } from "@/lib/ratelimit";
import { getLocale } from "@/lib/i18n";

export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

const M = {
  ru: {
    notEnabled: "Распознавание не включено в настройках профиля.",
    limit: "Дневной лимит ИИ-запросов исчерпан. Попробуйте завтра.",
    noFile: "Файл не передан",
    tooBig: "Файл больше 10 МБ",
    unsupported: "Поддерживаются JPG, PNG, WEBP, GIF, PDF",
    unavailable: "AI-распознавание сейчас недоступно.",
    failed: "Ошибка распознавания",
  },
  en: {
    notEnabled: "Recognition isn't enabled in your profile settings.",
    limit: "Daily AI request limit reached. Try again tomorrow.",
    noFile: "No file provided",
    tooBig: "File is larger than 10 MB",
    unsupported: "Supported: JPG, PNG, WEBP, GIF, PDF",
    unavailable: "AI recognition is currently unavailable.",
    failed: "Recognition error",
  },
  id: {
    notEnabled: "Pengenalan belum diaktifkan di pengaturan profil Anda.",
    limit: "Batas permintaan AI harian tercapai. Coba lagi besok.",
    noFile: "Tidak ada berkas",
    tooBig: "Berkas lebih dari 10 MB",
    unsupported: "Didukung: JPG, PNG, WEBP, GIF, PDF",
    unavailable: "Pengenalan AI saat ini tidak tersedia.",
    failed: "Kesalahan pengenalan",
  },
  uz: {
    notEnabled: "Aniqlash profil sozlamalaringizda yoqilmagan.",
    limit: "Kunlik AI soʻrovlari chegarasiga yetildi. Ertaga urinib koʻring.",
    noFile: "Fayl yuborilmadi",
    tooBig: "Fayl 10 MB dan katta",
    unsupported: "Qoʻllab-quvvatlanadi: JPG, PNG, WEBP, GIF, PDF",
    unavailable: "AI aniqlash hozircha mavjud emas.",
    failed: "Aniqlash xatosi",
  },
} as const;

export async function POST(request: Request) {
  // Только авторизованный пользователь может звать классификатор
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = M[await getLocale()];

  // Распознавание работает только если пользователь сам включил его в настройках.
  if (!userWantsAi(user)) {
    return NextResponse.json({ error: t.notEnabled }, { status: 403 });
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

  try {
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const result = await classifyDocument(base64, mediaType);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : t.failed;
    if (msg === "NO_API_KEY") {
      return NextResponse.json({ error: t.unavailable }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
