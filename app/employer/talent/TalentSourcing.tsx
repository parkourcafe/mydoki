"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { MatchExplanation } from "@/lib/matching";
import { inviteStateLabel, type InviteState } from "@/lib/talentPool";
import MatchExplanationView from "@/components/MatchExplanationView";
import { previewCohort, sendBlindInvites } from "./actions";

export type SourcingVacancy = {
  id: string;
  title: string;
  location: string | null;
  salary_range: string | null;
  has_criteria: boolean;
};

export type EmployerInvite = {
  invite_id: string;
  role_title: string;
  state: InviteState;
  created_at: string;
  respond_by: string | null;
  blind: boolean;
  profile: Record<string, unknown> | null;
  match_explanation: MatchExplanation | null;
};

const M = {
  ru: {
    title: "Поиск в Talent Pool",
    subtitle:
      "Вы не получаете список людей и не видите профили. Doki показывает только размер подходящей когорты и рассылает обезличенные приглашения. Личность и контакты раскрывает сам кандидат.",
    vacancy: "Вакансия",
    noCriteria:
      "У вакансии не заданы структурированные обязательные критерии — сначала заполните их, иначе сопоставлять нечего.",
    check: "Показать размер когорты",
    checking: "Считаю…",
    cohort: "Подходящих профилей",
    suppressed:
      "Когорта меньше минимального порога — результат не показывается, чтобы по нему нельзя было вычислить человека.",
    campaign: "Приглашение",
    role: "Название роли",
    location: "Локация",
    format: "Формат",
    salary: "Диапазон компенсации",
    purpose: "Цель доступа к данным",
    purposePh: "Оценка соответствия конкретной роли",
    days: "Срок ответа, дней",
    message: "Сообщение кандидату",
    send: "Отправить обезличенные приглашения",
    sending: "Отправляю…",
    sent: "Приглашений отправлено",
    belowCohort: "Кампания не запускается: когорта меньше минимального порога.",
    failed: "Не получилось. Проверьте данные и попробуйте ещё раз.",
    invites: "Отправленные приглашения",
    noInvites: "Пока нет отправленных приглашений.",
    blind: "обезличенное",
    profile: "Профиль после принятого знакомства",
    waiting: "Кандидат ещё не ответил — профиль недоступен.",
    explanation: "Покрытие требований",
  },
  en: {
    title: "Talent Pool sourcing",
    subtitle:
      "You do not get a list of people and you do not see profiles. Doki shows only the size of the matching cohort and sends anonymised invitations. Identity and contacts are revealed by the candidate.",
    vacancy: "Vacancy",
    noCriteria:
      "This vacancy has no structured required criteria yet — fill them in first, otherwise there is nothing to match against.",
    check: "Show cohort size",
    checking: "Counting…",
    cohort: "Matching profiles",
    suppressed:
      "The cohort is below the minimum threshold — the result is withheld so no individual can be inferred from it.",
    campaign: "Invitation",
    role: "Role title",
    location: "Location",
    format: "Format",
    salary: "Compensation range",
    purpose: "Purpose of data access",
    purposePh: "Assessing fit for a specific role",
    days: "Days to respond",
    message: "Message to the candidate",
    send: "Send anonymised invitations",
    sending: "Sending…",
    sent: "Invitations sent",
    belowCohort: "Campaign not started: the cohort is below the minimum threshold.",
    failed: "Didn't work. Check the fields and try again.",
    invites: "Sent invitations",
    noInvites: "No invitations sent yet.",
    blind: "anonymised",
    profile: "Profile after the accepted introduction",
    waiting: "The candidate has not responded yet — no profile available.",
    explanation: "Requirement coverage",
  },
  id: {
    title: "Sourcing Talent Pool",
    subtitle:
      "Anda tidak menerima daftar orang dan tidak melihat profil. Doki hanya menampilkan ukuran kohort yang cocok dan mengirim undangan anonim. Identitas dan kontak dibuka oleh kandidat sendiri.",
    vacancy: "Lowongan",
    noCriteria:
      "Lowongan ini belum punya kriteria wajib terstruktur — isi dulu, kalau tidak tidak ada yang bisa dicocokkan.",
    check: "Tampilkan ukuran kohort",
    checking: "Menghitung…",
    cohort: "Profil yang cocok",
    suppressed:
      "Kohort di bawah ambang minimum — hasil disembunyikan agar tidak bisa dipakai mengenali orang.",
    campaign: "Undangan",
    role: "Nama peran",
    location: "Lokasi",
    format: "Format",
    salary: "Rentang kompensasi",
    purpose: "Tujuan akses data",
    purposePh: "Menilai kecocokan pada peran tertentu",
    days: "Batas jawab, hari",
    message: "Pesan untuk kandidat",
    send: "Kirim undangan anonim",
    sending: "Mengirim…",
    sent: "Undangan terkirim",
    belowCohort: "Kampanye tidak dijalankan: kohort di bawah ambang minimum.",
    failed: "Gagal. Periksa isian dan coba lagi.",
    invites: "Undangan terkirim",
    noInvites: "Belum ada undangan terkirim.",
    blind: "anonim",
    profile: "Profil setelah perkenalan diterima",
    waiting: "Kandidat belum menjawab — profil belum tersedia.",
    explanation: "Cakupan persyaratan",
  },
  uz: {
    title: "Talent Poolda qidiruv",
    subtitle:
      "Siz odamlar ro‘yxatini olmaysiz va profillarni ko‘rmaysiz. Doki faqat mos kogorta hajmini ko‘rsatadi va anonim takliflar yuboradi. Shaxs va kontaktlarni nomzodning o‘zi ochadi.",
    vacancy: "Vakansiya",
    noCriteria:
      "Bu vakansiyada tuzilgan majburiy mezonlar yo‘q — avval ularni to‘ldiring, aks holda solishtirish uchun hech narsa yo‘q.",
    check: "Kogorta hajmini ko‘rsatish",
    checking: "Hisoblanmoqda…",
    cohort: "Mos profillar",
    suppressed:
      "Kogorta minimal chegaradan past — natija ko‘rsatilmaydi, aks holda undan shaxsni aniqlash mumkin.",
    campaign: "Taklif",
    role: "Rol nomi",
    location: "Joylashuv",
    format: "Format",
    salary: "Kompensatsiya oralig‘i",
    purpose: "Ma’lumotdan foydalanish maqsadi",
    purposePh: "Aniq rolga mosligini baholash",
    days: "Javob muddati, kun",
    message: "Nomzodga xabar",
    send: "Anonim takliflar yuborish",
    sending: "Yuborilmoqda…",
    sent: "Yuborilgan takliflar",
    belowCohort: "Kampaniya boshlanmadi: kogorta minimal chegaradan past.",
    failed: "Bajarilmadi. Maydonlarni tekshirib, yana urinib ko‘ring.",
    invites: "Yuborilgan takliflar",
    noInvites: "Hozircha taklif yuborilmagan.",
    blind: "anonim",
    profile: "Tanishuv qabul qilingandan keyingi profil",
    waiting: "Nomzod hali javob bermadi — profil mavjud emas.",
    explanation: "Talablar qamrovi",
  },
} as const;

