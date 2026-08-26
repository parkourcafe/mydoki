"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { CandidatePassport } from "@/lib/passport";
import {
  identifiabilityNotice,
  indirectIdentificationRisk,
  type VisibilityMode,
  type VisibilityPolicy,
} from "@/lib/passportVisibility";
import type { MembershipState } from "@/lib/talentPool";
import { membershipLabel } from "@/lib/talentPool";
import {
  blockOrganization,
  joinTalentPool,
  leaveTalentPool,
  saveVisibility,
  setMembership,
  unblockOrganization,
} from "./actions";

export type BlockedOrganization = {
  id: string;
  employer_id: string | null;
  domain: string | null;
};

// Видимость и Talent Pool (v1.2 §8.5, §13.5). Профиль остаётся приватным,
// пока человек явно не выбрал другой режим; вступление в пул — отдельное
// действие с собственной целью обработки данных.

const NOTICE_VERSION = "talent-pool-2026-08";

const M = {
  ru: {
    title: "Видимость и Talent Pool",
    visibility: "Кто может обнаружить профиль",
    modes: {
      private: "Приватный — никто",
      recommendations_only: "Только рекомендации мне (работодатель профиль не видит)",
      invited_only: "Только по приглашению или моему разрешению",
      confidential_pool: "Конфиденциально — обезличенная часть профиля",
      discoverable_pool: "Открыт для проверенных работодателей",
    },
    hideEmployer: "Скрывать профиль от текущего работодателя",
    employerNames: "Названия и домены работодателей, от которых скрываем",
    hiddenFields: "Скрыть отдельные поля",
    saveVisibility: "Сохранить видимость",
    pool: "Talent Pool",
    poolHint:
      "Вступление в пул — отдельное разрешение с целью и сроком. Оно не включается вместе с обычным откликом и не раскрывает вашу личность: приглашение приходит вам, а не наоборот.",
    consent:
      "Разрешаю проверенным работодателям находить мой обезличенный профиль для оценки соответствия конкретной роли в течение выбранного срока.",
    months: "Срок разрешения, месяцев",
    join: "Вступить в Talent Pool",
    pause: "Поставить на паузу",
    resume: "Возобновить",
    leave: "Выйти и отозвать разрешение",
    state: "Состояние",
    blocks: "Заблокированные организации",
    blockPh: "домен, напр. contoh.example",
    block: "Заблокировать",
    unblock: "Разблокировать",
    blocksHint:
      "Блокировка закрывает обнаружение и отзывает выданный доступ. Она не гарантирует блокировку нераспознанного аффилированного лица.",
    risk: "Поля, по которым вас могут узнать даже без имени",
    saved: "Сохранено ✓",
    failed: "Не удалось. Попробуйте ещё раз.",
  },
  en: {
    title: "Visibility and Talent Pool",
    visibility: "Who can discover the profile",
    modes: {
      private: "Private — nobody",
      recommendations_only: "Recommendations to me only (employers can't see the profile)",
      invited_only: "By invitation or my explicit permission only",
      confidential_pool: "Confidential — anonymised part of the profile",
      discoverable_pool: "Open to verified employers",
    },
    hideEmployer: "Hide the profile from my current employer",
    employerNames: "Employer names and domains to hide from",
    hiddenFields: "Hide specific fields",
    saveVisibility: "Save visibility",
    pool: "Talent Pool",
    poolHint:
      "Joining the pool is a separate permission with a purpose and an expiry. It is not bundled with an ordinary application and does not reveal your identity: the invitation comes to you, not the other way round.",
    consent:
      "I allow verified employers to discover my anonymised profile to assess fit for a specific role for the selected period.",
    months: "Permission period, months",
    join: "Join the Talent Pool",
    pause: "Pause",
    resume: "Resume",
    leave: "Leave and revoke permission",
    state: "State",
    blocks: "Blocked organizations",
    blockPh: "domain, e.g. contoh.example",
    block: "Block",
    unblock: "Unblock",
    blocksHint:
      "Blocking stops discovery and revokes access already granted. It cannot guarantee blocking an unrecognised affiliate.",
    risk: "Fields that could identify you even without a name",
    saved: "Saved ✓",
    failed: "Failed. Please try again.",
  },
  id: {
    title: "Visibilitas dan Talent Pool",
    visibility: "Siapa yang bisa menemukan profil",
    modes: {
      private: "Privat — tidak ada",
      recommendations_only: "Rekomendasi untuk saya saja (perusahaan tidak melihat profil)",
      invited_only: "Hanya lewat undangan atau izin saya",
      confidential_pool: "Rahasia — bagian profil yang dianonimkan",
      discoverable_pool: "Terbuka untuk perusahaan terverifikasi",
    },
    hideEmployer: "Sembunyikan profil dari perusahaan saya saat ini",
    employerNames: "Nama dan domain perusahaan yang disembunyikan",
    hiddenFields: "Sembunyikan kolom tertentu",
    saveVisibility: "Simpan visibilitas",
    pool: "Talent Pool",
    poolHint:
      "Bergabung ke pool adalah izin terpisah dengan tujuan dan masa berlaku. Ia tidak menyatu dengan lamaran biasa dan tidak membuka identitas Anda: undangan datang ke Anda.",
    consent:
      "Saya mengizinkan perusahaan terverifikasi menemukan profil anonim saya untuk menilai kecocokan pada peran tertentu selama periode yang dipilih.",
    months: "Masa izin, bulan",
    join: "Gabung Talent Pool",
    pause: "Jeda",
    resume: "Lanjutkan",
    leave: "Keluar dan cabut izin",
    state: "Status",
    blocks: "Organisasi yang diblokir",
    blockPh: "domain, mis. contoh.example",
    block: "Blokir",
    unblock: "Buka blokir",
    blocksHint:
      "Pemblokiran menghentikan penemuan dan mencabut akses yang sudah diberikan. Ia tidak menjamin memblokir afiliasi yang tidak dikenali.",
    risk: "Kolom yang bisa mengenali Anda meski tanpa nama",
    saved: "Tersimpan ✓",
    failed: "Gagal. Coba lagi.",
  },
  uz: {
    title: "Ko‘rinuvchanlik va Talent Pool",
    visibility: "Profilni kim topa oladi",
    modes: {
      private: "Yopiq — hech kim",
      recommendations_only: "Faqat menga tavsiyalar (ish beruvchi profilni ko‘rmaydi)",
      invited_only: "Faqat taklif yoki mening ruxsatim bilan",
      confidential_pool: "Maxfiy — profilning anonim qismi",
      discoverable_pool: "Tasdiqlangan ish beruvchilarga ochiq",
    },
    hideEmployer: "Profilni joriy ish beruvchidan yashirish",
    employerNames: "Yashiriladigan ish beruvchi nomlari va domenlari",
    hiddenFields: "Ayrim maydonlarni yashirish",
    saveVisibility: "Ko‘rinuvchanlikni saqlash",
    pool: "Talent Pool",
    poolHint:
      "Pulga qo‘shilish — maqsadi va muddati bor alohida ruxsat. U oddiy ariza bilan birga yoqilmaydi va shaxsingizni ochmaydi: taklif sizga keladi.",
    consent:
      "Tasdiqlangan ish beruvchilarga tanlangan muddat davomida aniq rolga mosligimni baholash uchun anonim profilimni topishga ruxsat beraman.",
    months: "Ruxsat muddati, oy",
    join: "Talent Poolga qo‘shilish",
    pause: "Pauza",
    resume: "Davom ettirish",
    leave: "Chiqish va ruxsatni bekor qilish",
    state: "Holat",
    blocks: "Bloklangan tashkilotlar",
    blockPh: "domen, mas. contoh.example",
    block: "Bloklash",
    unblock: "Blokdan chiqarish",
    blocksHint:
      "Bloklash topilishni to‘xtatadi va berilgan ruxsatni bekor qiladi. U tanilmagan affiliatni bloklashni kafolatlamaydi.",
    risk: "Ism bo‘lmasa ham sizni tanitishi mumkin bo‘lgan maydonlar",
    saved: "Saqlandi ✓",
    failed: "Bajarilmadi. Yana urinib ko‘ring.",
  },
} as const;

