import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import { waLink, type RequiredDocument } from "@/lib/career";
import type { Offer } from "@/lib/offer";
import CandidateActions from "./CandidateActions";
import CandidateAI, { type AiRunView } from "./CandidateAI";
import EmployeeOnboard from "./EmployeeOnboard";
import CandidateOffer from "./CandidateOffer";

const M = {
  ru: {
    back: "← К вакансии",
    stage: "Этап",
    state: "Статус",
    profile: "Профиль",
    whatsapp: "WhatsApp",
    email: "Email",
    answers: "Ответы",
    noAnswers: "Ответов нет.",
    history: "История",
    noHistory: "Событий пока нет.",
    consents: "Согласия",
    consentGiven: "Согласие дано",
    consentRevoked: "Согласие отозвано",
    stActive: "В работе",
    stHired: "Принят",
    stRejected: "Отказ",
    stWithdrawn: "Отозван",
    rejectedReason: "Причина отказа",
    ev: {
      stage_change: "Смена этапа",
      note: "Заметка",
      document_request: "Запрос документов",
      consent: "Согласие",
      withdraw: "Отклик отозван",
      ai_analysis: "AI-анализ",
      offer: "Оффер",
    } as Record<string, string>,
    stageNames: {
      new: "Новый", review: "Рассмотрение", interview: "Интервью",
      assignment: "Задание", decision: "Решение",
    } as Record<string, string>,
  },
  en: {
    back: "← Back to vacancy",
    stage: "Stage",
    state: "Status",
    profile: "Profile",
    whatsapp: "WhatsApp",
    email: "Email",
    answers: "Answers",
    noAnswers: "No answers.",
    history: "History",
    noHistory: "No events yet.",
    consents: "Consents",
    consentGiven: "Consent given",
    consentRevoked: "Consent revoked",
    stActive: "Active",
    stHired: "Hired",
    stRejected: "Rejected",
    stWithdrawn: "Withdrawn",
    rejectedReason: "Rejection reason",
    ev: {
      stage_change: "Stage change",
      note: "Note",
      document_request: "Document request",
      consent: "Consent",
      withdraw: "Application withdrawn",
      ai_analysis: "AI analysis",
      offer: "Offer",
    } as Record<string, string>,
    stageNames: {
      new: "New", review: "Review", interview: "Interview",
      assignment: "Assignment", decision: "Decision",
    } as Record<string, string>,
  },
  uz: {
    back: "← Vakansiyaga",
    stage: "Bosqich",
    state: "Holat",
    profile: "Profil",
    whatsapp: "WhatsApp",
    email: "Email",
    answers: "Javoblar",
    noAnswers: "Javoblar yoʻq.",
    history: "Tarix",
    noHistory: "Hozircha voqealar yoʻq.",
    consents: "Roziliklar",
    consentGiven: "Rozilik berilgan",
    consentRevoked: "Rozilik bekor qilingan",
    stActive: "Jarayonda",
    stHired: "Qabul qilindi",
    stRejected: "Rad etildi",
    stWithdrawn: "Qaytarib olindi",
    rejectedReason: "Rad etish sababi",
    ev: {
      stage_change: "Bosqich oʻzgarishi",
      note: "Eslatma",
      document_request: "Hujjat soʻrovi",
      consent: "Rozilik",
      withdraw: "Ariza qaytarib olindi",
      ai_analysis: "AI tahlil",
      offer: "Taklif",
    } as Record<string, string>,
    stageNames: {
      new: "Yangi", review: "Koʻrib chiqish", interview: "Suhbat",
      assignment: "Topshiriq", decision: "Qaror",
    } as Record<string, string>,
  },
  id: {
    back: "← Kembali ke lowongan",
    stage: "Tahap",
    state: "Status",
    profile: "Profil",
    whatsapp: "WhatsApp",
    email: "Email",
    answers: "Jawaban",
    noAnswers: "Tidak ada jawaban.",
    history: "Riwayat",
    noHistory: "Belum ada peristiwa.",
    consents: "Persetujuan",
    consentGiven: "Persetujuan diberikan",
    consentRevoked: "Persetujuan dicabut",
    stActive: "Berjalan",
    stHired: "Diterima",
    stRejected: "Ditolak",
    stWithdrawn: "Ditarik",
    rejectedReason: "Alasan penolakan",
    ev: {
      stage_change: "Perubahan tahap",
      note: "Catatan",
      document_request: "Permintaan dokumen",
      consent: "Persetujuan",
      withdraw: "Lamaran ditarik",
      ai_analysis: "Analisis AI",
      offer: "Penawaran",
    } as Record<string, string>,
    stageNames: {
      new: "Baru", review: "Ditinjau", interview: "Wawancara",
      assignment: "Tugas", decision: "Keputusan",
    } as Record<string, string>,
  },
} as const;

