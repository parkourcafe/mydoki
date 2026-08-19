"use server";

import { headers } from "next/headers";
import { createHash } from "crypto";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeWhatsapp, parseSource, type Source } from "@/lib/career";
import { currentIpHash, verifyTurnstile } from "@/lib/antispam";
import { sendNewApplicationEmail, sendAdminReportAlert } from "@/lib/email";
import { sendPushToUser } from "@/lib/push";
import { getLocale } from "@/lib/i18n";
import { passportFromRow } from "@/lib/passport";
import { evaluateCriteria, type VacancyCriteria } from "@/lib/matching";
import {
  defaultVisibilityPolicy,
  normalizeVisibilityMode,
  type VisibilityPolicy,
} from "@/lib/passportVisibility";
import {
  PROFILE_SNAPSHOT_FIELDS,
  buildApplicationSnapshot,
} from "@/lib/passportSnapshot";

// ---------------------------- Report ----------------------------------

export type ReportInput = {
  slug: string;
  reason: "scam" | "data_collection" | "fake" | "other";
  comment?: string;
  contact?: string;
  turnstileToken?: string | null;
  vacancyTitle: string;
  company: string;
  vacancyId: string;
};

export type ReportResult =
  | { ok: true; paused: boolean }
  | { ok: false; error: "turnstile" | "rate_limited" | "generic" };

/** Жалоба кандидата на вакансию (anon). Turnstile → RPC (лимит+порог). */
export async function reportVacancy(input: ReportInput): Promise<ReportResult> {
  const okToken = await verifyTurnstile(input.turnstileToken);
  if (!okToken) return { ok: false, error: "turnstile" };

  const supabase = await getSupabaseServer();
  const ipHash = await currentIpHash();
  const { data, error } = await supabase.rpc("report_vacancy", {
    p_slug: input.slug,
    p_reason: input.reason,
    p_comment: input.comment ?? null,
    p_contact: input.contact ?? null,
    p_ip_hash: ipHash,
  });
  if (error) return { ok: false, error: "generic" };

  const r = (data ?? {}) as { rate_limited?: boolean; paused?: boolean; ok?: boolean };
  if (r.rate_limited) return { ok: false, error: "rate_limited" };

  if (r.paused) {
    await sendAdminReportAlert({
      vacancyTitle: input.vacancyTitle,
      company: input.company,
      reasons: input.reason,
      vacancyId: input.vacancyId,
    });
  }
  return { ok: true, paused: r.paused === true };
}

// ---------------------------- Views -----------------------------------

/** Инкремент счётчика просмотров вакансии (anon). Клиент дедуплицирует по сессии. */
export async function incrementVacancyView(slug: string): Promise<void> {
  const supabase = await getSupabaseServer();
  await supabase.rpc("increment_vacancy_views", { p_slug: slug });
}

// ---------------------------- Precheck --------------------------------

export type PrecheckResult = {
  ok?: boolean;
  duplicate?: boolean;
  accessToken?: string;
  rateLimited?: boolean;
  notFound?: boolean;
};

/**
 * Быстрая проверка ПЕРЕД загрузкой файлов: дубликат и лимит по IP — чтобы не
 * заливать файлы впустую. Финальный submit всё равно перепроверяет (backstop).
 */
export async function precheckApplication(input: {
  slug: string;
  whatsapp: string;
}): Promise<PrecheckResult> {
  const supabase = await getSupabaseServer();
  const ipHash = await currentIpHash();
  const { data, error } = await supabase.rpc("precheck_application", {
    p_slug: input.slug,
    p_whatsapp: normalizeWhatsapp(input.whatsapp),
    p_ip_hash: ipHash,
  });
  if (error) return { ok: true };
  const r = (data ?? {}) as Record<string, unknown>;
  return {
    ok: r.ok === true,
    duplicate: r.duplicate === true,
    accessToken: (r.access_token as string) ?? undefined,
    rateLimited: r.rate_limited === true,
    notFound: r.not_found === true,
  };
}

// ---------------------------- Submit ----------------------------------

const SRC_ALLOWED = ["wa", "ig", "qr", "direct", "other"] as const;

export type SubmitApplicationInput = {
  applicationId: string;
  slug: string;
  fullName: string;
  whatsapp: string;
  email?: string;
  consentText: string;
  source?: string; // метка воронки из ?src (wa/ig/qr/direct/other)
  turnstileToken?: string | null; // ответ Cloudflare Turnstile (анти-спам)
  answers: { question: string; type: string; answer: string }[];
  documents: { type: string; label: string; path: string; name: string; size: number }[];
  docsComplete: number;
  docsTotal: number;
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
 * Проверка Turnstile. Включается только если задан TURNSTILE_SECRET_KEY
 * (не настроено — Turnstile выключен по конфигурации, сайт не ломается).
 * Когда Turnstile активен, проверка fail-closed: пропускаем только при
 * явном success=true от Cloudflare. Нет токена, не-200, невалидный ответ
 * или сетевая ошибка → блокируем (иначе бот проходит при нашем сбое).
 */
async function turnstileOk(
  token: string | null | undefined,
  ip: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // не настроено — Turnstile выключен
  if (!token) return false; // настроено, но токена нет — это спам/бот
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    if (!res.ok) return false; // Cloudflare недоступен — fail-closed
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false; // сетевой сбой при активном Turnstile — fail-closed
  }
}