export default function TalentSourcing({
  locale,
  vacancies,
  invites,
}: {
  locale: Locale;
  vacancies: SourcingVacancy[];
  invites: EmployerInvite[];
}) {
  const t = M[locale];
  const [vacancyId, setVacancyId] = useState(vacancies[0]?.id ?? "");
  const selected = vacancies.find((v) => v.id === vacancyId) ?? null;

  const [cohort, setCohort] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string>(t.purposePh);
  const [format, setFormat] = useState("hybrid");
  const [days, setDays] = useState(14);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onCheck() {
    setBusy(true);
    setError(null);
    setCohort(null);
    const res = await previewCohort(vacancyId);
    setBusy(false);
    if ("error" in res) {
      setError(t.failed);
      return;
    }
    setCohort(
      res.disclosure.visible
        ? `${t.cohort}: ${res.disclosure.bucket_from}–${res.disclosure.bucket_to}`
        : t.suppressed,
    );
  }

  async function onSend() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    setResult(null);
    const res = await sendBlindInvites({
      vacancy_id: selected.id,
      role_title: selected.title,
      location: selected.location ?? "",
      work_format: format,
      compensation_range: selected.salary_range ?? "",
      access_purpose: purpose,
      respond_within_days: days,
      message,
    });
    setBusy(false);
    if ("error" in res) {
      setError(res.error === "below_min_cohort" ? t.belowCohort : t.failed);
      return;
    }
    setResult(`${t.sent}: ${res.sent}`);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      <section className="card space-y-4 bg-white">
        <div>
          <label className="label">{t.vacancy}</label>
          <select
            className="input"
            value={vacancyId}
            onChange={(e) => {
              setVacancyId(e.target.value);
              setCohort(null);
              setResult(null);
            }}
          >
            {vacancies.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>
        </div>

        {selected && !selected.has_criteria && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {t.noCriteria}
          </p>
        )}

        <button className="btn-ghost" disabled={busy || !vacancyId} onClick={onCheck}>
          {busy ? t.checking : t.check}
        </button>
        {cohort && <p className="text-sm text-slate-700">{cohort}</p>}
      </section>

      <section className="card space-y-4 bg-white">
        <h2 className="text-lg font-medium">{t.campaign}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{t.role}</label>
            <input className="input" value={selected?.title ?? ""} readOnly />
          </div>
          <div>
            <label className="label">{t.location}</label>
            <input className="input" value={selected?.location ?? ""} readOnly />
          </div>
          <div>
            <label className="label">{t.salary}</label>
            <input className="input" value={selected?.salary_range ?? ""} readOnly />
          </div>
          <div>
            <label className="label">{t.format}</label>
            <select
              className="input"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="remote">remote</option>
              <option value="on_site">on_site</option>
              <option value="hybrid">hybrid</option>
            </select>
          </div>
          <div>
            <label className="label">{t.purpose}</label>
            <input
              className="input"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
          <div>
            <label className="label">{t.days}</label>
            <input
              className="input"
              type="number"
              min={1}
              max={60}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className="label">{t.message}</label>
          <textarea
            className="input min-h-20"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <button
          className="btn-primary"
          disabled={busy || !selected || !purpose.trim() || !selected?.salary_range}
          onClick={onSend}
        >
          {busy ? t.sending : t.send}
        </button>
        {result && <p className="text-sm text-green-600">{result}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      <section className="card space-y-4 bg-white">
        <h2 className="text-lg font-medium">{t.invites}</h2>
        {invites.length === 0 && <p className="text-sm text-slate-500">{t.noInvites}</p>}
        {invites.map((invite) => (
          <div key={invite.invite_id} className="border-b border-slate-100 pb-3 last:border-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium">{invite.role_title}</span>
              <span className="text-xs text-slate-500">
                {inviteStateLabel(locale, invite.state)}
                {invite.blind ? ` · ${t.blind}` : ""}
              </span>
            </div>

            {invite.state === "accepted" && invite.profile ? (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-medium">{t.profile}</p>
                <ul className="text-sm text-slate-700">
                  {Object.entries(invite.profile)
                    .filter(([key]) => key !== "scope_fields" && key !== "hidden_fields")
                    .map(([key, value]) => (
                      <li key={key}>
                        {key}: {value === null ? "—" : JSON.stringify(value)}
                      </li>
                    ))}
                </ul>
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-500">{t.waiting}</p>
            )}

            {invite.match_explanation && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">
                  {t.explanation}
                </summary>
                <div className="mt-2">
                  <MatchExplanationView
                    locale={locale}
                    explanation={invite.match_explanation}
                  />
                </div>
              </details>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
