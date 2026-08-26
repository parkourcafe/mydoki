"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { MatchExplanation } from "@/lib/matching";
import { inviteStateLabel, type InviteState } from "@/lib/talentPool";
import MatchExplanationView from "@/components/MatchExplanationView";
import { acceptIntroduction, declineInvite, shareAndApply } from "./actions";

export type Opportunity = {
  invite_id: string;
  organization_name: string;
  organization_verified: boolean;
  role_title: string;
  location: string | null;
  work_format: string | null;
  compensation_range: string | null;
  access_purpose: string;
  message: string | null;
  respond_by: string | null;
  state: InviteState;
  created_at: string;
  vacancy_id: string | null;
  match_explanation: MatchExplanation | null;
};

const NOTICE_VERSION = "application-2026-08";

const M = {
  ru: {
    title: "Возможности",
    subtitle:
      "Это приглашения рассмотреть роль, а не отклики. Работодатель не видит вашу личность и контакты, пока вы сами их не передадите.",
    empty: "Пока приглашений нет.",
    purpose: "Цель доступа к данным",
    respondBy: "Ответить до",
    accept: "Принять знакомство",
    decline: "Отклонить",
    declineHint: "Отказ не влияет на будущие подборки и не сохраняется в профиле.",
    accepted:
      "Знакомство принято: организация видит ограниченный набор полей. Это ещё не отклик.",
    share: "Передать данные и откликнуться",
    shareHint:
      "Отдельное действие: создаёт отклик, разрешение на обработку для этой роли и неизменяемый снимок переданных полей.",
    consent:
      "Передаю выбранные поля профиля и контакты этой организации для рассмотрения на конкретную роль.",
    fields: "Что передаём",
    applied: "Отклик создан ✓",
    failed: "Не получилось. Попробуйте ещё раз.",
    why: "Почему вам показали эту роль",
  },
  en: {
    title: "Opportunities",
    subtitle:
      "These are invitations to consider a role, not applications. The employer cannot see your identity or contacts until you share them yourself.",
    empty: "No invitations yet.",
    purpose: "Purpose of data access",
    respondBy: "Respond by",
    accept: "Accept introduction",
    decline: "Decline",
    declineHint: "Declining does not affect future matching and is not stored on your profile.",
    accepted:
      "Introduction accepted: the organization sees a limited set of fields. This is not an application yet.",
    share: "Share data and apply",
    shareHint:
      "A separate action: it creates the application, the processing authorization for this role and an immutable snapshot of the shared fields.",
    consent:
      "I share the selected profile fields and my contacts with this organization for consideration for a specific role.",
    fields: "What is shared",
    applied: "Application created ✓",
    failed: "Didn't work. Please try again.",
    why: "Why you were shown this role",
  },
  id: {
    title: "Peluang",
    subtitle:
      "Ini undangan untuk mempertimbangkan peran, bukan lamaran. Perusahaan tidak melihat identitas dan kontak Anda sampai Anda membagikannya sendiri.",
    empty: "Belum ada undangan.",
    purpose: "Tujuan akses data",
    respondBy: "Jawab sebelum",
    accept: "Terima perkenalan",
    decline: "Tolak",
    declineHint: "Penolakan tidak memengaruhi pencocokan berikutnya dan tidak disimpan di profil.",
    accepted:
      "Perkenalan diterima: organisasi melihat sebagian kolom saja. Ini belum lamaran.",
    share: "Bagikan data dan lamar",
    shareHint:
      "Tindakan terpisah: membuat lamaran, izin pemrosesan untuk peran ini, dan snapshot permanen dari kolom yang dibagikan.",
    consent:
      "Saya membagikan kolom profil terpilih dan kontak saya kepada organisasi ini untuk dipertimbangkan pada peran tertentu.",
    fields: "Yang dibagikan",
    applied: "Lamaran dibuat ✓",
    failed: "Gagal. Coba lagi.",
    why: "Mengapa peran ini ditampilkan",
  },
  uz: {
    title: "Imkoniyatlar",
    subtitle:
      "Bu rolni ko‘rib chiqishga taklif, ariza emas. Siz o‘zingiz ulashmaguningizcha ish beruvchi shaxsingiz va kontaktlaringizni ko‘rmaydi.",
    empty: "Hozircha takliflar yo‘q.",
    purpose: "Ma’lumotdan foydalanish maqsadi",
    respondBy: "Javob berish muddati",
    accept: "Tanishuvni qabul qilish",
    decline: "Rad etish",
    declineHint: "Rad etish keyingi tanlovlarga ta’sir qilmaydi va profilda saqlanmaydi.",
    accepted:
      "Tanishuv qabul qilindi: tashkilot cheklangan maydonlarni ko‘radi. Bu hali ariza emas.",
    share: "Ma’lumotni ulashib, ariza berish",
    shareHint:
      "Alohida amal: ariza, shu rol uchun ishlov ruxsati va ulashilgan maydonlarning o‘zgarmas nusxasini yaratadi.",
    consent:
      "Tanlangan profil maydonlari va kontaktlarimni ushbu tashkilotga aniq rol uchun ko‘rib chiqishga beraman.",
    fields: "Nima ulashiladi",
    applied: "Ariza yaratildi ✓",
    failed: "Bajarilmadi. Yana urinib ko‘ring.",
    why: "Bu rol nega ko‘rsatildi",
  },
} as const;

