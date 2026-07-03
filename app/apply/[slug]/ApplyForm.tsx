"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { compressImage, formatBytes } from "@/lib/compressImage";
import {
  ACCEPT_ATTR,
  ACCEPTED_MIME,
  MAX_FILE_BYTES,
  isValidWhatsapp,
  type RequiredDocument,
  type ScreeningQuestion,
  type Source,
} from "@/lib/career";
import {
  submitApplication,
  precheckApplication,
  incrementVacancyView,
} from "../actions";

// Минимальный виджет Cloudflare Turnstile (explicit render). Если site key не
// задан — ничего не рисуем, токен остаётся null, сервер пропускает проверку.
type TurnstileAPI = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileAPI;
  }
}

// T7: контейнер резервирует высоту виджета (~65px) СРАЗУ — виджет монтируется
// лениво (после первого взаимодействия с формой), поэтому его появление не
// сдвигает layout (CLS ≈ 0). Скрипт Cloudflare тоже грузится лениво: не
// участвует в критическом пути и LCP apply-страницы.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function Turnstile({
  armed,
  onToken,
}: {
  armed: boolean;
  onToken: (t: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const siteKey = TURNSTILE_SITE_KEY;

  useEffect(() => {
    // Грузим CF-скрипт и рендерим виджет только после «взвода» (interaction).
    if (!armed || !siteKey || !ref.current) return;
    let widgetId: string | undefined;
    const el = ref.current;

    function render() {
      const ts = window.turnstile;
      if (!ts || !el) return;
      widgetId = ts.render(el, {
        sitekey: siteKey,
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
    }

    if (window.turnstile) {
      render();
    } else {
      const id = "cf-turnstile-script";
      let s = document.getElementById(id) as HTMLScriptElement | null;
      if (!s) {
        s = document.createElement("script");
        s.id = id;
        s.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        document.head.appendChild(s);
      }
      s.addEventListener("load", render);
    }

    return () => {
      const ts = window.turnstile;
      if (ts && widgetId) {
        try {
          ts.remove(widgetId);
        } catch {
          /* noop */
        }
      }
    };
  }, [armed, siteKey, onToken]);

  if (!siteKey) return null;
  // Высота зарезервирована всегда (min-h), чтобы ленивое монтирование виджета
  // не сдвигало кнопку submit вниз — защита от CLS.
  return (
    <div className="mt-1 min-h-[65px]">
      <div ref={ref} />
    </div>
  );
}

const M = {
  en: {
    yourApplication: "Your application",
    fullName: "Full name",
    fullNamePh: "e.g. Budi Santoso",
    whatsapp: "WhatsApp number",
    whatsappPh: "08123456789",
    whatsappHint: "We'll send updates here.",
    email: "Email",
    emailOpt: "optional",
    documents: "Documents",
    required: "required",
    optional: "optional",
    choose: "📎 Choose file",
    replace: "Replace",
    pending: "Not uploaded",
    uploading: "Uploading…",
    compressing: "Optimizing…",
    uploaded: "Uploaded",
    errored: "Upload failed — try again",
    questions: "Questions",
    yes: "Yes",
    no: "No",
    consentTpl: (c: string) =>
      `I agree to share my name, contact information, documents, and answers with ${c} for this vacancy only. I can request deletion anytime.`,
    submit: "Submit application",
    submitting: "Submitting…",
    errName: "Please enter your full name.",
    errWa: "Please enter a valid WhatsApp number.",
    errDoc: (l: string) => `Please upload: ${l}.`,
    errAns: "Please answer all questions.",
    errConsent: "Please agree to the consent to continue.",
    errFileType: "Only PDF, JPG or PNG files are allowed.",
    errFileSize: "File is too large (max 10MB).",
    errGeneric: "Something went wrong. Please try again.",
    errRateLimited: "Too many applications from your network. Please try again later.",
    errTurnstile: "Anti-bot check failed. Please try again.",
    doneTitle: "Application submitted!",
    doneText: "You'll receive updates via WhatsApp.",
    statusLink: "Track your application status",
    nudge: "Save your profile for faster applications next time.",
    createAccount: "Create a free Doki account",
  },
  id: {
    yourApplication: "Lamaran Anda",
    fullName: "Nama lengkap",
    fullNamePh: "mis. Budi Santoso",
    whatsapp: "Nomor WhatsApp",
    whatsappPh: "08123456789",
    whatsappHint: "Kami akan mengirim kabar ke sini.",
    email: "Email",
    emailOpt: "opsional",
    documents: "Dokumen",
    required: "wajib",
    optional: "opsional",
    choose: "📎 Pilih berkas",
    replace: "Ganti",
    pending: "Belum diunggah",
    uploading: "Mengunggah…",
    compressing: "Mengoptimalkan…",
    uploaded: "Terunggah",
    errored: "Gagal unggah — coba lagi",
    questions: "Pertanyaan",
    yes: "Ya",
    no: "Tidak",
    consentTpl: (c: string) =>
      `Saya setuju membagikan nama, kontak, dokumen, dan jawaban saya kepada ${c} khusus untuk lowongan ini. Saya dapat meminta penghapusan kapan saja.`,
    submit: "Kirim lamaran",
    submitting: "Mengirim…",
    errName: "Silakan masukkan nama lengkap.",
    errWa: "Masukkan nomor WhatsApp yang valid.",
    errDoc: (l: string) => `Silakan unggah: ${l}.`,
    errAns: "Silakan jawab semua pertanyaan.",
    errConsent: "Setujui persetujuan untuk melanjutkan.",
    errFileType: "Hanya berkas PDF, JPG, atau PNG.",
    errFileSize: "Berkas terlalu besar (maks 10MB).",
    errGeneric: "Terjadi kesalahan. Coba lagi.",
    errRateLimited: "Terlalu banyak lamaran dari jaringan Anda. Coba lagi nanti.",
    errTurnstile: "Pemeriksaan anti-bot gagal. Coba lagi.",
    doneTitle: "Lamaran terkirim!",
    doneText: "Anda akan menerima kabar via WhatsApp.",
    statusLink: "Lacak status lamaran Anda",
    nudge: "Simpan profil agar lamaran berikutnya lebih cepat.",
    createAccount: "Buat akun Doki gratis",
  },
  ru: {
    yourApplication: "Ваш отклик",
    fullName: "Имя и фамилия",
    fullNamePh: "напр. Budi Santoso",
    whatsapp: "Номер WhatsApp",
    whatsappPh: "08123456789",
    whatsappHint: "Сюда будем присылать обновления.",
    email: "Email",
    emailOpt: "необязательно",
    documents: "Документы",
    required: "обязательно",
    optional: "необязательно",
    choose: "📎 Выбрать файл",
    replace: "Заменить",
    pending: "Не загружен",
    uploading: "Загрузка…",
    compressing: "Оптимизация…",
    uploaded: "Загружен",
    errored: "Ошибка загрузки — повторите",
    questions: "Вопросы",
    yes: "Да",
    no: "Нет",
    consentTpl: (c: string) =>
      `Я согласен(на) поделиться именем, контактами, документами и ответами с ${c} только для этой вакансии. Я могу запросить удаление в любой момент.`,
    submit: "Отправить отклик",
    submitting: "Отправка…",
    errName: "Введите имя и фамилию.",
    errWa: "Введите корректный номер WhatsApp.",
    errDoc: (l: string) => `Загрузите: ${l}.`,
    errAns: "Ответьте на все вопросы.",
    errConsent: "Подтвердите согласие, чтобы продолжить.",
    errFileType: "Только PDF, JPG или PNG.",
    errFileSize: "Файл слишком большой (макс. 10 МБ).",
    errGeneric: "Что-то пошло не так. Попробуйте ещё раз.",
    errRateLimited: "Слишком много откликов с вашей сети. Попробуйте позже.",
    errTurnstile: "Проверка на бота не пройдена. Попробуйте ещё раз.",
    doneTitle: "Отклик отправлен!",
    doneText: "Обновления придут в WhatsApp.",
    statusLink: "Отслеживать статус отклика",
    nudge: "Сохраните профиль, чтобы откликаться быстрее.",
    createAccount: "Создать бесплатный аккаунт Doki",
  },
  uz: {
    yourApplication: "Arizangiz",
    fullName: "To‘liq ism",
    fullNamePh: "mas. Budi Santoso",
    whatsapp: "WhatsApp raqami",
    whatsappPh: "08123456789",
    whatsappHint: "Yangiliklarni shu yerga yuboramiz.",
    email: "Email",
    emailOpt: "ixtiyoriy",
    documents: "Hujjatlar",
    required: "majburiy",
    optional: "ixtiyoriy",
    choose: "📎 Fayl tanlash",
    replace: "Almashtirish",
    pending: "Yuklanmagan",
    uploading: "Yuklanmoqda…",
    compressing: "Optimallashtirilmoqda…",
    uploaded: "Yuklandi",
    errored: "Yuklashda xato — qayta urining",
    questions: "Savollar",
    yes: "Ha",
    no: "Yo‘q",
    consentTpl: (c: string) =>
      `Ismim, kontaktlarim, hujjatlarim va javoblarimni faqat shu vakansiya uchun ${c} bilan ulashishga roziman. Istalgan vaqtda o‘chirishni so‘rashim mumkin.`,
    submit: "Arizani yuborish",
    submitting: "Yuborilmoqda…",
    errName: "To‘liq ismingizni kiriting.",
    errWa: "To‘g‘ri WhatsApp raqamini kiriting.",
    errDoc: (l: string) => `Yuklang: ${l}.`,
    errAns: "Barcha savollarga javob bering.",
    errConsent: "Davom etish uchun rozilikni tasdiqlang.",
    errFileType: "Faqat PDF, JPG yoki PNG.",
    errFileSize: "Fayl juda katta (maks 10MB).",
    errGeneric: "Xatolik yuz berdi. Qayta urining.",
    errRateLimited: "Tarmog‘ingizdan juda ko‘p ariza. Keyinroq urining.",
    errTurnstile: "Antibot tekshiruvi o‘tmadi. Qayta urining.",
    doneTitle: "Ariza yuborildi!",
    doneText: "Yangiliklarni WhatsApp orqali olasiz.",
    statusLink: "Ariza holatini kuzatish",
    nudge: "Keyingi safar tezroq ariza berish uchun profilni saqlang.",
    createAccount: "Bepul Doki akkaunti yaratish",
  },
} as const;

type UploadState = "pending" | "compressing" | "uploading" | "uploaded" | "error";

function safeName(name: string): string {
  return name.replace(/[^\w.\-]+/g, "_") || "file";
}

// Метрика: сжатие упало (грузим исходник). Best-effort, без падений.
function fireCompressFail() {
  try {
    const id = process.env.NEXT_PUBLIC_YM_ID;
    const ym = (window as unknown as { ym?: (...a: unknown[]) => void }).ym;
    if (id && ym) ym(Number(id), "reachGoal", "compress_fail");
  } catch {
    /* noop */
  }
}

export default function ApplyForm({
  locale,
  vacancyId,
  slug,
  companyName,
  source,
  requiredDocuments,
  screeningQuestions,
}: {
  locale: Locale;
  vacancyId: string;
  slug: string;
  companyName: string;
  source: Source;
  requiredDocuments: RequiredDocument[];
  screeningQuestions: ScreeningQuestion[];
}) {
  const t = M[locale];
  const consentText = t.consentTpl(companyName);

  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState<Record<number, File>>({});
  const [docStatus, setDocStatus] = useState<Record<number, UploadState>>({});
  const [sizeInfo, setSizeInfo] = useState<Record<number, string>>({});
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [doneToken, setDoneToken] = useState<string | null>(null);
  // T7: Turnstile «взводится» только после первого касания формы, чтобы
  // тяжёлый скрипт Cloudflare не грузился на первом рендере (LCP/TBT).
  const [armed, setArmed] = useState(false);
  const arm = () => setArmed(true);

  // Один просмотр на сессию браузера (дедуп по sessionStorage, чтобы reload
  // не удваивал views_count).
  useEffect(() => {
    const key = `viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* приватный режим — просто инкрементим */
    }
    void incrementVacancyView(slug);
  }, [slug]);

  function pickFile(i: number, file: File | null) {
    if (!file) return;
    if (!ACCEPTED_MIME.includes(file.type)) {
      setError(t.errFileType);
      return;
    }
    // Для изображений лимит проверяем ПОСЛЕ сжатия; PDF — сразу.
    if (!file.type.startsWith("image/") && file.size > MAX_FILE_BYTES) {
      setError(t.errFileSize);
      return;
    }
    setError(null);
    setFiles((p) => ({ ...p, [i]: file }));
    setSizeInfo((p) => {
      const n = { ...p };
      delete n[i];
      return n;
    });
    setDocStatus((p) => ({ ...p, [i]: "pending" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError(t.errName);
    if (!isValidWhatsapp(whatsapp)) return setError(t.errWa);
    for (let i = 0; i < requiredDocuments.length; i++) {
      if (requiredDocuments[i].required && !files[i]) {
        return setError(t.errDoc(requiredDocuments[i].label));
      }
    }
    for (let i = 0; i < screeningQuestions.length; i++) {
      if (!(answers[i] ?? "").trim()) return setError(t.errAns);
    }
    if (!consent) return setError(t.errConsent);

    setBusy(true);
    const applicationId = crypto.randomUUID();
    // T7: @supabase/supabase-js (~50 КБ gzip) грузим ЛЕНИВО — только при
    // реальной отправке. Форма рендерится и интерактивна без него, поэтому
    // клиент не тянет вес в First Load apply-страницы (бюджет ≤150 КБ gzip).
    const { getSupabaseBrowser } = await import("@/lib/supabase/client");
    const supabase = getSupabaseBrowser();

    try {
      // Precheck ДО загрузки файлов: дубликат/лимит — не заливаем впустую.
      const pre = await precheckApplication({ slug, whatsapp });
      if (pre.rateLimited) {
        setError(t.errRateLimited);
        setBusy(false);
        return;
      }
      if (pre.duplicate && pre.accessToken) {
        setDoneToken(pre.accessToken);
        return;
      }

      const uploaded: {
        type: string;
        label: string;
        path: string;
        name: string;
        size: number;
      }[] = [];

      for (let i = 0; i < requiredDocuments.length; i++) {
        const raw = files[i];
        if (!raw) continue;
        const doc = requiredDocuments[i];

        // Сжатие изображений / конверсия HEIC — до загрузки (lazy-import).
        setDocStatus((p) => ({ ...p, [i]: "compressing" }));
        const outcome = await compressImage(raw);
        if (outcome.failed) fireCompressFail();
        if (outcome.tooLarge) {
          setDocStatus((p) => ({ ...p, [i]: "error" }));
          setError(t.errFileSize);
          setBusy(false);
          return;
        }
        if (outcome.changed) {
          setSizeInfo((p) => ({
            ...p,
            [i]: `${formatBytes(outcome.originalSize)} → ${formatBytes(outcome.finalSize)}`,
          }));
        }
        const file = outcome.file;

        setDocStatus((p) => ({ ...p, [i]: "uploading" }));
        const path = `${vacancyId}/${applicationId}/${doc.type}_${Date.now()}-${safeName(
          file.name
        )}`;
        const { error: upErr } = await supabase.storage
          .from("applications")
          .upload(path, file, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });
        if (upErr) {
          setDocStatus((p) => ({ ...p, [i]: "error" }));
          throw new Error(upErr.message);
        }
        setDocStatus((p) => ({ ...p, [i]: "uploaded" }));
        uploaded.push({
          type: doc.type,
          label: doc.label,
          path,
          name: raw.name, // исходное имя пользователю
          size: file.size, // сжатый размер
        });
      }

      const answerPayload = screeningQuestions.map((q, i) => ({
        question: q.question,
        type: q.type,
        answer: (answers[i] ?? "").trim(),
      }));

      const result = await submitApplication({
        applicationId,
        slug,
        fullName: fullName.trim(),
        whatsapp,
        email: email.trim() || undefined,
        consentText,
        source,
        turnstileToken,
        answers: answerPayload,
        documents: uploaded,
        docsComplete: uploaded.length,
        docsTotal: requiredDocuments.length,
      });

      if (!result.ok) {
        setError(
          result.error === "turnstile"
            ? t.errTurnstile
            : result.error === "rate_limited"
              ? t.errRateLimited
              : t.errGeneric
        );
        setBusy(false);
        return;
      }
      setDoneToken(result.accessToken);
    } catch (err) {
      const m = err instanceof Error ? err.message : "";
      setError(m || t.errGeneric);
      setBusy(false);
    }
  }

  if (doneToken) {
    return (
      <div className="card text-center">
        <div className="mb-2 text-4xl">✅</div>
        <h2 className="text-lg font-semibold">{t.doneTitle}</h2>
        <p className="mt-1 text-sm text-slate-600">{t.doneText}</p>
        <Link
          href={`/applications/status/${doneToken}`}
          className="btn-primary mt-4 w-full"
        >
          {t.statusLink}
        </Link>
        <p className="mt-4 text-xs text-slate-500">{t.nudge}</p>
        <Link
          href="/login"
          className="mt-1 inline-block text-sm text-brand-600 hover:underline"
        >
          {t.createAccount}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocusCapture={arm}
      onPointerDown={arm}
      className="card space-y-5"
    >
      <h2 className="text-base font-semibold">{t.yourApplication}</h2>

      <div>
        <label className="label">{t.fullName} *</label>
        <input
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t.fullNamePh}
          autoComplete="name"
        />
      </div>

      <div>
        <label className="label">{t.whatsapp} *</label>
        <input
          className="input"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder={t.whatsappPh}
          inputMode="tel"
          autoComplete="tel"
        />
        <p className="mt-1 text-xs text-slate-400">{t.whatsappHint}</p>
      </div>

      <div>
        <label className="label">
          {t.email}{" "}
          <span className="font-normal text-slate-400">({t.emailOpt})</span>
        </label>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      {requiredDocuments.length > 0 && (
        <div>
          <p className="label">{t.documents}</p>
          <ul className="space-y-2">
            {requiredDocuments.map((doc, i) => {
              const st = docStatus[i] ?? "pending";
              const chosen = files[i];
              return (
                <li
                  key={i}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {doc.label}
                      </p>
                      <p className="text-xs text-slate-400">
                        {doc.required ? t.required : t.optional}
                      </p>
                    </div>
                    <label className="btn-ghost shrink-0 cursor-pointer">
                      {chosen ? t.replace : t.choose}
                      <input
                        type="file"
                        accept={ACCEPT_ATTR}
                        className="hidden"
                        onChange={(e) => pickFile(i, e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                  {chosen && (
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="truncate text-slate-500">{chosen.name}</span>
                      <span
                        className={
                          st === "uploaded"
                            ? "text-green-600"
                            : st === "error"
                              ? "text-red-600"
                              : st === "uploading" || st === "compressing"
                                ? "text-brand-600"
                                : "text-slate-400"
                        }
                      >
                        {st === "uploaded"
                          ? `✓ ${t.uploaded}`
                          : st === "error"
                            ? t.errored
                            : st === "compressing"
                              ? t.compressing
                              : st === "uploading"
                                ? t.uploading
                                : t.pending}
                      </span>
                      {sizeInfo[i] && (
                        <span className="text-slate-400">· {sizeInfo[i]}</span>
                      )}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {screeningQuestions.length > 0 && (
        <div className="space-y-3">
          <p className="label">{t.questions}</p>
          {screeningQuestions.map((q, i) => (
            <div key={i}>
              <label className="mb-1 block text-sm text-slate-700">
                {q.question} *
              </label>
              {q.type === "yes_no" ? (
                <div className="flex gap-2">
                  {(["yes", "no"] as const).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, [i]: val }))}
                      className={
                        (answers[i] === val
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-300 bg-white text-slate-700") +
                        " min-h-[44px] flex-1 rounded-lg border px-3 text-sm font-medium sm:min-h-0 sm:py-2"
                      }
                    >
                      {val === "yes" ? t.yes : t.no}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  className="input"
                  value={answers[i] ?? ""}
                  onChange={(e) =>
                    setAnswers((p) => ({ ...p, [i]: e.target.value }))
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}

      <label className="flex items-start gap-2 rounded-lg bg-brand-50/50 p-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span>{consentText}</span>
      </label>

      <Turnstile armed={armed} onToken={setTurnstileToken} />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? t.submitting : t.submit}
      </button>
    </form>
  );
}
