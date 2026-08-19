"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  LANGUAGE_LEVEL_ORDER,
  SENIORITY_ORDER,
  nextCompletionSteps,
  profileCompleteness,
  type CandidatePassport,
  type LanguageLevel,
  type SearchIntent,
  type Seniority,
  type WorkFormat,
} from "@/lib/passport";
import { savePassport, setSearchIntent, publishProfileVersion } from "./actions";
import IntentPicker from "./IntentPicker";

// Progressive profiling (v1.2 §8.3): первый шаг — короткий, остальное
// добирается позже. Длинная анкета на первом экране запрещена.

const M = {
  ru: {
    title: "Мой профессиональный профиль",
    subtitle:
      "Первый шаг — 7 полей, примерно минута. Остальное можно добавить позже: чем больше заполнено, тем понятнее работодателю, каким критериям вы соответствуете.",
    step1: "Шаг 1. Минимальный профиль",
    step2: "Шаг 2. Что добавить дальше",
    profession: "Профессия",
    professionPh: "напр. Operations manager",
    roleFree: "Или опишите роль своими словами",
    roleFreePh: "напр. Операции + сообщество, рассматриваю смежные роли",
    location: "Текущая локация",
    locationPh: "напр. Bali, Indonesia",
    seniority: "Уровень",
    languages: "Языки",
    addLanguage: "＋ Добавить язык",
    langCodePh: "en",
    salary: "Зарплатные ожидания",
    from: "от",
    to: "до",
    currency: "валюта",
    period: "период",
    intent: "Статус поиска",
    workFormat: "Формат работы",
    remote: "удалённо",
    on_site: "в офисе",
    hybrid: "гибрид",
    notice: "Через сколько дней готовы выйти",
    relocation: "Готовность к переезду",
    relocNo: "нет",
    relocConditional: "при определённых условиях",
    relocYes: "да",
    workAuth: "Право на работу",
    countryPh: "ID",
    achievements: "Ключевые достижения",
    achievementsPh: "Что вы сделали и какой был результат",
    management: "Управленческий опыт",
    teamSize: "Размер команды",
    experience: "Лет релевантного опыта",
    preferredLocations: "Предпочитаемые локации (через запятую)",
    motivation: "Мотивация",
    environment: "Предпочитаемая среда",
    links: "CV и ссылки",
    cv: "Путь к файлу CV в хранилище",
    linkedin: "LinkedIn",
    portfolio: "Портфолио",
    cvHint:
      "CV — приложение, а не основа сопоставления: работодатель видит структурированные поля, которые вы подтвердили.",
    completeness: "Профиль заполнен на",
    nextUp: "Что добавить дальше",
    save: "Сохранить",
    saving: "Сохраняю…",
    saved: "Сохранено ✓",
    failed: "Не удалось сохранить. Попробуйте ещё раз.",
    publish: "Зафиксировать версию профиля",
    published: "Версия зафиксирована ✓",
    publishHint:
      "Версия неизменяема: отклик и приглашение ссылаются на неё, поэтому будущие правки не переписывают историю.",
    incomplete: "Сначала заполните минимальный профиль.",
    statuses: {
      citizen: "гражданство",
      permanent: "ПМЖ",
      work_permit: "рабочее разрешение",
      needs_sponsorship: "нужна спонсорская виза",
      unknown: "не знаю",
    },
  },
  en: {
    title: "My professional profile",
    subtitle:
      "Step one is 7 fields, about a minute. The rest can wait: the more you fill in, the clearer it is to an employer which criteria you meet.",
    step1: "Step 1. Minimal profile",
    step2: "Step 2. What to add next",
    profession: "Profession",
    professionPh: "e.g. Operations manager",
    roleFree: "Or describe the role in your own words",
    roleFreePh: "e.g. Ops + community, open to adjacent roles",
    location: "Current location",
    locationPh: "e.g. Bali, Indonesia",
    seniority: "Seniority",
    languages: "Languages",
    addLanguage: "＋ Add language",
    langCodePh: "en",
    salary: "Salary expectation",
    from: "from",
    to: "to",
    currency: "currency",
    period: "period",
    intent: "Search status",
    workFormat: "Work format",
    remote: "remote",
    on_site: "on-site",
    hybrid: "hybrid",
    notice: "Days until you can start",
    relocation: "Relocation",
    relocNo: "no",
    relocConditional: "under certain conditions",
    relocYes: "yes",
    workAuth: "Work authorization",
    countryPh: "ID",
    achievements: "Key achievements",
    achievementsPh: "What you did and what the result was",
    management: "Management experience",
    teamSize: "Team size",
    experience: "Years of relevant experience",
    preferredLocations: "Preferred locations (comma separated)",
    motivation: "Motivation",
    environment: "Preferred environment",
    links: "CV and links",
    cv: "CV file path in storage",
    linkedin: "LinkedIn",
    portfolio: "Portfolio",
    cvHint:
      "A CV is an attachment, not the basis of matching: employers see the structured fields you confirmed.",
    completeness: "Profile completed",
    nextUp: "What to add next",
    save: "Save",
    saving: "Saving…",
    saved: "Saved ✓",
    failed: "Couldn't save. Please try again.",
    publish: "Freeze a profile version",
    published: "Version frozen ✓",
    publishHint:
      "A version is immutable: applications and invitations reference it, so later edits never rewrite history.",
    incomplete: "Fill in the minimal profile first.",
    statuses: {
      citizen: "citizen",
      permanent: "permanent resident",
      work_permit: "work permit",
      needs_sponsorship: "needs sponsorship",
      unknown: "not sure",
    },
  },
  id: {
    title: "Profil profesional saya",
    subtitle:
      "Langkah pertama hanya 7 kolom, sekitar satu menit. Sisanya bisa nanti: makin lengkap, makin jelas kriteria mana yang Anda penuhi.",
    step1: "Langkah 1. Profil minimal",
    step2: "Langkah 2. Yang bisa ditambah",
    profession: "Profesi",
    professionPh: "mis. Operations manager",
    roleFree: "Atau jelaskan peran dengan kata Anda sendiri",
    roleFreePh: "mis. Ops + komunitas, terbuka untuk peran serupa",
    location: "Lokasi saat ini",
    locationPh: "mis. Bali, Indonesia",
    seniority: "Tingkat senioritas",
    languages: "Bahasa",
    addLanguage: "＋ Tambah bahasa",
    langCodePh: "en",
    salary: "Ekspektasi gaji",
    from: "dari",
    to: "sampai",
    currency: "mata uang",
    period: "periode",
    intent: "Status pencarian",
    workFormat: "Format kerja",
    remote: "remote",
    on_site: "di kantor",
    hybrid: "hibrida",
    notice: "Berapa hari lagi bisa mulai",
    relocation: "Kesiapan pindah",
    relocNo: "tidak",
    relocConditional: "dengan syarat tertentu",
    relocYes: "ya",
    workAuth: "Izin kerja",
    countryPh: "ID",
    achievements: "Pencapaian utama",
    achievementsPh: "Apa yang Anda kerjakan dan hasilnya",
    management: "Pengalaman memimpin",
    teamSize: "Ukuran tim",
    experience: "Tahun pengalaman relevan",
    preferredLocations: "Lokasi yang diinginkan (pisahkan koma)",
    motivation: "Motivasi",
    environment: "Lingkungan kerja pilihan",
    links: "CV dan tautan",
    cv: "Path berkas CV di penyimpanan",
    linkedin: "LinkedIn",
    portfolio: "Portofolio",
    cvHint:
      "CV adalah lampiran, bukan dasar pencocokan: perusahaan melihat kolom terstruktur yang Anda konfirmasi.",
    completeness: "Kelengkapan profil",
    nextUp: "Yang bisa ditambah",
    save: "Simpan",
    saving: "Menyimpan…",
    saved: "Tersimpan ✓",
    failed: "Gagal menyimpan. Coba lagi.",
    publish: "Bekukan versi profil",
    published: "Versi dibekukan ✓",
    publishHint:
      "Versi bersifat permanen: lamaran dan undangan merujuk padanya, jadi perubahan berikutnya tidak menulis ulang riwayat.",
    incomplete: "Lengkapi profil minimal dulu.",
    statuses: {
      citizen: "warga negara",
      permanent: "penduduk tetap",
      work_permit: "izin kerja",
      needs_sponsorship: "butuh sponsor",
      unknown: "belum tahu",
    },
  },
  uz: {
    title: "Mening professional profilim",
    subtitle:
      "Birinchi qadam — 7 ta maydon, taxminan bir daqiqa. Qolganini keyin qo‘shasiz: profil qanchalik to‘liq bo‘lsa, ish beruvchiga qaysi mezonlarga mos kelishingiz shunchalik aniq.",
    step1: "1-qadam. Minimal profil",
    step2: "2-qadam. Keyin nima qo‘shish",
    profession: "Kasb",
    professionPh: "mas. Operations manager",
    roleFree: "Yoki rolni o‘z so‘zingiz bilan yozing",
    roleFreePh: "mas. Operatsiyalar + hamjamiyat, yaqin rollarga ochiqman",
    location: "Joriy joylashuv",
    locationPh: "mas. Bali, Indoneziya",
    seniority: "Daraja",
    languages: "Tillar",
    addLanguage: "＋ Til qo‘shish",
    langCodePh: "en",
    salary: "Maosh kutilmasi",
    from: "dan",
    to: "gacha",
    currency: "valyuta",
    period: "davr",
    intent: "Qidiruv holati",
    workFormat: "Ish formati",
    remote: "masofaviy",
    on_site: "ofisda",
    hybrid: "gibrid",
    notice: "Necha kundan keyin ishga chiqasiz",
    relocation: "Ko‘chishga tayyorlik",
    relocNo: "yo‘q",
    relocConditional: "ma’lum shartlar bilan",
    relocYes: "ha",
    workAuth: "Ishlash huquqi",
    countryPh: "ID",
    achievements: "Asosiy yutuqlar",
    achievementsPh: "Nima qilgansiz va natija qanday bo‘lgan",
    management: "Boshqaruv tajribasi",
    teamSize: "Jamoa hajmi",
    experience: "Tegishli tajriba yillari",
    preferredLocations: "Afzal joylashuvlar (vergul bilan)",
    motivation: "Motivatsiya",
    environment: "Afzal ko‘rilgan muhit",
    links: "CV va havolalar",
    cv: "Saqlashdagi CV fayl yo‘li",
    linkedin: "LinkedIn",
    portfolio: "Portfolio",
    cvHint:
      "CV — bu ilova, moslikning asosi emas: ish beruvchi siz tasdiqlagan tuzilgan maydonlarni ko‘radi.",
    completeness: "Profil to‘ldirilgan",
    nextUp: "Keyin nima qo‘shish",
    save: "Saqlash",
    saving: "Saqlanmoqda…",
    saved: "Saqlandi ✓",
    failed: "Saqlab bo‘lmadi. Yana urinib ko‘ring.",
    publish: "Profil versiyasini muzlatish",
    published: "Versiya muzlatildi ✓",
    publishHint:
      "Versiya o‘zgarmas: ariza va taklif unga havola qiladi, keyingi tahrirlar tarixni qayta yozmaydi.",
    incomplete: "Avval minimal profilni to‘ldiring.",
    statuses: {
      citizen: "fuqaro",
      permanent: "doimiy yashovchi",
      work_permit: "ish ruxsatnomasi",
      needs_sponsorship: "homiylik kerak",
      unknown: "bilmayman",
    },
  },
} as const;

