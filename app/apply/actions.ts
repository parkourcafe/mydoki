"use server";

import { headers } from "next/headers";
import { createHash } from "crypto";
import { getSupabaseServer } from "@/lib/supabase/server";
import { normalizeWhatsapp } from "@/lib/career";

const SRC_ALLOWED = ["wa", "ig", "qr", "direct", "other"] as const;

export type SubmitApplicationInput = {
  applicationId: string; // UUID, сгенерирован клиентом (совпадает с путём файлов)
  slug: string;
  fullName: string;
  whatsapp: string;
  email?: string;
  consentText: string;
  source?: string; // метка воронки из ?src (wa/ig/qr/direct/other)
  turnstileToken?: string | null; // ответ Cloudflare Turnstile (анти-спам)
  answers: { question: string; type: string; answer: string }[];
  documents: {
    type: string;
    label: string;
    path: string;
    name: string;
    size: number;
  }[];
};

// Обезличенный хеш IP для анти-спама (не храним сам IP; §2.1). Соль — из env,
// с запасным значением, чтобы IPv4 нельзя было тривиально перебрать.
async function clientIp(): Promise<string | null> {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;
}
async function ipHashOf(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT || "doki-apply-v1";
  return createHash("sha256").update(salt + ip).digest("hex").slice(0, 32);
}

function safeName(name: string): string {
  return (name || "file").replace(/[^\w.\-]+/g, "_");
}

export type AttachedDoc = {
  type: string;
  label: string;
  path: string;
  name: string;
  size: number;
};

/**
 * Doc-reuse: копирует выбранные документы из сейфа кандидата в bucket
 * applications, чтобы работодатель читал их как обычные документы отклика.
 * Доступ к vault-files — по сессии кандидата (RLS: он член семьи). Возвращает
 * записи для payload документов. Только для залогиненного кандидата.
 */
export async function attachVaultDocs(input: {
  applicationId: string;
  vacancyId: string;
  documentIds: string[];
}): Promise<AttachedDoc[]> {
  if (!input.documentIds?.length) return [];
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const out: AttachedDoc[] = [];
  for (const docId of input.documentIds.slice(0, 20)) {
    const { data: doc } = await supabase
      .from("documents")
      .select("id, title, category")
      .eq("id", docId)
      .maybeSingle();
    if (!doc) continue; // RLS отсеет чужие
    const { data: files } = await supabase
      .from("document_files")
      .select("storage_path, file_name, mime_type")
      .eq("document_id", docId);
    for (const f of files ?? []) {
      const dl = await supabase.storage
        .from("vault-files")
        .download(f.storage_path as string);
      if (dl.error || !dl.data) continue;
      const blob = dl.data as Blob;
      const path = `${input.vacancyId}/${input.applicationId}/vault_${docId}_${safeName(
        f.file_name as string,
      )}`;
      const up = await supabase.storage
        .from("applications")
        .upload(path, blob, {
          contentType: (f.mime_type as string) || "application/octet-stream",
          upsert: true,
        });
      if (up.error) continue;
      out.push({
        type: (doc.category as string) || "other",
        label: (doc.title as string) || "Document",
        path,
        name: (f.file_name as string) || "file",
        size: blob.size,
      });
    }
  }
  return out;
}

/**
 * Проверка Turnstile. Включается только если задан TURNSTILE_SECRET_KEY —
 * до этого пропускаем (сайт не ломается). Блокируем ТОЛЬКО когда Cloudflare
 * явно ответил «не пройдено»; при сетевой ошибке нашей стороны — пропускаем,
 * чтобы не резать легитимных кандидатов из-за нашего сбоя.
 */
async function turnstileOk(
  token: string | null | undefined,
  ip: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // не настроено — не блокируем
  if (!token) return false; // настроено, но токена нет — это спам/бот
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return true; // наш сбой — не блокируем
  }
}

/**
 * Публичная подача отклика (без авторизации). Файлы уже загружены браузером
 * в bucket applications под {vacancy_id}/{applicationId}/… . RPC пишет всё
 * атомарно и возвращает access_token для страницы статуса.
 */
export async function submitApplication(
  input: SubmitApplicationInput
): Promise<{ accessToken: string }> {
  const supabase = await getSupabaseServer();
  const source = SRC_ALLOWED.includes(
    (input.source ?? "") as (typeof SRC_ALLOWED)[number],
  )
    ? input.source
    : "direct";

  const ip = await clientIp();
  if (!(await turnstileOk(input.turnstileToken, ip))) {
    throw new Error("turnstile_failed");
  }

  const { data, error } = await supabase.rpc("submit_application", {
    p_application_id: input.applicationId,
    p_slug: input.slug,
    p_full_name: input.fullName,
    p_whatsapp: normalizeWhatsapp(input.whatsapp),
    p_email: input.email || null,
    p_consent_text: input.consentText,
    p_answers: input.answers ?? [],
    p_documents: input.documents ?? [],
    p_source: source,
    p_ip_hash: await ipHashOf(ip),
  });
  if (error) throw error;
  const res = data as { application_id: string; access_token: string };
  return { accessToken: res.access_token };
}