const DEFAULT_SHARED_FIELDS = [
  "full_name",
  "contact",
  "profession",
  "seniority",
  "years_of_experience",
  "current_location",
  "languages",
  "salary_expectation",
  "notice_period_days",
  "work_authorization",
  "key_achievements",
];

export default function OpportunityList({
  locale,
  opportunities,
}: {
  locale: Locale;
  opportunities: Opportunity[];
}) {
  const t = M[locale];
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shared, setShared] = useState<Record<string, string[]>>({});

  async function run(id: string, fn: () => Promise<{ ok: true } | { error: string }>) {
    setBusy(id);
    setError(null);
    const res = await fn();
    setBusy(null);
    if ("error" in res) setError(t.failed);
    else setDone(id);
  }

  if (opportunities.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
        <p className="mt-6 text-sm text-slate-500">{t.empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      {opportunities.map((invite) => {
        const fields = shared[invite.invite_id] ?? DEFAULT_SHARED_FIELDS;
        return (
          <section key={invite.invite_id} className="card space-y-3 bg-white">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-medium">
                {invite.role_title} — {invite.organization_name}
                {invite.organization_verified && <span className="ml-1 text-green-600">✓</span>}
              </h2>
              <span className="text-xs text-slate-500">
                {inviteStateLabel(locale, invite.state)}
              </span>
            </div>

            <ul className="text-sm text-slate-600">
              {invite.location && <li>{invite.location}</li>}
              {invite.work_format && <li>{invite.work_format}</li>}
              {invite.compensation_range && <li>{invite.compensation_range}</li>}
              <li>
                {t.purpose}: {invite.access_purpose}
              </li>
              {invite.respond_by && (
                <li>
                  {t.respondBy}: {new Date(invite.respond_by).toLocaleDateString()}
                </li>
              )}
            </ul>

            {invite.message && <p className="text-sm text-slate-700">{invite.message}</p>}

            {invite.match_explanation && (
              <details className="rounded-lg bg-slate-50 p-3">
                <summary className="cursor-pointer text-sm font-medium">{t.why}</summary>
                <div className="mt-3">
                  <MatchExplanationView
                    locale={locale}
                    explanation={invite.match_explanation}
                  />
                </div>
              </details>
            )}

            {(invite.state === "sent" || invite.state === "viewed") && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="btn-primary"
                  disabled={busy === invite.invite_id}
                  onClick={() =>
                    run(invite.invite_id, () =>
                      acceptIntroduction(invite.invite_id, fields),
                    )
                  }
                >
                  {t.accept}
                </button>
                <button
                  className="btn-ghost"
                  disabled={busy === invite.invite_id}
                  onClick={() =>
                    run(invite.invite_id, () => declineInvite(invite.invite_id))
                  }
                >
                  {t.decline}
                </button>
                <span className="text-xs text-slate-500">{t.declineHint}</span>
              </div>
            )}

            {invite.state === "accepted" && (
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <p className="text-sm text-slate-600">{t.accepted}</p>
                <div>
                  <p className="label">{t.fields}</p>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_SHARED_FIELDS.map((field) => {
                      const active = fields.includes(field);
                      return (
                        <button
                          key={field}
                          type="button"
                          className={active ? "btn-primary" : "btn-ghost"}
                          onClick={() =>
                            setShared((s) => ({
                              ...s,
                              [invite.invite_id]: active
                                ? fields.filter((f) => f !== field)
                                : [...fields, field],
                            }))
                          }
                        >
                          {field}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs text-slate-500">{t.shareHint}</p>
                <button
                  className="btn-primary"
                  disabled={busy === invite.invite_id || !invite.vacancy_id}
                  onClick={() =>
                    run(invite.invite_id, () =>
                      shareAndApply({
                        invite_id: invite.invite_id,
                        vacancy_id: invite.vacancy_id!,
                        shared_fields: fields,
                        consent_text: t.consent,
                        notice_version: NOTICE_VERSION,
                      }),
                    )
                  }
                >
                  {t.share}
                </button>
                {done === invite.invite_id && (
                  <span className="ml-2 text-sm text-green-600">{t.applied}</span>
                )}
              </div>
            )}
          </section>
        );
      })}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
