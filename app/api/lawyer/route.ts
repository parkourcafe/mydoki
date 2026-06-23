import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { lawyerChat } from "@/lib/llm";

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { messages?: { role?: string; content?: string }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim()
    )
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: (m.content as string).slice(0, 4000),
    }));

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Нет вопроса" }, { status: 400 });
  }

  try {
    const reply = await lawyerChat(messages);
    return NextResponse.json({ reply });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка";
    if (msg === "NO_API_KEY") {
      return NextResponse.json(
        { error: "AI-юрист не настроен (нет GLM_API_KEY)." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
