import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { categoryLabel, type DocCategory } from "@/lib/categories";
import { bucketKind, DEFAULT_OFFSETS, todayUTC } from "@/lib/reminders";
import { docTypeLabel } from "@/lib/employmentDocs";

// Ежедневный крон (Vercel Cron): письма о документах с истекающим сроком,
// ручных напоминаниях, документах сотрудников (визы/договоры/сертификации) и
// пересмотрах условий (плановая дата / дата вступления допсоглашения) —
// работодателю. Пороги (offsets [30,7,1]) считаются в TS (см. lib/reminders);
// дедуп — reminder_sent / reminder_sent_manual / employment_reminder_sent /
// employment_review_reminder_sent.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type DocCand = {
  document_id: string;
  title: string;
  category: string;
  expires_on: string;
  household_id: string;
  email: string;
};
type ManualCand = {
  reminder_id: string;
  title: string;
  due_on: string;
  offsets: unknown;
  household_id: string;
  email: string;
};
type EmpDocCand = {
  document_id: string;
  title: string;
  doc_type: string;
  expires_on: string;
  employment_id: string;
  company_name: string;
  email: string;
};
type ReviewCand = {
  source_id: string;
  kind: string; // 'review' | 'amendment'
  title: string;
  due_on: string;
  employment_id: string;
  company_name: string;
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

type DocItem = { title: string; category: string; date: string; urgent: boolean };
type ManualItem = { title: string; date: string; urgent: boolean };
type EmpDocItem = {
  title: string;
  docType: string;
  company: string;
  date: string;
  urgent: boolean;
};
type ReviewItem = {
  kind: string;
  title: string;
  company: string;
  date: string;
  urgent: boolean;
};

async function sendDigest(
  to: string,
  docs: DocItem[],
  manual: ManualItem[],
  empdocs: EmpDocItem[],
  reviews: ReviewItem[]
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from =
    process.env.ALERT_EMAIL_FROM || "Семейный сейф <noreply@doki.help>";

  const docLis = docs
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => {
      const cat = categoryLabel("ru", r.category as DocCategory);
      return `<li style="margin:4px 0">${r.urgent ? "⚠️ " : "🗓️ "}<b>${escapeHtml(
        r.title
      )}</b> <span style="color:#888">(${escapeHtml(
        cat
      )})</span> — действует до <b>${fmtDate(r.date)}</b></li>`;
    })
    .join("\n");

  const manualLis = manual
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(
      (r) =>
        `<li style="margin:4px 0">${r.urgent ? "⚠️ " : "🔔 "}<b>${escapeHtml(
          r.title
        )}</b> — <b>${fmtDate(r.date)}</b></li>`
    )
    .join("\n");

  const empLis = empdocs
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => {
      const tp = docTypeLabel("ru", r.docType);
      return `<li style="margin:4px 0">${r.urgent ? "⚠️ " : "🗓️ "}<b>${escapeHtml(
        r.title
      )}</b> <span style="color:#888">(${escapeHtml(tp)} · ${escapeHtml(
        r.company
      )})</span> — действует до <b>${fmtDate(r.date)}</b></li>`;
    })
    .join("\n");

  const blocks: string[] = [];
  if (docLis)
    blocks.push(
      `<p>Напоминание о сроках документов вашей семьи:</p><ul style="padding-left:18px">${docLis}</ul>`
    );
  if (manualLis)
    blocks.push(
      `<p>Ваши напоминания:</p><ul style="padding-left:18px">${manualLis}</ul>`
    );
  if (empLis)
    blocks.push(
      `<p>Истекают документы ваших сотрудников:</p><ul style="padding-left:18px">${empLis}</ul>`
    );

  const revLabels: Record<string, string> = {
    review: "плановый пересмотр",
    amendment: "дата вступления допсоглашения",
  };
  const revLis = reviews
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => {
      const lbl = revLabels[r.kind] ?? r.kind;
      return `<li style="margin:4px 0">${r.urgent ? "⚠️ " : "🗓️ "}<b>${escapeHtml(
        r.title
      )}</b> <span style="color:#888">(${escapeHtml(lbl)} · ${escapeHtml(
        r.company
      )})</span> — <b>${fmtDate(r.date)}</b></li>`;
    })
    .join("\n");
  if (revLis)
    blocks.push(
      `<p>Пересмотры условий сотрудников:</p><ul style="padding-left:18px">${revLis}</ul>`
    );

  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px">