const WORK_FORMATS: WorkFormat[] = ["remote", "on_site", "hybrid"];
const AUTH_STATUSES = [
  "citizen",
  "permanent",
  "work_permit",
  "needs_sponsorship",
  "unknown",
] as const;

export default function PassportForm({
  locale,
  initial,
}: {
  locale: Locale;
  initial: CandidatePassport;
}) {
  const t = M[locale];
  const [passport, setPassport] = useState<CandidatePassport>(initial);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"saved" | "published" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const completeness = useMemo(() => profileCompleteness(passport), [passport]);
  const nextSteps = useMemo(() => nextCompletionSteps(passport, 3), [passport]);

  function patch(update: Partial<CandidatePassport>) {
    setPassport((p) => ({ ...p, ...update }));
  }

  async function onSave() {
    setBusy(true);
    setError(null);
    setDone(null);
    const res = await savePassport({
      profession: passport.profession,
      role_free_text: passport.role_free_text,
      seniority: passport.seniority,
      years_of_experience: passport.years_of_experience,
      key_achievements: passport.key_achievements,
      management_experience: passport.management_experience,
      team_size: passport.team_size,
      current_location: passport.current_location,
      preferred_locations: passport.preferred_locations,
      work_format_preference: passport.work_format_preference,
      relocation_willingness: passport.relocation_willingness,
      work_authorization: passport.work_authorization,
      languages: passport.languages,
      salary_expectation: passport.salary_expectation,
      notice_period_days: passport.notice_period_days,
      preferred_environment: passport.preferred_environment,
      motivation: passport.motivation,
      cv_file_path: passport.cv_file_path,
      linkedin_url: passport.linkedin_url,
      portfolio_url: passport.portfolio_url,
    });
    setBusy(false);
    if ("error" in res) setError(t.failed);
    else {
      setDone("saved");
      setTimeout(() => setDone(null), 2500);
    }
  }

  async function onPublish() {
    setBusy(true);
    setError(null);
    const res = await publishProfileVersion();
    setBusy(false);
    if ("error" in res) setError(res.error === "incomplete" ? t.incomplete : t.failed);
    else {
      setDone("published");
      setTimeout(() => setDone(null), 2500);
    }
  }

  const salary = passport.salary_expectation ?? {
    min: null,
    max: null,
    currency: "USD",
    period: "month" as const,
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      {/* ── Шаг 1: минимальный профиль (60–90 секунд) ───────────────── */}
      <section className="card space-y-4 bg-white">
        <h2 className="text-lg font-medium">{t.step1}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{t.profession}</label>
            <input
              className="input"
              value={passport.profession ?? ""}
              placeholder={t.professionPh}
              onChange={(e) => patch({ profession: e.target.value || null })}
            />
          </div>
          <div>
            <label className="label">{t.location}</label>
            <input
              className="input"
              value={passport.current_location ?? ""}
              placeholder={t.locationPh}
              onChange={(e) => patch({ current_location: e.target.value || null })}
            />
          </div>
        </div>

        <div>
          <label className="label">{t.roleFree}</label>
          <input
            className="input"
            value={passport.role_free_text ?? ""}
            placeholder={t.roleFreePh}
            onChange={(e) => patch({ role_free_text: e.target.value || null })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{t.seniority}</label>
            <select
              className="input"
              value={passport.seniority ?? ""}
              onChange={(e) =>
                patch({ seniority: (e.target.value || null) as Seniority | null })
              }
            >
              <option value="">—</option>
              {SENIORITY_ORDER.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t.notice}</label>
            <input
              className="input"
              type="number"
              min={0}
              value={passport.notice_period_days ?? ""}
              onChange={(e) =>
                patch({
                  notice_period_days: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <div>
          <label className="label">{t.languages}</label>
          <div className="space-y-2">
            {passport.languages.map((lang, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input w-24"
                  value={lang.code}
                  placeholder={t.langCodePh}
                  onChange={(e) =>
                    patch({
                      languages: passport.languages.map((l, idx) =>
                        idx === i ? { ...l, code: e.target.value.toLowerCase() } : l,
                      ),
                    })
                  }
                />
                <select
                  className="input"
                  value={lang.level}
                  onChange={(e) =>
                    patch({
                      languages: passport.languages.map((l, idx) =>
                        idx === i ? { ...l, level: e.target.value as LanguageLevel } : l,
                      ),
                    })
                  }
                >
                  {LANGUAGE_LEVEL_ORDER.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    patch({ languages: passport.languages.filter((_, idx) => idx !== i) })
                  }
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                patch({ languages: [...passport.languages, { code: "en", level: "B2" }] })
              }
            >
              {t.addLanguage}
            </button>
          </div>
        </div>

        <div>
          <label className="label">{t.salary}</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <input
              className="input"
              type="number"
              placeholder={t.from}
              value={salary.min ?? ""}
              onChange={(e) =>
                patch({
                  salary_expectation: {
                    ...salary,
                    min: e.target.value === "" ? null : Number(e.target.value),
                  },
                })
              }
            />
            <input
              className="input"
              type="number"
              placeholder={t.to}
              value={salary.max ?? ""}
              onChange={(e) =>
                patch({
                  salary_expectation: {
                    ...salary,
                    max: e.target.value === "" ? null : Number(e.target.value),
                  },
                })
              }
            />
            <input
              className="input"
              placeholder={t.currency}
              value={salary.currency}
              onChange={(e) =>
                patch({
                  salary_expectation: { ...salary, currency: e.target.value.toUpperCase() },
                })
              }
            />
            <select
              className="input"
              value={salary.period}
              onChange={(e) =>
                patch({
                  salary_expectation: {
                    ...salary,
                    period: e.target.value as typeof salary.period,
                  },
                })
              }
            >
              <option value="month">month</option>
              <option value="year">year</option>
              <option value="hour">hour</option>
              <option value="project">project</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">{t.workFormat}</label>
          <div className="flex flex-wrap gap-2">
            {WORK_FORMATS.map((format) => {
              const active = passport.work_format_preference.includes(format);
              return (
                <button
                  key={format}
                  type="button"
                  className={active ? "btn-primary" : "btn-ghost"}
                  onClick={() =>
                    patch({
                      work_format_preference: active
                        ? passport.work_format_preference.filter((f) => f !== format)
                        : [...passport.work_format_preference, format],
                    })
                  }
                >
                  {t[format]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label">{t.intent}</label>
          <IntentPicker
            locale={locale}
            value={passport.search_intent}
            onChange={async (intent: SearchIntent) => {
              patch({ search_intent: intent });
              await setSearchIntent(intent);
            }}
          />
        </div>
      </section>

      {/* ── Шаг 2: progressive profiling ────────────────────────────── */}
      <section className="card space-y-4 bg-white">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium">{t.step2}</h2>
          <span className="text-sm text-slate-500">
            {t.completeness} {completeness.percent}%
          </span>
        </div>

        {nextSteps.length > 0 && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {t.nextUp}: {nextSteps.join(", ")}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{t.experience}</label>
            <input
              className="input"
              type="number"
              step="0.5"
              min={0}
              value={passport.years_of_experience ?? ""}
              onChange={(e) =>
                patch({
                  years_of_experience:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="label">{t.relocation}</label>
            <select
              className="input"
              value={passport.relocation_willingness ?? ""}
              onChange={(e) =>
                patch({
                  relocation_willingness: (e.target.value || null) as
                    | "no"
                    | "conditional"
                    | "yes"
                    | null,
                })
              }
            >
              <option value="">—</option>
              <option value="no">{t.relocNo}</option>
              <option value="conditional">{t.relocConditional}</option>
              <option value="yes">{t.relocYes}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">{t.preferredLocations}</label>
          <input
            className="input"
            value={passport.preferred_locations.join(", ")}
            onChange={(e) =>
              patch({
                preferred_locations: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>

        <div>
          <label className="label">{t.workAuth}</label>
          <div className="space-y-2">
            {passport.work_authorization.map((auth, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input w-24"
                  value={auth.country}
                  placeholder={t.countryPh}
                  onChange={(e) =>
                    patch({
                      work_authorization: passport.work_authorization.map((a, idx) =>
                        idx === i ? { ...a, country: e.target.value.toUpperCase() } : a,
                      ),
                    })
                  }
                />
                <select
                  className="input"
                  value={auth.status}
                  onChange={(e) =>
                    patch({
                      work_authorization: passport.work_authorization.map((a, idx) =>
                        idx === i
                          ? { ...a, status: e.target.value as typeof a.status }
                          : a,
                      ),
                    })
                  }
                >
                  {AUTH_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {t.statuses[status]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    patch({
                      work_authorization: passport.work_authorization.filter(
                        (_, idx) => idx !== i,
                      ),
                    })
                  }
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                patch({
                  work_authorization: [
                    ...passport.work_authorization,
                    { country: "ID", status: "unknown", valid_until: null },
                  ],
                })
              }
            >
              ＋
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{t.management}</label>
            <select
              className="input"
              value={
                passport.management_experience === null
                  ? ""
                  : passport.management_experience
                    ? "yes"
                    : "no"
              }
              onChange={(e) =>
                patch({
                  management_experience:
                    e.target.value === "" ? null : e.target.value === "yes",
                })
              }
            >
              <option value="">—</option>
              <option value="yes">{t.relocYes}</option>
              <option value="no">{t.relocNo}</option>
            </select>
          </div>
          <div>
            <label className="label">{t.teamSize}</label>
            <input
              className="input"
              type="number"
              min={0}
              value={passport.team_size ?? ""}
              onChange={(e) =>
                patch({ team_size: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
          </div>
        </div>

        <div>
          <label className="label">{t.achievements}</label>
          <textarea
            className="input min-h-24"
            value={passport.key_achievements ?? ""}
            placeholder={t.achievementsPh}
            onChange={(e) => patch({ key_achievements: e.target.value || null })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{t.motivation}</label>
            <input
              className="input"
              value={passport.motivation ?? ""}
              onChange={(e) => patch({ motivation: e.target.value || null })}
            />
          </div>
          <div>
            <label className="label">{t.environment}</label>
            <input
              className="input"
              value={passport.preferred_environment ?? ""}
              onChange={(e) => patch({ preferred_environment: e.target.value || null })}
            />
          </div>
        </div>

        <div>
          <label className="label">{t.links}</label>
          <p className="mb-2 text-xs text-slate-500">{t.cvHint}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              className="input"
              placeholder={t.cv}
              value={passport.cv_file_path ?? ""}
              onChange={(e) => patch({ cv_file_path: e.target.value || null })}
            />
            <input
              className="input"
              placeholder={t.linkedin}
              value={passport.linkedin_url ?? ""}
              onChange={(e) => patch({ linkedin_url: e.target.value || null })}
            />
            <input
              className="input"
              placeholder={t.portfolio}
              value={passport.portfolio_url ?? ""}
              onChange={(e) => patch({ portfolio_url: e.target.value || null })}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" onClick={onSave} disabled={busy}>
          {busy ? t.saving : t.save}
        </button>
        <button className="btn-ghost" onClick={onPublish} disabled={busy}>
          {t.publish}
        </button>
        {done === "saved" && <span className="text-sm text-green-600">{t.saved}</span>}
        {done === "published" && (
          <span className="text-sm text-green-600">{t.published}</span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
      <p className="text-xs text-slate-500">{t.publishHint}</p>
    </div>
  );
}
