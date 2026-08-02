import "server-only";
import type { Locale } from "./i18n";
import { appBaseUrl } from "./career";

type EmailLocale = "en" | "id";

/** Базовая отправка через Resend. Возвращает причину сбоя вызывающему коду. */
async function resendSend(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: true } | { ok: false; reason: "not_configured" | "provider" }> {
  const key = process.env.RESEND_API_KEY;
  const from =
    process.env.NOTIFY_FROM_EMAIL ||
    process.env.ALERT_EMAIL_FROM ||
    "Doki <noreply@doki.help>";
  if (!key) {
    console.error(`[email] RESEND_API_KEY not set — cannot send "${subject}" to ${to}.`);
    return { ok: false, reason: "not_configured" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[email] Resend responded", res.status, await res.text());
      return { ok: false, reason: "provider" };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] send failed:", e);
    return { ok: false, reason: "provider" };
  }
}

/**
 * Провайдер-интерфейс отправки кода подтверждения. Сейчас драйвер `email`
 * (Resend); `whatsapp` — заглушка под WhatsApp Cloud API (D5 fast-follow).
 */
export async function sendVerificationCode(
  channel: "email" | "whatsapp",
  target: string,
  code: string,
  locale?: Locale
): Promise<{ ok: boolean; reason?: "not_configured" | "provider" }> {
  if (channel === "whatsapp") {
    console.warn(`[verify] WhatsApp channel not configured (D5) — code for ${target}: ${code}`);
    return { ok: false, reason: "not_configured" };
  }
  const loc: Locale = locale ?? "en";
  const T = {
    en: { subject: "Your Doki verification code", line: "Your verification code is", hint: "It expires in 15 minutes." },
    id: { subject: "Kode verifikasi Doki Anda", line: "Kode verifikasi Anda adalah", hint: "Berlaku selama 15 menit." },
    ru: { subject: "Ваш код подтверждения Doki", line: "Ваш код подтверждения", hint: "Действует 15 минут." },
    uz: { subject: "Doki tasdiqlash kodingiz", line: "Tasdiqlash kodingiz", hint: "15 daqiqa amal qiladi." },
  }[loc];
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:420px;margin:0 auto;color:#2c2522;text-align:center">
      <p>${T.line}:</p>
      <p style="font-size:34px;font-weight:700;letter-spacing:6px;color:#b85c38">${code}</p>
      <p style="color:#9c9288;font-size:13px">${T.hint}</p>
    </div>`;
  return resendSend(target, T.subject, html);
}

/** Алерт админу об авто-паузе вакансии по жалобам. */
export async function sendAdminReportAlert(params: {
  vacancyTitle: string;
  company: string;
  reasons: string;
  vacancyId: string;
}): Promise<void> {
  const to = process.env.ADMIN_ALERT_EMAIL;
  if (!to) return;
  const dashboardUrl = `${appBaseUrl()}/employer/vacancies/${params.vacancyId}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2c2522">
      <h2 style="color:#b85c38">Vacancy auto-paused by reports</h2>
      <p><b>${params.vacancyTitle}</b> — ${params.company}</p>
      <p style="color:#5c5248">Reasons: ${params.reasons}</p>
      <p><a href="${dashboardUrl}">${dashboardUrl}</a></p>
    </div>`;
  await resendSend(to, `Vacancy auto-paused: ${params.vacancyTitle}`, html);
}

/**
 * Письмо работодателю о новом отклике. Двуязычные шаблоны (EN/ID).
 * Отправка через Resend (как остальные письма mydoki). Ошибка НЕ роняет подачу.
 */
export async function sendNewApplicationEmail(params: {
  to: string;
  locale?: Locale;
  candidateName: string;
  vacancyTitle: string;
  companyName: string;
  docsComplete: number;
  docsTotal: number;
  source: string;
  vacancyId: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from =
    process.env.NOTIFY_FROM_EMAIL ||
    process.env.ALERT_EMAIL_FROM ||
    "Doki <noreply@doki.help>";
  const dashboardUrl = `${appBaseUrl()}/employer/vacancies/${params.vacancyId}`;

  // ID для индонезийского локейла, иначе EN.
  const loc: EmailLocale = params.locale === "id" ? "id" : "en";
  const T = {
    en: {
      subject: `New application: ${params.candidateName} — ${params.vacancyTitle}`,
      heading: "New application received",
      intro: `${params.candidateName} applied for ${params.vacancyTitle} at ${params.companyName}.`,
      docs: `Documents: ${params.docsComplete}/${params.docsTotal} uploaded`,
      src: `Source: ${params.source}`,
      cta: "Open dashboard",
    },
    id: {
      subject: `Lamaran baru: ${params.candidateName} — ${params.vacancyTitle}`,
      heading: "Lamaran baru masuk",
      intro: `${params.candidateName} melamar ${params.vacancyTitle} di ${params.companyName}.`,
      docs: `Dokumen: ${params.docsComplete}/${params.docsTotal} terunggah`,
      src: `Sumber: ${params.source}`,
      cta: "Buka dasbor",
    },
  }[loc];

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2c2522">
      <h2 style="color:#b85c38">${T.heading}</h2>
      <p>${T.intro}</p>
      <p style="color:#5c5248">${T.docs}<br>${T.src}</p>
      <p><a href="${dashboardUrl}" style="display:inline-block;background:#b85c38;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">${T.cta}</a></p>
      <p style="color:#9c9288;font-size:12px">doki.help</p>
    </div>`;

  if (!key) {
    console.warn(
      `[email] RESEND_API_KEY not set — would send to ${params.to}: "${T.subject}" (dev, skipped).`
    );
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from, to: params.to, subject: T.subject, html }),
    });
    if (!res.ok) {
      console.error("[email] Resend responded", res.status, await res.text());
    }
  } catch (e) {
    // Ошибка письма НЕ должна ронять подачу отклика.
    console.error("[email] send failed:", e);
  }
}
