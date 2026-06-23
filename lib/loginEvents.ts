import "server-only";
import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Краткая метка устройства из User-Agent (для письма/SMS). */
function deviceLabel(ua: string): string {
  const os =
    /iPhone|iPad/.test(ua) ? "iPhone/iPad" :
    /Android/.test(ua) ? "Android" :
    /Windows/.test(ua) ? "Windows" :
    /Macintosh|Mac OS/.test(ua) ? "Mac" :
    /Linux/.test(ua) ? "Linux" : "устройство";
  const br =
    /Edg\//.test(ua) ? "Edge" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) ? "Safari" : "браузер";
  return `${br} · ${os}`;
}

async function sendNewDeviceEmail(
  to: string,
  info: { device: string; ip: string | null; when: Date }
) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return;
  const from =
    process.env.ALERT_EMAIL_FROM || "Семейный сейф <onboarding@resend.dev>";
  const when = info.when.toLocaleString("ru-RU");
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
        subject: "🔐 Новый вход в Семейный сейф",
        html: `<p>В ваш аккаунт вошли с нового устройства.</p>
<ul>
<li><b>Устройство:</b> ${info.device}</li>
<li><b>IP:</b> ${info.ip ?? "неизвестно"}</li>
<li><b>Время:</b> ${when}</li>
</ul>
<p>Если это были не вы — смените пароль и включите 2FA в разделе «Безопасность».</p>`,
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
      const device = deviceLabel(ua);
      if (user.email) {
        await sendNewDeviceEmail(user.email, { device, ip, when: new Date() });
      }
      const phone = (user.user_metadata?.alert_phone as string | undefined) ?? "";
      if (phone) {
        await sendSms(
          phone,
          `Семейный сейф: вход с нового устройства (${device}). Если это не вы — смените пароль.`
        );
      }
    }
  } catch {
    // журнал входов не должен ломать сам вход
  }
}