${blocks.join("\n")}
<p><a href="${APP_URL}/my/reminders" style="color:#b85c38">Открыть в приложении →</a></p>
<p style="color:#999;font-size:12px">Письмо пришло из «Семейного сейфа». Управлять напоминаниями можно в приложении.</p>
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
        subject: "📅 Напоминания — Семейный сейф",
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function offsetsOf(raw: unknown): number[] {
  if (Array.isArray(raw)) {
    const nums = raw.filter(
      (n): n is number => typeof n === "number" && n > 0
    );
    if (nums.length) return nums;
  }
  return DEFAULT_OFFSETS;
}

export async function GET(req: Request) {
  // Fail-closed: без CRON_SECRET эндпоинт закрыт.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
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

  const today = todayUTC(new Date());

  const [docRes, manRes, empRes, revRes] = await Promise.all([
    admin.rpc("due_reminder_candidates"),
    admin.rpc("due_manual_reminder_candidates"),
    admin.rpc("due_employment_document_candidates"),
    admin.rpc("due_employment_review_candidates"),
  ]);
  if (docRes.error)
    return NextResponse.json({ error: docRes.error.message }, { status: 500 });
  if (manRes.error)
    return NextResponse.json({ error: manRes.error.message }, { status: 500 });
  if (empRes.error)
    return NextResponse.json({ error: empRes.error.message }, { status: 500 });
  if (revRes.error)
    return NextResponse.json({ error: revRes.error.message }, { status: 500 });

  const docCands = (docRes.data ?? []) as DocCand[];
  const manCands = (manRes.data ?? []) as ManualCand[];
  const empCands = (empRes.data ?? []) as EmpDocCand[];
  const revCands = (revRes.data ?? []) as ReviewCand[];

  // Порог на сегодня для каждого кандидата.
  const docDue = docCands
    .map((d) => ({ d, kind: bucketKind(d.expires_on, today, DEFAULT_OFFSETS) }))
    .filter((x): x is { d: DocCand; kind: string } => x.kind != null);
  const manDue = manCands
    .map((m) => ({ m, kind: bucketKind(m.due_on, today, offsetsOf(m.offsets)) }))
    .filter((x): x is { m: ManualCand; kind: string } => x.kind != null);
  const empDue = empCands
    .map((e) => ({ e, kind: bucketKind(e.expires_on, today, DEFAULT_OFFSETS) }))
    .filter((x): x is { e: EmpDocCand; kind: string } => x.kind != null);
  const revDue = revCands
    .map((r) => ({ r, kind: bucketKind(r.due_on, today, DEFAULT_OFFSETS) }))
    .filter((x): x is { r: ReviewCand; kind: string } => x.kind != null);

  // Дедуп: подтягиваем уже отправленные строки по нужным ключам.
  const docIds = [...new Set(docDue.map((x) => x.d.document_id))];
  const manIds = [...new Set(manDue.map((x) => x.m.reminder_id))];
  const empIds = [...new Set(empDue.map((x) => x.e.document_id))];
  const revIds = [...new Set(revDue.map((x) => x.r.source_id))];

  const sentDoc = new Set<string>();
  if (docIds.length) {
    const { data } = await admin
      .from("reminder_sent")
      .select("document_id, expires_on, kind, email")
      .in("document_id", docIds);
    for (const r of data ?? [])
      sentDoc.add(`${r.document_id}|${r.expires_on}|${r.kind}|${r.email}`);
  }
  const sentMan = new Set<string>();
  if (manIds.length) {
    const { data } = await admin
      .from("reminder_sent_manual")
      .select("reminder_id, due_on, kind, email")
      .in("reminder_id", manIds);
    for (const r of data ?? [])
      sentMan.add(`${r.reminder_id}|${r.due_on}|${r.kind}|${r.email}`);
  }
  const sentEmp = new Set<string>();
  if (empIds.length) {
    const { data } = await admin
      .from("employment_reminder_sent")
      .select("document_id, expires_on, kind, email")
      .in("document_id", empIds);
    for (const r of data ?? [])
      sentEmp.add(`${r.document_id}|${r.expires_on}|${r.kind}|${r.email}`);
  }
  const sentRev = new Set<string>();
  if (revIds.length) {
    const { data } = await admin
      .from("employment_review_reminder_sent")
      .select("source_id, due_on, kind, email")
      .in("source_id", revIds);
    for (const r of data ?? [])
      sentRev.add(`${r.source_id}|${r.due_on}|${r.kind}|${r.email}`);
  }

  // Группируем к отправке по email + собираем строки для записи дедупа.
  const byEmail = new Map<
    string,
    { docs: DocItem[]; manual: ManualItem[]; empdocs: EmpDocItem[]; reviews: ReviewItem[] }
  >();
  const toRecordDoc: {
    document_id: string;
    expires_on: string;
    kind: string;
    email: string;
  }[] = [];
  const toRecordMan: {
    reminder_id: string;
    due_on: string;
    kind: string;
    email: string;
  }[] = [];
  const toRecordEmp: {
    document_id: string;
    expires_on: string;
    kind: string;
    email: string;
  }[] = [];
  const toRecordRev: {
    source_id: string;
    due_on: string;
    kind: string;
    email: string;
  }[] = [];

  for (const { d, kind } of docDue) {
    const key = `${d.document_id}|${d.expires_on}|${kind}|${d.email}`;
    if (sentDoc.has(key)) continue;
    const bucket = byEmail.get(d.email) ?? { docs: [], manual: [], empdocs: [], reviews: [] };
    bucket.docs.push({
      title: d.title,
      category: d.category,
      date: d.expires_on,
      urgent: kind === "d1" || kind === "d7",
    });
    byEmail.set(d.email, bucket);
    toRecordDoc.push({
      document_id: d.document_id,
      expires_on: d.expires_on,
      kind,
      email: d.email,
    });
  }
  for (const { m, kind } of manDue) {
    const key = `${m.reminder_id}|${m.due_on}|${kind}|${m.email}`;
    if (sentMan.has(key)) continue;
    const bucket = byEmail.get(m.email) ?? { docs: [], manual: [], empdocs: [], reviews: [] };
    bucket.manual.push({
      title: m.title,
      date: m.due_on,
      urgent: kind === "d1" || kind === "d7",
    });
    byEmail.set(m.email, bucket);
    toRecordMan.push({
      reminder_id: m.reminder_id,
      due_on: m.due_on,
      kind,
      email: m.email,
    });
  }
  for (const { e, kind } of empDue) {
    const key = `${e.document_id}|${e.expires_on}|${kind}|${e.email}`;
    if (sentEmp.has(key)) continue;
    const bucket = byEmail.get(e.email) ?? { docs: [], manual: [], empdocs: [], reviews: [] };
    bucket.empdocs.push({
      title: e.title,
      docType: e.doc_type,
      company: e.company_name,
      date: e.expires_on,
      urgent: kind === "d1" || kind === "d7",
    });
    byEmail.set(e.email, bucket);
    toRecordEmp.push({
      document_id: e.document_id,
      expires_on: e.expires_on,
      kind,
      email: e.email,
    });
  }
  for (const { r, kind } of revDue) {
    const key = `${r.source_id}|${r.due_on}|${kind}|${r.email}`;
    if (sentRev.has(key)) continue;
    const bucket = byEmail.get(r.email) ?? { docs: [], manual: [], empdocs: [], reviews: [] };
    bucket.reviews.push({
      kind: r.kind,
      title: r.title,
      company: r.company_name,
      date: r.due_on,
      urgent: kind === "d1" || kind === "d7",
    });
    byEmail.set(r.email, bucket);
    toRecordRev.push({
      source_id: r.source_id,
      due_on: r.due_on,
      kind,
      email: r.email,
    });
  }

  let sent = 0;
  for (const [email, bucket] of byEmail) {
    const ok = await sendDigest(email, bucket.docs, bucket.manual, bucket.empdocs, bucket.reviews);
    if (!ok) continue;
    sent++;
    const dRows = toRecordDoc.filter((r) => r.email === email);
    const mRows = toRecordMan.filter((r) => r.email === email);
    const eRows = toRecordEmp.filter((r) => r.email === email);
    const rRows = toRecordRev.filter((r) => r.email === email);
    if (dRows.length) await admin.from("reminder_sent").insert(dRows);
    if (mRows.length) await admin.from("reminder_sent_manual").insert(mRows);
    if (eRows.length) await admin.from("employment_reminder_sent").insert(eRows);
    if (rRows.length) await admin.from("employment_review_reminder_sent").insert(rRows);
  }

  return NextResponse.json({
    recipients: byEmail.size,
    emailsSent: sent,
    documents: docDue.length,
    manual: manDue.length,
    employmentDocs: empDue.length,
    reviews: revDue.length,
  });
}
