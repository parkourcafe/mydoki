"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";
import { POLICY_VERSION } from "@/lib/policy";
import {
  ACCEPT_ATTR,
  ACCEPTED_MIME,
  MAX_FILE_BYTES,
  isValidWhatsapp,
  type RequiredDocument,
  type ScreeningQuestion,
  type VideoScreening,
} from "@/lib/career";
import { submitApplication, attachVaultDocs } from "../actions";
import VideoRecorder from "./VideoRecorder";
import TurnstileWidget from "@/components/TurnstileWidget";

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
    uploaded: "Uploaded",
    errored: "Upload failed — try again",
    questions: "Questions",
    choosePlaceholder: "Choose…",
    yes: "Yes",
    no: "No",
    consentTpl: (c: string) =>
      `I agree to share my name, contact information, documents, and answers with ${c} for this vacancy only. I can request deletion anytime.`,
    consentSensitive:
      "This may include sensitive data (e.g. medical or financial documents); I explicitly agree to share it for this vacancy.",
    consentSee: "See our",
    privacyLabel: "Privacy Policy",
    submit: "Submit application",
    submitting: "Submitting…",
    errName: "Please enter your full name.",
    errWa: "Please enter a valid WhatsApp number.",
    errDoc: (l: string) => `Please upload: ${l}.`,
    errAns: "Please answer all questions.",
    videoLabel: "Video answer",
    videoOptionalNote: "Optional",
    errVideoReq: "Please record or upload your video answer.",
    vaultTitle: "Attach from your vault",
    vaultHint: "You're signed in — attach documents you already keep in Doki instead of re-uploading.",
    errConsent: "Please agree to the consent to continue.",
    errFileType: "Only PDF, JPG or PNG files are allowed.",
    errFileSize: "File is too large (max 10MB).",
    errGeneric: "Something went wrong. Please try again.",
    analyticsNote: "We use privacy-friendly analytics (no personal data) to improve this service.",
    errPhoneLimit: "You've reached today's application limit for this number. Please try again tomorrow.",
    errRateLimit: "Too many attempts. Please wait a little and try again.",
    errTurnstile: "Verification failed. Please complete the check and try again.",
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
    uploaded: "Terunggah",
    errored: "Gagal unggah — coba lagi",
    questions: "Pertanyaan",
    choosePlaceholder: "Pilih…",
    yes: "Ya",
    no: "Tidak",
    consentTpl: (c: string) =>
      `Saya setuju membagikan nama, kontak, dokumen, dan jawaban saya kepada ${c} khusus untuk lowongan ini. Saya dapat meminta penghapusan kapan saja.`,
    consentSensitive:
      "Ini dapat mencakup data sensitif (mis. dokumen medis atau keuangan); saya secara tegas setuju membagikannya untuk lowongan ini.",
    consentSee: "Lihat",
    privacyLabel: "Kebijakan Privasi",
    submit: "Kirim lamaran",
    submitting: "Mengirim…",
    errName: "Silakan masukkan nama lengkap.",
    errWa: "Masukkan nomor WhatsApp yang valid.",
    errDoc: (l: string) => `Silakan unggah: ${l}.`,
    errAns: "Silakan jawab semua pertanyaan.",
    videoLabel: "Jawaban video",
    videoOptionalNote: "Opsional",
    errVideoReq: "Rekam atau unggah jawaban video Anda.",
    vaultTitle: "Lampirkan dari brankas",
    vaultHint: "Anda sudah masuk — lampirkan dokumen yang sudah tersimpan di Doki tanpa unggah ulang.",
    errConsent: "Setujui persetujuan untuk melanjutkan.",
    errFileType: "Hanya berkas PDF, JPG, atau PNG.",
    errFileSize: "Berkas terlalu besar (maks 10MB).",
    errGeneric: "Terjadi kesalahan. Coba lagi.",
    analyticsNote: "Kami memakai analitik yang menjaga privasi (tanpa data pribadi) untuk meningkatkan layanan ini.",
    errPhoneLimit: "Anda sudah mencapai batas lamaran hari ini untuk nomor ini. Coba lagi besok.",
    errRateLimit: "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
    errTurnstile: "Verifikasi gagal. Selesaikan pemeriksaan lalu coba lagi.",
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
    uploaded: "Загружен",
    errored: "Ошибка загрузки — повторите",
    questions: "Вопросы",
    choosePlaceholder: "Выберите…",
    yes: "Да",
    no: "Нет",
    consentTpl: (c: string) =>
      `Я согласен(на) поделиться именем, контактами, документами и ответами с ${c} только для этой вакансии. Я могу запросить удаление в любой момент.`,
    consentSensitive:
      "Это может включать чувствительные данные (например, медицинские или финансовые документы); я явно соглашаюсь передать их для этой вакансии.",
    consentSee: "См.",
    privacyLabel: "Политику конфиденциальности",
    submit: "Отправить отклик",
    submitting: "Отправка…",
    errName: "Введите имя и фамилию.",
    errWa: "Введите корректный номер WhatsApp.",
    errDoc: (l: string) => `Загрузите: ${l}.`,
    errAns: "Ответьте на все вопросы.",
    videoLabel: "Видео-ответ",
    videoOptionalNote: "по желанию",
    errVideoReq: "Запишите или загрузите видео-ответ.",
    vaultTitle: "Прикрепить из сейфа",
    vaultHint: "Вы вошли в аккаунт — прикрепите документы, которые уже хранятся в Doki, вместо повторной загрузки.",
    errConsent: "Подтвердите согласие, чтобы продолжить.",
    errFileType: "Только PDF, JPG или PNG.",
    errFileSize: "Файл слишком большой (макс. 10 МБ).",
    errGeneric: "Что-то пошло не так. Попробуйте ещё раз.",
    analyticsNote: "Мы используем обезличенную аналитику (без персональных данных), чтобы улучшать сервис.",
    errPhoneLimit: "Вы исчерпали дневной лимит откликов для этого номера. Попробуйте завтра.",
    errRateLimit: "Слишком много попыток. Подождите немного и попробуйте снова.",
    errTurnstile: "Проверка не пройдена. Пройдите её и попробуйте снова.",
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
    uploaded: "Yuklandi",
    errored: "Yuklashda xato — qayta urining",
    questions: "Savollar",
    choosePlaceholder: "Tanlang…",
    yes: "Ha",
    no: "Yo‘q",
    consentTpl: (c: string) =>
      `Ismim, kontaktlarim, hujjatlarim va javoblarimni faqat shu vakansiya uchun ${c} bilan ulashishga roziman. Istalgan vaqtda o‘chirishni so‘rashim mumkin.`,
    consentSensitive:
      "Bu sezgir ma’lumotlarni (masalan, tibbiy yoki moliyaviy hujjatlar) o‘z ichiga olishi mumkin; ularni shu vakansiya uchun ulashishga aniq roziman.",
    consentSee: "Qarang:",
    privacyLabel: "Maxfiylik siyosati",
    submit: "Arizani yuborish",
    submitting: "Yuborilmoqda…",
    errName: "To‘liq ismingizni kiriting.",
    errWa: "To‘g‘ri WhatsApp raqamini kiriting.",
    errDoc: (l: string) => `Yuklang: ${l}.`,
    errAns: "Barcha savollarga javob bering.",
    videoLabel: "Video javob",
    videoOptionalNote: "ixtiyoriy",
    errVideoReq: "Video javobingizni yozing yoki yuklang.",
    vaultTitle: "Seyfdan biriktirish",
    vaultHint: "Siz tizimga kirgansiz — qayta yuklamasdan Doki'dagi hujjatlaringizni biriktiring.",
    errConsent: "Davom etish uchun rozilikni tasdiqlang.",
    errFileType: "Faqat PDF, JPG yoki PNG.",
    errFileSize: "Fayl juda katta (maks 10MB).",
    errGeneric: "Xatolik yuz berdi. Qayta urining.",
    analyticsNote: "Xizmatni yaxshilash uchun shaxsiy maʼlumotsiz, anonim tahlildan foydalanamiz.",
    errPhoneLimit: "Bu raqam uchun bugungi ariza limitiga yetdingiz. Ertaga urinib ko‘ring.",
    errRateLimit: "Urinishlar juda ko‘p. Biroz kuting va qayta urining.",
    errTurnstile: "Tekshiruv o‘tmadi. Uni bajaring va qayta urining.",
    doneTitle: "Ariza yuborildi!",
    doneText: "Yangiliklarni WhatsApp orqali olasiz.",
    statusLink: "Ariza holatini kuzatish",
    nudge: "Keyingi safar tezroq ariza berish uchun profilni saqlang.",
    createAccount: "Bepul Doki akkaunti yaratish",
  },
} as const;