const MODES: VisibilityMode[] = [
  "private",
  "recommendations_only",
  "invited_only",
  "confidential_pool",
  "discoverable_pool",
];

const HIDEABLE_FIELDS = [
  "salary_expectation",
  "current_location",
  "key_achievements",
  "team_size",
  "years_of_experience",
];

export default function TalentPoolPanel({
  locale,
  passport,
  policy,
  membership,
  blocks,
}: {
  locale: Locale;
  passport: CandidatePassport;
  policy: VisibilityPolicy;
  membership: MembershipState;
  blocks: BlockedOrganization[];
}) {
  const t = M[locale];
  const [mode, setMode] = useState<VisibilityMode>(policy.mode);
  const [hideEmployer, setHideEmployer] = useState(policy.hide_current_employer);
  const [names, setNames] = useState(policy.current_employer_names.join(", "));
  const [hiddenFields, setHiddenFields] = useState<string[]>(policy.hidden_fields);
  const [months, setMonths] = useState(6);
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const risk = indirectIdentificationRisk(passport, {
    ...policy,
    mode,
    hidden_fields: hiddenFields,
  });

  async function run(fn: () => Promise<{ ok: true } | { error: string }>) {
    setBusy(true);
    setError(null);
    setDone(false);
    const res = await fn();
    setBusy(false);
    if ("error" in res) setError(t.failed);
    else {
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    }
  }

  return (
    <section className="card space-y-5 bg-white">
      <h2 className="text-lg font-medium">{t.title}</h2>

      {/* ── Режим видимости ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="label">{t.visibility}</label>
        {MODES.map((m) => (
          <label key={m} className="flex items-start gap-2 text-sm">
            <input
              type="radio"
              name="visibility-mode"
              className="mt-1"
              checked={mode === m}
              onChange={() => setMode(m)}
            />
            <span>{t.modes[m]}</span>
          </label>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={hideEmployer}
          onChange={(e) => setHideEmployer(e.target.checked)}
        />
        {t.hideEmployer}
      </label>

      <div>
        <label className="label">{t.employerNames}</label>
        <input
          className="input"
          value={names}
          onChange={(e) => setNames(e.target.value)}
          placeholder="PT Contoh Bali, contoh.example"
        />
      </div>

      <div>
        <label className="label">{t.hiddenFields}</label>
        <div className="flex flex-wrap gap-2">
          {HIDEABLE_FIELDS.map((field) => {
            const active = hiddenFields.includes(field);
            return (
              <button
                key={field}
                type="button"
                className={active ? "btn-primary" : "btn-ghost"}
                onClick={() =>
                  setHiddenFields(
                    active
                      ? hiddenFields.filter((f) => f !== field)
                      : [...hiddenFields, field],
                  )
                }
              >
                {field}
              </button>
            );
          })}
        </div>
      </div>

      {risk.at_risk && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {identifiabilityNotice(locale)} <br />
          <span className="text-xs">
            {t.risk}: {risk.fields.join(", ")}
          </span>
        </p>
      )}

      <button
        className="btn-primary"
        disabled={busy}
        onClick={() =>
          run(() =>
            saveVisibility({
              mode,
              hide_current_employer: hideEmployer,
              current_employer_names: names.split(",").map((s) => s.trim()).filter(Boolean),
              hidden_fields: hiddenFields,
            }),
          )
        }
      >
        {t.saveVisibility}
      </button>

      {/* ── Членство в пуле ─────────────────────────────────────────── */}
      <div className="border-t border-slate-200 pt-4">
        <h3 className="font-medium">{t.pool}</h3>
        <p className="mt-1 text-sm text-slate-500">{t.poolHint}</p>
        <p className="mt-2 text-sm">
          {t.state}: <b>{membershipLabel(locale, membership)}</b>
        </p>

        {membership !== "active" && (
          <div className="mt-3 space-y-2">
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {t.consent}
            </p>
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="label">{t.months}</label>
                <input
                  className="input w-24"
                  type="number"
                  min={1}
                  max={12}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                />
              </div>
              <button
                className="btn-primary"
                disabled={busy}
                onClick={() =>
                  run(() =>
                    joinTalentPool({
                      consent_text: t.consent,
                      notice_version: NOTICE_VERSION,
                      scope_fields: [
                        "profession",
                        "seniority",
                        "years_of_experience",
                        "current_location",
                        "languages",
                        "salary_expectation",
                        "notice_period_days",
                        "work_format_preference",
                        "work_authorization",
                      ],
                      months,
                    }),
                  )
                }
              >
                {membership === "paused" ? t.resume : t.join}
              </button>
            </div>
          </div>
        )}

        {membership === "active" && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="btn-ghost"
              disabled={busy}
              onClick={() => run(() => setMembership("paused"))}
            >
              {t.pause}
            </button>
            <button
              className="btn-danger"
              disabled={busy}
              onClick={() => run(() => leaveTalentPool())}
            >
              {t.leave}
            </button>
          </div>
        )}
      </div>

      {/* ── Блокировки ──────────────────────────────────────────────── */}
      <div className="border-t border-slate-200 pt-4">
        <h3 className="font-medium">{t.blocks}</h3>
        <p className="mt-1 text-sm text-slate-500">{t.blocksHint}</p>
        <ul className="mt-2 space-y-1 text-sm">
          {blocks.map((block) => (
            <li key={block.id} className="flex items-center justify-between gap-2">
              <span>{block.domain ?? block.employer_id}</span>
              <button
                className="btn-ghost"
                disabled={busy}
                onClick={() => run(() => unblockOrganization(block.id))}
              >
                {t.unblock}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex gap-2">
          <input
            className="input"
            value={domain}
            placeholder={t.blockPh}
            onChange={(e) => setDomain(e.target.value)}
          />
          <button
            className="btn-ghost"
            disabled={busy || !domain.trim()}
            onClick={() =>
              run(async () => {
                const res = await blockOrganization({ domain });
                setDomain("");
                return res;
              })
            }
          >
            {t.block}
          </button>
        </div>
      </div>

      {done && <p className="text-sm text-green-600">{t.saved}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
