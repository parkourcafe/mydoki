import "server-only";
import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getLocale, type Locale } from "./i18n";

const M = {
  ru: {
    subject: "🔐 Новый вход в Семейный сейф",
    intro: "В ваш аккаунт вошли с нового устройства.",
    device: "Устройство",
    ip: "IP",
    time: "Время",
    unknownIp: "неизвестно",
    footer:
      "Если это были не вы — смените пароль и включите 2FA в разделе «Безопасность».",
    fallbackDevice: "устройство",
    fallbackBrowser: "браузер",
    sms: (device: string) =>
      `Семейный сейф: вход с нового устройства (${device}). Если это не вы — смените пароль.`,
    dateTag: "ru-RU",
  },
  en: {
    subject: "🔐 New sign-in to Family Vault",
    intro: "Your account was accessed from a new device.",
    device: "Device",
    ip: "IP",
    time: "Time",
    unknownIp: "unknown",
    footer:
      "If this wasn't you — change your password and enable 2FA under “Security”.",
    fallbackDevice: "device",
    fallbackBrowser: "browser",
    sms: (device: string) =>
      `Family Vault: sign-in from a new device (${device}). If this wasn't you — change your password.`,
    dateTag: "en-US",
  },
  id: {
    subject: "🔐 Masuk baru ke Brankas Keluarga",
    intro: "Akun Anda diakses dari perangkat baru.",
    device: "Perangkat",
    ip: "IP",
    time: "Waktu",
    unknownIp: "tidak diketahui",
    footer:
      "Jika ini bukan Anda — ubah kata sandi dan aktifkan 2FA di bagian “Keamanan”.",
    fallbackDevice: "perangkat",
    fallbackBrowser: "peramban",
    sms: (device: string) =>
      `Brankas Keluarga: masuk dari perangkat baru (${device}). Jika ini bukan Anda — ubah kata sandi.`,
    dateTag: "id-ID",
  },
  uz: {
    subject: "🔐 Oilaviy seyfga yangi kirish",
    intro: "Hisobingizga yangi qurilmadan kirildi.",
    device: "Qurilma",
    ip: "IP",
    time: "Vaqt",
    unknownIp: "nomaʼlum",
    footer:
      "Agar bu siz boʻlmasangiz — parolni oʻzgartiring va «Xavfsizlik» boʻlimida 2FA ni yoqing.",
    fallbackDevice: "qurilma",
    fallbackBrowser: "brauzer",
    sms: (device: string) =>
      `Oilaviy seyf: yangi qurilmadan kirish (${device}). Agar bu siz boʻlmasangiz — parolni oʻzgartiring.`,
    dateTag: "uz-UZ",
  },
} as const;

/** Краткая метка устройства из User-Agent (для письма/SMS). */
function deviceLabel(ua: string, t: (typeof M)[Locale]): string {
  const os =
    /iPhone|iPad/.test(ua) ? "iPhone/iPad" :
    /Android/.test(ua) ? "Android" :
    /Windows/.test(ua) ? "Windows" :
    /Macintosh|Mac OS/.test(ua) ? "Mac" :
    /Linux/.test(ua) ? "Linux" : t.fallbackDevice;
  const br =
    /Edg\//.test(ua) ? "Edge" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) ? "Safari" : t.fallbackBrowser;
  return `${br} · ${os}`;
}

async function sendNewDeviceEmail(
  to: string,
  info: { device: string; ip: string | null; when: Date },
  t: (typeof M)[Locale]
) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return;
  const from =
    process.env.ALERT_EMAIL_FROM || "Семейный сейф <noreply@doki.help>";
  const when = info.when.toLocaleString(t.dateTag);
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: t.subject,
        html: `<p>${t.intro}</p>
<ul>
<li><b>${t.device}:</b> ${info.device}</li>
<li><b>${t.ip}:</b> ${info.ip ?? t.unknownIp}</li>
<li><b>${t.time}:</b> ${when}</li>
</ul>
<p>${t.footer}</p>`,
      }),
    });
  } catch {
    // оповещение не должно мешать входу
  }
}

async function sendSms(to: string, text: string) {
  const phone = to.replace(/[^\d+]/g, "");
  if (!phone) return;
  try {
    const smsruId = process.env.SMSRU_API_ID;
    if (smsruId) {
      const u = new URL("https://sms.ru/sms/send");
      u.searchParams.set("api_id", smsruId);
      u.searchParams.set("to", phone);
      u.searchParams.set("msg", text);
      u.searchParams.set("json", "1");
      await fetch(u.toString());
      return;
    }
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM;
    if (sid && token && from) {
      const body = new URLSearchParams({ To: phone, From: from, Body: text });
      await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization:
              "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        }
      );
    }
  } catch {
    // SMS не должен мешать входу
  }
}

/** Пишет вход в журнал; при входе с нового устройства — шлёт письмо и SMS. */
export async function recordLogin(supabase: SupabaseClient) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const h = await headers();
    const ua = h.get("user-agent") ?? "";
    const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;

    const { count: totalPrior } = await supabase
      .from("login_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { data: sameDevice } = await supabase
      .from("login_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("user_agent", ua)
      .limit(1);

    const isNew = !sameDevice || sameDevice.length === 0;

    await supabase.from("login_events").insert({
      user_id: user.id,
      ip,
      user_agent: ua,
      is_new_device: isNew,
    });

    // Оповещения — только для нового устройства и не на самый первый вход.
    if (isNew && (totalPrior ?? 0) > 0) {
      const t = M[await getLocale()];
      const device = deviceLabel(ua, t);
      if (user.email) {
        await sendNewDeviceEmail(user.email, { device, ip, when: new Date() }, t);
      }
      const phone = (user.user_metadata?.alert_phone as string | undefined) ?? "";
      if (phone) {
        await sendSms(phone, t.sms(device));
      }
    }
  } catch {
    // журнал входов не должен ломать сам вход
  }
}