export type SubmitResult =
  | { ok: true; duplicate: boolean; accessToken: string }
  | { ok: false; error: "turnstile" | "rate_limited" | "generic" };

/**
 * Публичная подача отклика (без авторизации). Порядок: Turnstile → лимит IP →
 * дубликат → создание (лимит и дубликат также внутри submit_application).
 * Ошибка письма работодателю НЕ роняет подачу.
 */
export async function submitApplication(
  input: SubmitApplicationInput
): Promise<SubmitResult> {
  const okToken = await verifyTurnstile(input.turnstileToken);
  if (!okToken) return { ok: false, error: "turnstile" };

  const supabase = await getSupabaseServer();
  // parseSource нормализует метку воронки и всегда возвращает валидное
  // значение (по умолчанию 'direct') — без undefined.
  const source = parseSource(input.source);

  const ip = await clientIp();

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

  if (error) {
    if ((error.message || "").includes("rate_limited")) return { ok: false, error: "rate_limited" };
    return { ok: false, error: "generic" };
  }

  const res = data as {
    duplicate: boolean;
    access_token: string;
    vacancy_id?: string;
    employer_email?: string | null;
    vacancy_title?: string;
    company_name?: string;
  };

  if (!res.duplicate && res.employer_email) {
    const locale = await getLocale();
    await sendNewApplicationEmail({
      to: res.employer_email,
      locale,
      candidateName: input.fullName,
      vacancyTitle: res.vacancy_title ?? "",
      companyName: res.company_name ?? "",
      docsComplete: input.docsComplete,
      docsTotal: input.docsTotal,
      source,
      vacancyId: res.vacancy_id ?? "",
    });
  }

  // Пуш владельцу вакансии (T9). Владельца ищем через service role.
  if (!res.duplicate && res.vacancy_id) {
    const admin = getSupabaseAdmin();
    if (admin) {
      const { data: vac } = await admin
        .from("vacancies")
        .select("employer_id")
        .eq("id", res.vacancy_id)
        .maybeSingle();
      const employerId = (vac as { employer_id?: string } | null)?.employer_id;
      if (employerId) {
        const { data: ep } = await admin
          .from("employer_profiles")
          .select("user_id")
          .eq("id", employerId)
          .maybeSingle();
        const ownerId = (ep as { user_id?: string } | null)?.user_id;
        if (ownerId) {
          await sendPushToUser(ownerId, {
            type: "new_application",
            vars: { vacancy: res.vacancy_title ?? "", name: input.fullName },
            url: `/employer/vacancies/${res.vacancy_id}`,
          });
        }
      }
    }
  }

  // Неизменяемый снимок профиля на момент отклика (архитектура v1.2 §10,
  // фаза 1B). Ошибка снимка НЕ роняет подачу отклика.
  if (!res.duplicate) {
    await recordApplicationSnapshot({
      applicationId: input.applicationId,
      accessToken: res.access_token,
      slug: input.slug,
    }).catch(() => {});
  }

  return { ok: true, duplicate: res.duplicate, accessToken: res.access_token };
}

/**
 * Снимок фиксирует, какой профиль, какие требования вакансии, какое
 * объяснение по критериям и какое состояние видимости действовали в момент
 * отклика. Последующие правки паспорта его не переписывают (§17.13).
 *
 * Отклик может быть анонимным (career MVP): тогда структурированного
 * паспорта нет, и снимок честно фиксирует пустой профиль, а не выдумывает
 * данные. Авторизация — по секретному токену отклика.
 */