type UploadState = "pending" | "uploading" | "uploaded" | "error";

function safeName(name: string): string {
  return name.replace(/[^\w.\-]+/g, "_") || "file";
}

export default function ApplyForm({
  locale,
  vacancyId,
  slug,
  companyName,
  requiredDocuments,
  screeningQuestions,
  videoScreening,
  videoQuestion,
  vaultDocs,
  prefill,
}: {
  locale: Locale;
  vacancyId: string;
  slug: string;
  companyName: string;
  requiredDocuments: RequiredDocument[];
  screeningQuestions: ScreeningQuestion[];
  videoScreening: VideoScreening;
  videoQuestion: string | null;
  vaultDocs: { id: string; title: string; category: string }[];
  prefill: { fullName: string; whatsapp: string; email: string } | null;
}) {
  const t = M[locale];
  // Displayed consent = base agreement + explicit sensitive-data statement.
  const consentText = `${t.consentTpl(companyName)} ${t.consentSensitive}`;
  // Stored consent record additionally pins the policy version that was shown.
  const consentRecord = `${consentText} [${t.privacyLabel} v${POLICY_VERSION}]`;

  const [fullName, setFullName] = useState(prefill?.fullName ?? "");
  const [whatsapp, setWhatsapp] = useState(prefill?.whatsapp ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [files, setFiles] = useState<Record<number, File>>({});
  const [docStatus, setDocStatus] = useState<Record<number, UploadState>>({});
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [doneToken, setDoneToken] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [vaultPicked, setVaultPicked] = useState<Record<string, boolean>>({});
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!errors.length) return;
    errorRef.current?.focus();
    errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [errors]);

  function onVideo(file: File | null) {
    setVideoFile(file);
    if (file) {
      markStarted();
      track("video_recorded", { vacancy_id: vacancyId });
    }
  }

  // Воронка (§2.1): просмотр вакансии → начало → отправка. Только ID.
  const startedRef = useRef(false);
  const srcRef = useRef("direct");
  useEffect(() => {
    const src =
      new URLSearchParams(window.location.search).get("src") || "direct";
    srcRef.current = src;
    track("vacancy_viewed", { vacancy_id: vacancyId, src });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    track("application_started", { vacancy_id: vacancyId });
  }

  function pickFile(i: number, file: File | null) {
    if (!file) return;
    if (!ACCEPTED_MIME.includes(file.type)) {
      setErrors([t.errFileType]);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setErrors([t.errFileSize]);
      return;
    }
    setErrors([]);
    markStarted();
    setFiles((p) => ({ ...p, [i]: file }));
    setDocStatus((p) => ({ ...p, [i]: "pending" }));
    track("document_uploaded", { vacancy_id: vacancyId, doc_type: requiredDocuments[i]?.type ?? "other" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    const validationErrors: string[] = [];
    if (!fullName.trim()) validationErrors.push(t.errName);
    if (!isValidWhatsapp(whatsapp)) validationErrors.push(t.errWa);
    for (let i = 0; i < requiredDocuments.length; i++) {
      // Отсутствие поля required у старых записей трактуем как обязательный.
      if (requiredDocuments[i].required !== false && !files[i]) {
        validationErrors.push(t.errDoc(requiredDocuments[i].label));
      }
    }
    let missingAnswer = false;
    for (let i = 0; i < screeningQuestions.length; i++) {
      const required = screeningQuestions[i].required !== false;
      if (required && !(answers[i] ?? "").trim()) missingAnswer = true;
    }
    if (missingAnswer) validationErrors.push(t.errAns);
    if (videoScreening === "required" && !videoFile) {
      validationErrors.push(t.errVideoReq);
    }
    if (!consent) validationErrors.push(t.errConsent);
    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    setBusy(true);
    const applicationId = crypto.randomUUID();
    const supabase = getSupabaseBrowser();

    try {
      const uploaded: {
        type: string;
        label: string;
        path: string;
        name: string;
        size: number;
      }[] = [];

      for (let i = 0; i < requiredDocuments.length; i++) {
        const file = files[i];
        if (!file) continue;
        const doc = requiredDocuments[i];
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
          name: file.name,
          size: file.size,
        });
      }

      // Doc-reuse: выбранные документы из сейфа копируем на сервере в bucket
      // applications и добавляем к отправляемым документам.
      const pickedIds = Object.keys(vaultPicked).filter((id) => vaultPicked[id]);
      if (pickedIds.length) {
        const attached = await attachVaultDocs({
          applicationId,
          vacancyId,
          documentIds: pickedIds,
        });
        uploaded.push(...attached);
      }

      // Видео-ответ грузим в отдельный приватный bucket и регистрируем как
      // документ типа video_intro (переиспользуем чеклист + signed-URL).
      if (videoFile) {
        const ext = videoFile.name.split(".").pop() || "webm";
        const vpath = `${vacancyId}/${applicationId}/intro.${ext}`;
        const { error: vErr } = await supabase.storage
          .from("video-screenings")
          .upload(vpath, videoFile, {
            contentType: videoFile.type || "video/webm",
            upsert: true,
          });
        if (vErr) throw new Error(vErr.message);
        uploaded.push({
          type: "video_intro",
          label: "Video",
          path: vpath,
          name: videoFile.name,
          size: videoFile.size,
        });
      }

      const answerPayload = screeningQuestions.map((q, i) => ({
        question: q.question,
        type: q.type,
        answer: (answers[i] ?? "").trim(),
      }));

      const { accessToken } = await submitApplication({
        applicationId,
        slug,
        fullName: fullName.trim(),
        whatsapp,
        email: email.trim() || undefined,
        consentText: consentRecord,
        source: srcRef.current,
        turnstileToken,
        answers: answerPayload,
        documents: uploaded,
      });

      track("consent_given", { vacancy_id: vacancyId, policy_version: POLICY_VERSION });
      track("application_submitted", { vacancy_id: vacancyId });
      setDoneToken(accessToken);
    } catch (err) {
      const m = err instanceof Error ? err.message : "";
      // Понятные сообщения вместо кодов из БД.
      if (m.includes("rate_limit_phone")) setErrors([t.errPhoneLimit]);
      else if (m.includes("rate_limited")) setErrors([t.errRateLimit]);
      else if (m.includes("turnstile_failed")) setErrors([t.errTurnstile]);
      else setErrors([t.errGeneric]);
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
          href={`/${locale}/applications/status/${doneToken}`}
          className="btn-primary mt-4 w-full"
        >
          {t.statusLink}
        </Link>
        <p className="mt-4 text-xs text-slate-500">{t.nudge}</p>
        <Link
          href={`/${locale}/login`}
          className="mt-1 inline-block text-sm text-brand-600 hover:underline"
        >
          {t.createAccount}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-5">
      <h2 className="text-base font-semibold">{t.yourApplication}</h2>

      {errors.length > 0 && (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 outline-none"
        >
          <ul className="list-disc space-y-1 pl-5">
            {errors.map((message, index) => (
              <li key={`${message}-${index}`}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label className="label">{t.fullName} *</label>
        <input
          className="input"
          value={fullName}
          onChange={(e) => {
            markStarted();
            setFullName(e.target.value);
          }}
          placeholder={t.fullNamePh}
          autoComplete="name"
          required
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
          required
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
                        {doc.required !== false ? t.required : t.optional}
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
                    <p className="mt-2 flex items-center gap-2 text-xs">
                      <span className="truncate text-slate-500">{chosen.name}</span>
                      <span
                        className={
                          st === "uploaded"
                            ? "text-green-600"
                            : st === "error"
                              ? "text-red-600"
                              : st === "uploading"
                                ? "text-brand-600"
                                : "text-slate-400"
                        }
                      >
                        {st === "uploaded"
                          ? `✓ ${t.uploaded}`
                          : st === "error"
                            ? t.errored
                            : st === "uploading"
                              ? t.uploading
                              : t.pending}
                      </span>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {vaultDocs.length > 0 && (
        <div className="space-y-2">
          <div>
            <p className="label">📁 {t.vaultTitle}</p>
            <p className="text-xs text-slate-500">{t.vaultHint}</p>
          </div>
          <ul className="space-y-1">
            {vaultDocs.map((d) => (
              <li key={d.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={!!vaultPicked[d.id]}
                    onChange={(e) => {
                      markStarted();
                      setVaultPicked((p) => ({ ...p, [d.id]: e.target.checked }));
                    }}
                  />
                  <span className="truncate">📄 {d.title}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {screeningQuestions.length > 0 && (
        <div className="space-y-3">
          <p className="label">{t.questions}</p>
          {screeningQuestions.map((q, i) => {
            const required = q.required !== false;
            return (
            <div key={i}>
              <label className="mb-1 block text-sm text-slate-700">
                {q.question}
                {required ? " *" : ` (${t.optional})`}
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
              ) : q.type === "choice" && (q.options ?? []).length > 0 ? (
                <select
                  className="input"
                  value={answers[i] ?? ""}
                  required={required}
                  onChange={(e) =>
                    setAnswers((p) => ({ ...p, [i]: e.target.value }))
                  }
                >
                  <option value="">{t.choosePlaceholder}</option>
                  {(q.options ?? []).map((opt, oi) => (
                    <option key={oi} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="input"
                  value={answers[i] ?? ""}
                  required={required}
                  onChange={(e) =>
                    setAnswers((p) => ({ ...p, [i]: e.target.value }))
                  }
                />
              )}
            </div>
            );
          })}
        </div>
      )}

      {videoScreening !== "off" && (
        <div className="space-y-2">
          <p className="label">
            🎥 {t.videoLabel}
            {videoScreening === "required" ? (
              " *"
            ) : (
              <span className="font-normal text-slate-400"> ({t.videoOptionalNote})</span>
            )}
          </p>
          {videoQuestion && (
            <p className="text-sm text-slate-700">{videoQuestion}</p>
          )}
          <VideoRecorder locale={locale} onVideo={onVideo} />
        </div>
      )}

      <label className="flex items-start gap-2 rounded-lg bg-brand-50/50 p-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={consent}
          required
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span>
          {consentText}{" "}
          {t.consentSee}{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 underline"
            onClick={(e) => e.stopPropagation()}
          >
            {t.privacyLabel}
          </Link>
          .
        </span>
      </label>

      <TurnstileWidget onToken={setTurnstileToken} />

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? t.submitting : t.submit}
      </button>
      <p className="mt-3 text-center text-xs text-slate-400">{t.analyticsNote}</p>
    </form>
  );
}
