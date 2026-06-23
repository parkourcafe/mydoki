import { createClient } from "@supabase/supabase-js";

/**
 * Админ-клиент с service_role. ТОЛЬКО на сервере. Нужен исключительно для
 * страницы share-ссылки (/s/[token]): анонимный получатель не является членом
 * семьи, поэтому короткий signed URL к приватному файлу должен подписать сервер.
 * Возвращает null, если ключ не задан — страница покажет понятную ошибку.
 */
export function getSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