async function recordApplicationSnapshot(input: {
  applicationId: string;
  accessToken: string;
  slug: string;
}): Promise<void> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [vacancy, resume, visibility] = await Promise.all([
    supabase
      .from("vacancies")
      .select("id, hard_criteria, soft_signals")
      .eq("slug", input.slug)
      .maybeSingle(),
    user
      ? supabase.from("resumes").select("*").eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("profile_visibility_policies")
          .select("mode, hide_current_employer, current_employer_names, hidden_fields")
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const now = new Date().toISOString();
  const passport = passportFromRow((resume.data ?? null) as Record<string, unknown> | null);
  const criteria: VacancyCriteria = {
    vacancy_version_id: ((vacancy.data as { id?: string } | null)?.id ?? input.slug) as string,
    hard: ((vacancy.data as { hard_criteria?: unknown })?.hard_criteria ?? {}) as never,
    soft: ((vacancy.data as { soft_signals?: unknown })?.soft_signals ?? {}) as never,
  };

  const policyRow = visibility.data as {
    mode: string;
    hide_current_employer: boolean;
    current_employer_names: string[] | null;
    hidden_fields: string[] | null;
  } | null;

  const policy: VisibilityPolicy = policyRow
    ? {
        ...defaultVisibilityPolicy(),
        mode: normalizeVisibilityMode(policyRow.mode),
        hide_current_employer: policyRow.hide_current_employer,
        current_employer_names: policyRow.current_employer_names ?? [],
        hidden_fields: policyRow.hidden_fields ?? [],
      }
    : defaultVisibilityPolicy();

  // Поля, скрытые кандидатом в настройках видимости, не попадают в снимок:
  // работодатель читает снимок отклика, а field-level скрытие действует и здесь.
  const shared = PROFILE_SNAPSHOT_FIELDS.filter(
    (field) => !policy.hidden_fields.includes(field),
  );

  const snapshot = buildApplicationSnapshot({
    passport,
    criteria,
    // Без структурированного профиля объяснения по критериям не существует.
    explanation: user
      ? evaluateCriteria({
          criteria,
          passport,
          profile_version_id: user.id,
          now,
        })
      : null,
    policy,
    reveal_level: "shared",
    shared_fields: shared,
    timestamp: now,
  });

  await supabase.rpc("record_application_profile_snapshot", {
    p_application_id: input.applicationId,
    p_access_token: input.accessToken,
    p_profile: snapshot.candidate_profile_snapshot,
    p_requirements: snapshot.vacancy_requirements_snapshot,
    p_match_explanation: snapshot.match_explanation_snapshot,
    p_visibility_state: snapshot.visibility_state_snapshot,
    p_checksum: snapshot.checksum,
  });
}

// ---------------------------- Claim -----------------------------------

/**
 * Claim после регистрации: связывает отклик с аккаунтом (claim_application) и
 * копирует загруженные файлы в личный vault кандидата. Чтение приватного
 * bucket `applications` требует service_role (владелец — работодатель),
 * поэтому копирование делаем admin-клиентом; запись в vault — сессией юзера.
 * Без service_role связь ставится, копирование пропускается.
 */
export type ClaimReason = "identity_mismatch" | "already_claimed" | "not_found";

export async function claimApplication(
  token: string
): Promise<{
  ok: boolean;
  copied: number;
  linkedOnly?: boolean;
  reason?: ClaimReason;
}> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, copied: 0 };

  const { data: claim } = await supabase.rpc("claim_application", { p_token: token });
  const c = (claim ?? {}) as {
    ok?: boolean;
    application_id?: string;
    reason?: ClaimReason;
  };
  // Причину отказа показываем кандидату: чаще всего он вошёл под другим
  // контактом, и без подсказки это выглядит как поломка.
  if (!c.ok || !c.application_id) {
    return { ok: false, copied: 0, reason: c.reason ?? "not_found" };
  }

  const admin = getSupabaseAdmin();
  if (!admin) return { ok: true, copied: 0, linkedOnly: true };

  const { data: docs } = await admin
    .from("application_documents")
    .select("document_type, document_label, file_path, file_name")
    .eq("application_id", c.application_id);
  const docList = (docs ?? []) as {
    document_type: string;
    document_label: string;
    file_path: string;
    file_name: string;
  }[];
  if (!docList.length) return { ok: true, copied: 0 };

  // household кандидата (создаём при отсутствии).
  let householdId: string | null = null;
  const { data: mem } = await supabase
    .from("household_members")
    .select("household_id")
    .limit(1)
    .maybeSingle();
  if (mem) householdId = (mem as { household_id: string }).household_id;
  else {
    const { data: hid } = await supabase.rpc("create_household", { p_name: "My documents" });
    householdId = (hid as string) ?? null;
  }
  if (!householdId) return { ok: true, copied: 0, linkedOnly: true };

  // member (нужен documents.member_id NOT NULL).
  let memberId: string | null = null;
  const { data: m } = await supabase
    .from("members")
    .select("id")
    .eq("household_id", householdId)
    .limit(1)
    .maybeSingle();
  if (m) memberId = (m as { id: string }).id;
  else {
    const { data: nm } = await supabase
      .from("members")
      .insert({ household_id: householdId, full_name: "Me" })
      .select("id")
      .single();
    memberId = (nm as { id: string } | null)?.id ?? null;
  }
  if (!memberId) return { ok: true, copied: 0, linkedOnly: true };

  let copied = 0;
  for (const d of docList) {
    const dl = await admin.storage.from("applications").download(d.file_path);
    if (dl.error || !dl.data) continue;
    const blob = dl.data;
    const { data: docRow } = await supabase
      .from("documents")
      .insert({
        household_id: householdId,
        member_id: memberId,
        category: "other",
        title: d.document_label || d.file_name || "Document",
      })
      .select("id")
      .single();
    const docId = (docRow as { id: string } | null)?.id;
    if (!docId) continue;
    const safe = (d.file_name || "file").replace(/[^\w.\-]+/g, "_");
    const path = `${householdId}/${docId}/${Date.now()}-${safe}`;
    const up = await supabase.storage.from("vault-files").upload(path, blob, {
      contentType: "application/octet-stream",
      upsert: false,
    });
    if (up.error) continue;
    await supabase.from("document_files").insert({
      document_id: docId,
      household_id: householdId,
      storage_path: path,
      file_name: d.file_name,
      size_bytes: blob.size,
    });
    copied++;
  }

  return { ok: true, copied };
}
