import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { classifyDocument } from "@/lib/anthropic";

export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

export async function POST(request: Request) {
  // Только авторизованный пользователь может звать классификатор
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Файл больше 10 МБ" }, { status: 413 });
  }
  const mediaType = file.type || "application/octet-stream";
  if (!ALLOWED.includes(mediaType)) {
    return NextResponse.json(
      { error: "Поддерживаются JPG, PNG, WEBP, GIF, PDF" },
      { status: 415 }
    );
  }

  try {
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const result = await classifyDocument(base64, mediaType);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка распознавания";
    if (msg === "NO_API_KEY") {
      return NextResponse.json(
        { error: "AI-распознавание не настроено (нет ANTHROPIC_API_KEY)." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