type AppRow = {
  id: string;
  vacancy_id: string;
  user_id: string | null;
  full_name: string;
  whatsapp: string;
  email: string | null;
  status: string;
  stage: string | null;
  state: string | null;
  rejected_reason: string | null;
  consent_text: string | null;
  consent_given_at: string | null;
  consent_revoked_at: string | null;
  created_at: string;
};
type EventRow = {
  id: string;
  actor_kind: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export default async function CandidatePage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const locale = await getLocale();
  const t = M[locale];
  const { applicationId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");
  const supabase = await getSupabaseServer();

  // Гейт по владельцу: у пользователя есть employer_profile, и вакансия
  // отклика принадлежит ему. Кандидат (даже видя строку по своей RLS) не
  // пройдёт: у него нет профиля, владеющего вакансией.
  const { data: profile } = await supabase
    .from("employer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/employer");

  const { data: appData } = await supabase
    .from("applications")
    .select(
      "id, vacancy_id, user_id, full_name, whatsapp, email, status, stage, state, rejected_reason, consent_text, consent_given_at, consent_revoked_at, created_at"
    )
    .eq("id", applicationId)
    .maybeSingle();
  const app = appData as AppRow | null;
  if (!app) notFound();

  const { data: vacData } = await supabase
    .from("vacancies")
    .select("id, title, slug, stages, required_documents")
    .eq("id", app.vacancy_id)
    .eq("employer_id", profile.id)
    .maybeSingle();
  if (!vacData) notFound();
  const vacancy = vacData as {
    id: string;
    title: string;
    slug: string;
    stages: string[] | null;
    required_documents: RequiredDocument[] | null;
  };

  const consentRevoked = !!app.consent_revoked_at;

  // Документы отклика — только если согласие не отозвано (app-level).
  const docs = consentRevoked
    ? []
    : (
        (
          await supabase
            .from("application_documents")
            .select("document_type, document_label, file_name, file_path")
            .eq("application_id", app.id)
        ).data ?? []
      ).map((d) => ({
        type: d.document_type as string,
        label: d.document_label as string,
        file_name: d.file_name as string,
        path: d.file_path as string,
      }));

  const [{ data: answerData }, { data: eventData }, { data: runData }] =
    await Promise.all([
      supabase
        .from("application_answers")
        .select("question, answer, question_type")
        .eq("application_id", app.id),
      supabase
        .from("application_events")
        .select("id, actor_kind, type, payload, created_at")
        .eq("application_id", app.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("ai_runs")
        .select("id, kind, output, groundings, state, review_action, created_at")
        .eq("subject_type", "application")
        .eq("subject_id", app.id)
        .order("created_at", { ascending: false }),
    ]);
  const aiRuns = (runData ?? []) as AiRunView[];
  const answers = (answerData ?? []) as {
    question: string;
    answer: string;
    question_type: string;
  }[];
  const events = (eventData ?? []) as EventRow[];

  // Оформление сотрудника доступно после найма. Ищем уже созданную запись
  // employment по этому отклику (одна каноническая запись — v1.1 §7.4).
  const isHired = app.state === "hired" || app.status === "hired";
  let existingEmploymentId: string | null = null;
  if (isHired) {
    const { data: empRow } = await supabase
      .from("employments")
      .select("id")
      .eq("application_id", app.id)
      .maybeSingle();
    existingEmploymentId = (empRow?.id as string) ?? null;
  }

  // Оффер (P2-2) — показываем блок, пока отклик активен (до найма/отказа).
  const offerActive = app.state === "active" || app.state === null;
  let offer: Offer | null = null;
  if (offerActive) {
    const { data: offerRow } = await supabase
      .from("offers")
      .select("*")
      .eq("application_id", app.id)
      .maybeSingle();
    offer = (offerRow as Offer) ?? null;
  }

  const stages = vacancy.stages ?? ["new", "review", "interview", "assignment", "decision"];
  const stateLabel =
    app.state === "hired" ? t.stHired
    : app.state === "rejected" ? t.stRejected
    : app.state === "withdrawn" ? t.stWithdrawn
    : t.stActive;

  function eventDetail(e: EventRow): string {
    const p = e.payload || {};
    if (e.type === "note" || e.type === "document_request") return String(p.note ?? "");
    if (e.type === "stage_change") {
      if (p.new_stage) return `${t.stageNames[String(p.old_stage ?? "")] ?? p.old_stage ?? "—"} → ${t.stageNames[String(p.new_stage)] ?? p.new_stage}`;
      const reason = p.reason ? ` · ${p.reason}` : "";
      return `${p.old_status ?? "—"} → ${p.new_status ?? "—"}${reason}`;
    }
    if (e.type === "consent" || e.type === "offer") return String(p.action ?? "");
    return "";
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/employer/vacancies/${vacancy.id}`}
          className="text-sm text-slate-500 hover:underline"
        >
          {t.back}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{app.full_name}</h1>
        <p className="text-sm text-slate-500">{vacancy.title}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600">
            {t.stage}: {t.stageNames[app.stage ?? "new"] ?? app.stage}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600">
            {t.state}: {stateLabel}
          </span>
        </div>
        {app.rejected_reason && (
          <p className="mt-2 text-sm text-amber-700">
            {t.rejectedReason}: {app.rejected_reason}
          </p>
        )}
      </div>

      {offerActive && (
        <CandidateOffer
          locale={locale}
          applicationId={app.id}
          defaultPosition={vacancy.title}
          offer={offer}
        />
      )}

      {isHired && (
        <EmployeeOnboard
          locale={locale}
          applicationId={app.id}
          defaultPosition={vacancy.title}
          hasAccount={!!app.user_id}
          existingEmploymentId={existingEmploymentId}
        />
      )}

      <CandidateActions
        locale={locale}
        applicationId={app.id}
        vacancyId={vacancy.id}
        stages={stages}
        currentStage={app.stage ?? "new"}
        state={(app.state ?? "active") as "active" | "hired" | "rejected" | "withdrawn"}
        docs={docs}
        consentRevoked={consentRevoked}
      />

      <CandidateAI
        locale={locale}
        applicationId={app.id}
        vacancyId={vacancy.id}
        runs={aiRuns}
      />

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.profile}
        </h2>
        <dl className="space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-slate-400">{t.whatsapp}:</dt>
            <dd>
              <a
                href={waLink(app.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 hover:underline"
              >
                {app.whatsapp}
              </a>
            </dd>
          </div>
          {app.email && (
            <div className="flex gap-2">
              <dt className="text-slate-400">{t.email}:</dt>
              <dd>{app.email}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.answers}
        </h2>
        {answers.length === 0 ? (
          <p className="text-sm text-slate-400">{t.noAnswers}</p>
        ) : (
          <dl className="space-y-2">
            {answers.map((a, i) => (
              <div key={i}>
                <dt className="text-xs text-slate-400">{a.question}</dt>
                <dd className="text-sm text-slate-700">{a.answer || "—"}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.history}
        </h2>
        {events.length === 0 ? (
          <p className="text-sm text-slate-400">{t.noHistory}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {events.map((e) => (
              <li key={e.id} className="flex justify-between gap-3 border-b border-slate-50 pb-2">
                <div className="min-w-0">
                  <span className="font-medium">{t.ev[e.type] ?? e.type}</span>
                  {eventDetail(e) && (
                    <span className="ml-2 text-slate-500">{eventDetail(e)}</span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {new Date(e.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.consents}
        </h2>
        <p className="text-sm text-slate-600">{app.consent_text}</p>
        <p className="mt-2 text-xs text-slate-400">
          {t.consentGiven}: {app.consent_given_at ? new Date(app.consent_given_at).toLocaleString() : "—"}
        </p>
        {app.consent_revoked_at && (
          <p className="mt-1 text-xs text-amber-600">
            {t.consentRevoked}: {new Date(app.consent_revoked_at).toLocaleString()}
          </p>
        )}
      </section>
    </div>
  );
}
