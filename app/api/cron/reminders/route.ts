import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { categoryLabel, type DocCategory } from "@/lib/categories";

// Ежедневный крон (Vercel Cron): рассылает email о документах, у которых скоро
// истекает срок. Дедуп — через таблицу reminder_sent (одно письмо на порог).
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type DueRow = {
  document_id: string;
  title: string;
  category: string;
  expires_on: string;
  kind: "d7" | "d30";
  household_id: string;
  email: string;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!
  );
}

function fmtDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("ru-RU");
  } catch {
    return d;
  }
}

async function sendDigest(to: string, rows: DueRow[]): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from =
    process.env.ALERT_EMAIL_FROM || "Семейный сейф <onboarding@resend.dev>";
  const items = rows
    .slice()
    .sort((a, b) => a.expires_on.localeCompare(b.expires_on))
    .map((r) => {
      const cat = categoryLabel("ru", r.category as DocCategory);
      const urgent = r.kind === "d7";
      return `<li style="margin:4px 0">${urgent ? "⚠️ " : "🗓️ "}<b>${escapeHtml(
        r.title
      )}</b> <span style="color:#888">(${escapeHtml(
        cat
      )})</span> — действует до <b>${fmtDate(r.expires_on)}</b></li>`;
    })
    .join("\n");
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px">
<p>Напоминание о сроках документов вашей семьи:</p>
<ul style="padding-left:18px">${items}</ul>
<p><a href="${APP_URL}/my/reminders" style="color:#b85c38">Открыть в приложении →</a></p>
<p style="color:#999;font-size:12px">Письмо пришло, потому что у документа в «Семейном сейфе» подходит срок. Чтобы не получать — уберите дату «Действует до» у документа.</p>
</div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: "📅 Скоро истекают документы — Семейный сейф",
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  // Защита: Vercel Cron присылает Authorization: Bearer <CRON_SECRET>.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin)
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY не задан" },
      { status: 500 }
    );
  if (!process.env.RESEND_API_KEY)
    return NextResponse.json({ skipped: "RESEND_API_KEY не задан" });

  const { data, error } = await admin.rpc("due_reminders");
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data ?? []) as DueRow[];

  const byEmail = new Map<string, DueRow[]>();
  for (const r of rows) {
    const arr = byEmail.get(r.email) ?? [];
    arr.push(r);
    byEmail.set(r.email, arr);
  }

  let sent = 0;
  for (const [email, list] of byEmail) {
    const ok = await sendDigest(email, list);
    if (!ok) continue;
    sent++;
    await admin.from("reminder_sent").insert(
      list.map((r) => ({
        document_id: r.document_id,
        expires_on: r.expires_on,
        kind: r.kind,
        email,
      }))
    );
  }

  return NextResponse.json({
    recipients: byEmail.size,
    emailsSent: sent,
    documents: rows.length,
  });
}
