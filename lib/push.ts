import "server-only";
import webpush from "web-push";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Локализованные шаблоны уведомлений. Строки собираются по locale подписки.
type NotifType = "new_application" | "shortlisted";
const TEMPLATES: Record<string, Record<NotifType, (v: Record<string, string>) => { title: string; body: string }>> = {
  en: {
    new_application: (v) => ({ title: `New application: ${v.vacancy}`, body: v.name }),
    shortlisted: (v) => ({ title: `You're shortlisted: ${v.vacancy}`, body: "Open to see details." }),
  },
  id: {
    new_application: (v) => ({ title: `Lamaran baru: ${v.vacancy}`, body: v.name }),
    shortlisted: (v) => ({ title: `Anda terpilih: ${v.vacancy}`, body: "Buka untuk detail." }),
  },
  ru: {
    new_application: (v) => ({ title: `Новый отклик: ${v.vacancy}`, body: v.name }),
    shortlisted: (v) => ({ title: `Вас пригласили: ${v.vacancy}`, body: "Откройте, чтобы посмотреть." }),
  },
  uz: {
    new_application: (v) => ({ title: `Yangi ariza: ${v.vacancy}`, body: v.name }),
    shortlisted: (v) => ({ title: `Sizni tanlashdi: ${v.vacancy}`, body: "Batafsil ko‘rish uchun oching." }),
  },
};

let configured = false;
function configure(): boolean {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subj = process.env.VAPID_SUBJECT || "mailto:admin@doki.help";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subj, pub, priv);
  configured = true;
  return true;
}

type Subscription = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  locale: string;
  failed_count: number;
};

/**
 * Отправка пуша всем подпискам пользователя. Читает/чистит подписки через
 * service role (получатель ≠ вызывающий, RLS не пустит под чужой сессией).
 * Мёртвые эндпоинты (404/410) удаляются; прочие ошибки инкрементят счётчик
 * (удаляем при ≥5). Тихо ничего не делает без VAPID/service role.
 */
export async function sendPushToUser(
  userId: string,
  input: { type: NotifType; vars: Record<string, string>; url: string }
): Promise<void> {
  if (!configure()) return;
  const admin = getSupabaseAdmin();
  if (!admin) return;

  const { data } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth, locale, failed_count")
    .eq("user_id", userId);
  const subs = (data ?? []) as Subscription[];

  for (const s of subs) {
    const tpl = (TEMPLATES[s.locale] ?? TEMPLATES.en)[input.type](input.vars);
    const payload = JSON.stringify({ title: tpl.title, body: tpl.body, url: input.url });
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      );
      await admin
        .from("push_subscriptions")
        .update({ last_success_at: new Date().toISOString(), failed_count: 0 })
        .eq("id", s.id);
    } catch (e) {
      const code = (e as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) {
        await admin.from("push_subscriptions").delete().eq("id", s.id);
      } else {
        const fc = (s.failed_count ?? 0) + 1;
        if (fc >= 5) await admin.from("push_subscriptions").delete().eq("id", s.id);
        else await admin.from("push_subscriptions").update({ failed_count: fc }).eq("id", s.id);
      }
    }
  }
}
