"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import {
  APPLICATION_DOC_TYPES,
  docTypeLabel,
  filterApplicationStageDocuments,
  type DocType,
  type RequiredDocument,
  type ScreeningQuestion,
  type ScorecardCriterion,
  type CreatedVia,
} from "@/lib/career";
import { createVacancy, updateVacancy } from "@/app/employer/actions";
import { track } from "@/lib/analytics";
import { runQualityCheck } from "@/lib/vacancyQuality";
import { templatePrefill, type VacancyTemplate } from "@/lib/vacancyTemplates";
import type { VacancyDraft } from "@/lib/vacancyDraft";
import TemplateChips from "./TemplateChips";
import QualityPanel from "./QualityPanel";
import AiComposer from "./AiComposer";

// Источник создания для аналитики §10 (event source enum).
type CreateSource = "manual" | "template" | "ai_freeform";

const M = {
  en: {
    title: "New vacancy",
    jobTitle: "Job title",
    jobTitlePh: "e.g. Barista",
    company: "Company name",
    location: "Location",
    locationPh: "e.g. Canggu, Bali",
    salary: "Salary range",
    salaryPh: "e.g. 3-4M IDR / month",
    schedule: "Schedule",
    schedulePh: "e.g. Full-time, shifts",
    description: "Description",
    urgency: "Urgency",
    normal: "Normal",
    hiringNow: "Hiring now",
    closesAt: "Closes on",
    optional: "optional",
    docs: "Required documents",
    docsHint: "Ask only for role-relevant files. Request ID and health documents after an offer.",
    addDoc: "+ Add document",
    docType: "Type",
    docLabel: "Label",
    reqd: "Required",
    remove: "Remove",
    questions: "Screening questions",
    questionsHint: "Questions candidates answer when applying.",
    videoTitle: "Video answer",
    videoHint: "A short video self-intro (up to 60 sec) instead of long text.",
    videoOff: "Off",
    videoOptional: "Optional",
    videoRequired: "Required",
    videoQ: "Video question",
    videoQPh: "e.g. Tell us about yourself in 30 seconds",
    videoWarn: "⚠️ May reduce the number of applications.",
    addQuestion: "+ Add question",
    question: "Question",
    qText: "Text answer",
    qYesNo: "Yes / No",
    qChoice: "Choice",
    options: "Options",
    optionsPh: "Option 1, Option 2, …",
    optionsHint: "Comma-separated",
    create: "Create vacancy",
    creating: "Creating…",
    editTitle: "Edit vacancy",
    save: "Save changes",
    saving: "Saving…",
    errTitle: "Please enter a job title.",
    errCompany: "Please enter a company name.",
    errLocation: "Please enter a location.",
    errGeneric: "Could not create the vacancy. Please try again.",
    aiButton: "✨ Help me write this vacancy",
    scorecardTitle: "Hiring scorecard (planning only)",
    scorecardHint:
      "Criteria for the role — visible only to you here. Not shown to candidates and not used to score anyone.",
  },
  id: {
    title: "Lowongan baru",
    jobTitle: "Nama posisi",
    jobTitlePh: "mis. Barista",
    company: "Nama perusahaan",
    location: "Lokasi",
    locationPh: "mis. Canggu, Bali",
    salary: "Kisaran gaji",
    salaryPh: "mis. 3-4jt IDR / bulan",
    schedule: "Jadwal",
    schedulePh: "mis. Penuh waktu, shift",
    description: "Deskripsi",
    urgency: "Urgensi",
    normal: "Normal",
    hiringNow: "Butuh cepat",
    closesAt: "Ditutup pada",
    optional: "opsional",
    docs: "Dokumen wajib",
    docsHint: "Minta hanya berkas yang relevan. Minta identitas dan dokumen kesehatan setelah penawaran.",
    addDoc: "+ Tambah dokumen",
    docType: "Jenis",
    docLabel: "Label",
    reqd: "Wajib",
    remove: "Hapus",
    questions: "Pertanyaan seleksi",
    questionsHint: "Pertanyaan yang dijawab kandidat saat melamar.",
    videoTitle: "Jawaban video",
    videoHint: "Perkenalan video singkat (maks 60 dtk) daripada teks panjang.",
    videoOff: "Nonaktif",
    videoOptional: "Opsional",
    videoRequired: "Wajib",
    videoQ: "Pertanyaan video",
    videoQPh: "mis. Ceritakan tentang diri Anda dalam 30 detik",
    videoWarn: "⚠️ Bisa mengurangi jumlah lamaran.",
    addQuestion: "+ Tambah pertanyaan",
    question: "Pertanyaan",
    qText: "Jawaban teks",
    qYesNo: "Ya / Tidak",
    qChoice: "Pilihan",
    options: "Pilihan jawaban",
    optionsPh: "Pilihan 1, Pilihan 2, …",
    optionsHint: "Pisahkan dengan koma",
    create: "Buat lowongan",
    creating: "Membuat…",
    editTitle: "Edit lowongan",
    save: "Simpan perubahan",
    saving: "Menyimpan…",
    errTitle: "Masukkan nama posisi.",
    errCompany: "Masukkan nama perusahaan.",
    errLocation: "Masukkan lokasi.",
    errGeneric: "Gagal membuat lowongan. Coba lagi.",
    aiButton: "✨ Bantu saya menulis lowongan ini",
    scorecardTitle: "Kartu skor perekrutan (perencanaan saja)",
    scorecardHint:
      "Kriteria untuk peran — hanya terlihat oleh Anda di sini. Tidak ditampilkan ke kandidat dan tidak dipakai menilai siapa pun.",
  },
  ru: {
    title: "Новая вакансия",
    jobTitle: "Должность",
    jobTitlePh: "напр. Бариста",
    company: "Название компании",
    location: "Локация",
    locationPh: "напр. Canggu, Bali",
    salary: "Зарплата",
    salaryPh: "напр. 3-4M IDR / мес",
    schedule: "График",
    schedulePh: "напр. Полный день, смены",
    description: "Описание",
    urgency: "Срочность",
    normal: "Обычная",
    hiringNow: "Срочный набор",
    closesAt: "Закрыть",
    optional: "необязательно",
    docs: "Обязательные документы",
    docsHint: "Только документы по роли. ID и медицинские документы запрашивайте после оффера.",
    addDoc: "+ Добавить документ",
    docType: "Тип",
    docLabel: "Название",
    reqd: "Обязательно",
    remove: "Удалить",
    questions: "Вопросы скрининга",
    questionsHint: "Вопросы, на которые отвечает кандидат.",
    videoTitle: "Видео-ответ",
    videoHint: "Короткое видео-представление (до 60 сек) вместо длинного текста.",
    videoOff: "Выкл",
    videoOptional: "По желанию",
    videoRequired: "Обязательно",
    videoQ: "Вопрос для видео",
    videoQPh: "напр. Расскажите о себе за 30 секунд",
    videoWarn: "⚠️ Может снизить число откликов.",
    addQuestion: "+ Добавить вопрос",
    question: "Вопрос",
    qText: "Текстовый ответ",
    qYesNo: "Да / Нет",
    qChoice: "Выбор из вариантов",
    options: "Варианты",
    optionsPh: "Вариант 1, Вариант 2, …",
    optionsHint: "Через запятую",
    create: "Создать вакансию",
    creating: "Создание…",
    editTitle: "Изменить вакансию",
    save: "Сохранить изменения",
    saving: "Сохранение…",
    errTitle: "Введите должность.",
    errCompany: "Введите название компании.",
    errLocation: "Введите локацию.",
    errGeneric: "Не удалось создать вакансию. Попробуйте ещё раз.",
    aiButton: "✨ Помочь составить вакансию",
    scorecardTitle: "Карта критериев найма (только планирование)",
    scorecardHint:
      "Критерии для роли — видны только вам здесь. Кандидатам не показываются и никого не оценивают.",
  },
  uz: {
    title: "Yangi vakansiya",
    jobTitle: "Lavozim",
    jobTitlePh: "mas. Barista",
    company: "Kompaniya nomi",
    location: "Manzil",
    locationPh: "mas. Canggu, Bali",
    salary: "Maosh oralig‘i",
    salaryPh: "mas. 3-4M IDR / oy",
    schedule: "Jadval",
    schedulePh: "mas. To‘liq kun, smenalar",
    description: "Tavsif",
    urgency: "Shoshilinchlik",
    normal: "Oddiy",
    hiringNow: "Shoshilinch",
    closesAt: "Yopilish sanasi",
    optional: "ixtiyoriy",
    docs: "Majburiy hujjatlar",
    docsHint: "Faqat rolga tegishli fayllar. ID va tibbiy hujjatlarni offerdan keyin so‘rang.",
    addDoc: "+ Hujjat qo‘shish",
    docType: "Turi",
    docLabel: "Nomi",
    reqd: "Majburiy",
    remove: "O‘chirish",
    questions: "Saralash savollari",
    questionsHint: "Nomzod ariza berishda javob beradigan savollar.",
    videoTitle: "Video javob",
    videoHint: "Uzun matn o‘rniga qisqa video-tanishtiruv (60 sek gacha).",
    videoOff: "O‘chiq",
    videoOptional: "Ixtiyoriy",
    videoRequired: "Majburiy",
    videoQ: "Video uchun savol",
    videoQPh: "mas. 30 soniyada o‘zingiz haqingizda gapiring",
    videoWarn: "⚠️ Arizalar sonini kamaytirishi mumkin.",
    addQuestion: "+ Savol qo‘shish",
    question: "Savol",
    qText: "Matnli javob",
    qYesNo: "Ha / Yo‘q",
    qChoice: "Variantlardan tanlash",
    options: "Variantlar",
    optionsPh: "Variant 1, Variant 2, …",
    optionsHint: "Vergul bilan ajrating",
    create: "Vakansiya yaratish",
    creating: "Yaratilmoqda…",
    editTitle: "Vakansiyani tahrirlash",
    save: "O‘zgarishlarni saqlash",
    saving: "Saqlanmoqda…",
    errTitle: "Lavozimni kiriting.",
    errCompany: "Kompaniya nomini kiriting.",
    errLocation: "Manzilni kiriting.",
    errGeneric: "Vakansiya yaratilmadi. Qayta urining.",
    aiButton: "✨ Vakansiya tuzishga yordam bering",
    scorecardTitle: "Yollash mezonlari (faqat rejalashtirish)",
    scorecardHint:
      "Rol uchun mezonlar — bu yerda faqat sizga ko‘rinadi. Nomzodlarga ko‘rsatilmaydi va hech kimni baholashda ishlatilmaydi.",
  },
} as const;

export type VacancyInitial = {
  title: string;
  company_name: string;
  location: string | null;
  salary_range: string | null;
  schedule: string | null;
  description: string | null;
  urgency: "normal" | "hiring_now";
  closes_at: string | null;
  required_documents: RequiredDocument[];
  screening_questions: ScreeningQuestion[];
  video_screening?: "off" | "optional" | "required";
  video_question?: string | null;
};

export default function VacancyForm({
  locale,
  defaultCompany,
  mode = "create",
  vacancyId,
  initial,
  aiEnabled = false,
}: {
  locale: Locale;
  defaultCompany: string;
  mode?: "create" | "edit";
  vacancyId?: string;
  initial?: VacancyInitial;
  /** Env-гейт AI-freeform (Layer 2). Вычисляется на сервере и приходит пропом. */
  aiEnabled?: boolean;
}) {
  const t = M[locale];
  const router = useRouter();
  const isEdit = mode === "edit";

  const [title, setTitle] = useState(initial?.title ?? "");
  const [company, setCompany] = useState(initial?.company_name ?? defaultCompany);
  const [location, setLocation] = useState(initial?.location ?? "");
  const [salary, setSalary] = useState(initial?.salary_range ?? "");
  const [schedule, setSchedule] = useState(initial?.schedule ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [urgency, setUrgency] = useState<"normal" | "hiring_now">(
    initial?.urgency ?? "normal"
  );
  const [closesAt, setClosesAt] = useState(
    initial?.closes_at ? initial.closes_at.slice(0, 10) : ""
  );
  const [docs, setDocs] = useState<RequiredDocument[]>(
    initial?.required_documents?.length
      ? initial.required_documents
      : [{ type: "cv", label: docTypeLabel(locale, "cv"), required: true }]
  );
  const [questions, setQuestions] = useState<ScreeningQuestion[]>(
    initial?.screening_questions ?? []
  );
  const [videoScreening, setVideoScreening] = useState<
    "off" | "optional" | "required"
  >(initial?.video_screening ?? "off");
  const [videoQuestion, setVideoQuestion] = useState(
    initial?.video_question ?? ""
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── T11 Vacancy Composer state ──────────────────────────────────
  const [createdVia, setCreatedVia] = useState<CreatedVia>("manual");
  const [roleTemplate, setRoleTemplate] = useState<string | null>(null);
  const [scorecard, setScorecard] = useState<ScorecardCriterion[]>([]);
  const [showAi, setShowAi] = useState(false);

  // Аналитика §10: событие started фиксируем один раз с первым источником;
  // время до публикации — от монтирования формы.
  const startedRef = useRef(false);
  const publishedRef = useRef(false);
  const sourceRef = useRef<CreateSource>("manual");
  const stepRef = useRef<string>("open");
  const startTimeRef = useRef<number>(Date.now());

  function markStarted(source: CreateSource) {
    if (isEdit || startedRef.current) return;
    startedRef.current = true;
    sourceRef.current = source;
    track("vacancy_create_started", { source });
  }

  // Проверка качества (Layer 3) — чистая, только по состоянию формы (§7).
  const quality = useMemo(
    () =>
      runQualityCheck({
        salary_range: salary,
        description,
        required_documents: docs,
        screening_questions: questions,
      }),
    [salary, description, docs, questions]
  );

  function selectTemplate(tpl: VacancyTemplate) {
    const pre = templatePrefill(tpl, locale);
    setTitle(pre.title);
    setDocs(pre.required_documents);
    setQuestions(pre.screening_questions);
    setRoleTemplate(pre.role_template);
    setScorecard([]);
    setCreatedVia("template");
    stepRef.current = "template";
    markStarted("template");
    track("vacancy_template_selected", {
      template_id: tpl.id,
      category: pre.category,
    });
  }

  function applyDraft(draft: VacancyDraft, _fieldsGenerated: number) {
    let applied = 0;
    if (draft.title) {
      setTitle(draft.title);
      applied++;
    }
    if (draft.company_name) {
      setCompany(draft.company_name);
      applied++;
    }
    if (draft.location) {
      setLocation(draft.location);
      applied++;
    }
    if (draft.salary_range) {
      setSalary(draft.salary_range);
      applied++;
    }
    if (draft.schedule) {
      setSchedule(draft.schedule);
      applied++;
    }
    if (draft.description) {
      setDescription(draft.description);
      applied++;
    }
    if (draft.urgency) setUrgency(draft.urgency);
    if (draft.required_documents?.length) {
      setDocs(draft.required_documents);
      applied++;
    }
    if (draft.screening_questions?.length) {
      setQuestions(draft.screening_questions);
      applied++;
    }
    // scorecard хранится ТОЛЬКО как метаданные вакансии (§8) — здесь для
    // планирования работодателя, не показывается кандидатам и никого не оценивает.
    if (draft.scorecard?.length) setScorecard(draft.scorecard);

    setCreatedVia("ai");
    setRoleTemplate(null);
    stepRef.current = "ai_applied";
    markStarted("ai_freeform");
    setShowAi(false);
    track("vacancy_ai_draft_applied", { fields_applied_count: applied });
  }

  // Аналитика §10: событие abandoned, если работодатель ушёл, начав, но не
  // опубликовав. Только режим создания.
  useEffect(() => {
    if (isEdit) return;
    const report = () => {
      if (publishedRef.current || !startedRef.current) return;
      track("vacancy_creation_abandoned", {
        last_step: stepRef.current,
        source: sourceRef.current,
      });
    };
    window.addEventListener("beforeunload", report);
    return () => {
      window.removeEventListener("beforeunload", report);
      report();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addDoc() {
    setDocs((p) => [...p, { type: "other", label: docTypeLabel(locale, "other"), required: false }]);
  }
  function updateDoc(i: number, patch: Partial<RequiredDocument>) {
    setDocs((p) => p.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }
  function removeDoc(i: number) {
    setDocs((p) => p.filter((_, idx) => idx !== i));
  }

  function addQuestion() {
    setQuestions((p) => [...p, { question: "", type: "text", required: true }]);
  }
  function updateQuestion(i: number, patch: Partial<ScreeningQuestion>) {
    setQuestions((p) => p.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function removeQuestion(i: number) {
    setQuestions((p) => p.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError(t.errTitle);
    if (!company.trim()) return setError(t.errCompany);
    if (!location.trim()) return setError(t.errLocation);

    setBusy(true);
    try {
      const cleanDocs = filterApplicationStageDocuments(
        docs
          .map((d) => ({
            type: d.type,
            label: (d.label || docTypeLabel(locale, d.type)).trim(),
            required: d.required,
          }))
          .filter((d) => d.label),
      );
      const cleanQuestions: ScreeningQuestion[] = questions
        .map((q) => {
          const out: ScreeningQuestion = {
            question: q.question.trim(),
            type: q.type,
            required: q.required !== false,
          };
          if (q.type === "choice") {
            out.options = (q.options ?? [])
              .map((o) => o.trim())
              .filter(Boolean);
          }
          return out;
        })
        .filter((q) => q.question);

      const payload = {
        title: title.trim(),
        company_name: company.trim(),
        location: location.trim(),
        salary_range: salary.trim() || undefined,
        schedule: schedule.trim() || undefined,
        description: description.trim() || undefined,
        urgency,
        closes_at: closesAt || null,
        required_documents: cleanDocs,
        screening_questions: cleanQuestions,
        video_screening: videoScreening,
        video_question:
          videoScreening !== "off" ? videoQuestion.trim() || null : null,
        created_via: createdVia,
        role_template: roleTemplate,
        clarity_score: quality.clarityScore,
        scorecard,
      };

      if (isEdit && vacancyId) {
        await updateVacancy({ id: vacancyId, ...payload });
        router.push(`/employer/vacancies/${vacancyId}?updated=1`);
      } else {
        // §10: финальный прогон проверки качества (аналитика) — данные кандидатов
        // не используются (§7).
        track("vacancy_quality_check_run", {
          clarity_score: quality.clarityScore,
          missing_fields_count: quality.missingFieldsCount,
          warnings_count: quality.warnings.length,
        });

        const { id } = await createVacancy(payload);
        publishedRef.current = true;

        const fieldsCompleted =
          [
            title.trim(),
            company.trim(),
            location.trim(),
            salary.trim(),
            schedule.trim(),
            description.trim(),
          ].filter(Boolean).length +
          (cleanDocs.length ? 1 : 0) +
          (cleanQuestions.length ? 1 : 0);

        track("vacancy_created", { vacancy_id: id });
        track("vacancy_published", {
          source: sourceRef.current,
          time_to_publish_seconds: Math.round(
            (Date.now() - startTimeRef.current) / 1000
          ),
          fields_completed_count: fieldsCompleted,
          clarity_score: quality.clarityScore,
        });
        router.push(`/employer/vacancies/${id}?created=1`);
      }
    } catch {
      setError(t.errGeneric);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">{isEdit ? t.editTitle : t.title}</h1>

      {/* Layer 1 — role-шаблоны (первичная поверхность) и Layer 2 — AI-freeform
          (вторичная кнопка за env-гейтом). Только при создании. */}
      {!isEdit && (
        <TemplateChips
          locale={locale}
          activeId={roleTemplate}
          onSelect={selectTemplate}
        />
      )}
      {!isEdit && aiEnabled && !showAi && (
        <button
          type="button"
          onClick={() => {
            setShowAi(true);
            stepRef.current = "ai_open";
            markStarted("ai_freeform");
          }}
          className="btn-ghost w-full"
        >
          {t.aiButton}
        </button>
      )}
      {!isEdit && aiEnabled && showAi && (
        <AiComposer
          locale={locale}
          onApply={applyDraft}
          onClose={() => setShowAi(false)}
        />
      )}

    <form
      onSubmit={handleSubmit}
      onChangeCapture={() => markStarted("manual")}
      className="space-y-5"
    >
      <div className="card grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">{t.jobTitle} *</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.jobTitlePh} />
        </div>
        <div>
          <label className="label">{t.company} *</label>
          <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div>
          <label className="label">{t.location} *</label>
          <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t.locationPh} />
        </div>
        <div>
          <label className="label">
            {t.salary} <span className="font-normal text-slate-400">({t.optional})</span>
          </label>
          <input className="input" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder={t.salaryPh} />
        </div>
        <div>
          <label className="label">
            {t.schedule} <span className="font-normal text-slate-400">({t.optional})</span>
          </label>
          <input className="input" value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder={t.schedulePh} />
        </div>
        <div>
          <label className="label">{t.urgency}</label>
          <select className="input" value={urgency} onChange={(e) => setUrgency(e.target.value as "normal" | "hiring_now")}>
            <option value="normal">{t.normal}</option>
            <option value="hiring_now">{t.hiringNow}</option>
          </select>
        </div>
        <div>
          <label className="label">
            {t.closesAt} <span className="font-normal text-slate-400">({t.optional})</span>
          </label>
          <input type="date" className="input" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">
            {t.description} <span className="font-normal text-slate-400">({t.optional})</span>
          </label>
          <textarea rows={4} className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>

      {/* Required documents */}
      <div className="card space-y-3">
        <div>
          <p className="label">{t.docs}</p>
          <p className="text-xs text-slate-500">{t.docsHint}</p>
        </div>
        {docs.map((d, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-500">{t.docType}</label>
                <select
                  className="input"
                  value={d.type}
                  onChange={(e) => {
                    const newType = e.target.value as DocType;
                    // Обновляем подпись, если пользователь её не менял вручную.
                    const wasDefault = d.label === docTypeLabel(locale, d.type);
                    updateDoc(i, {
                      type: newType,
                      ...(wasDefault ? { label: docTypeLabel(locale, newType) } : {}),
                    });
                  }}
                >
                  {APPLICATION_DOC_TYPES.map((dt) => (
                    <option key={dt} value={dt}>
                      {docTypeLabel(locale, dt)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">{t.docLabel}</label>
                <input className="input" value={d.label} onChange={(e) => updateDoc(i, { label: e.target.value })} />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={d.required}
                  onChange={(e) => updateDoc(i, { required: e.target.checked })}
                  className="h-4 w-4"
                />
                {t.reqd}
              </label>
              <button type="button" onClick={() => removeDoc(i)} className="text-xs text-red-500 hover:underline">
                {t.remove}
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addDoc} className="btn-ghost">
          {t.addDoc}
        </button>
      </div>

      {/* Screening questions */}
      <div className="card space-y-3">
        <div>
          <p className="label">{t.questions}</p>
          <p className="text-xs text-slate-500">{t.questionsHint}</p>
        </div>
        {questions.map((q, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <div>
                <label className="mb-1 block text-xs text-slate-500">{t.question}</label>
                <input className="input" value={q.question} onChange={(e) => updateQuestion(i, { question: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">&nbsp;</label>
                <select
                  className="input"
                  value={q.type}
                  onChange={(e) =>
                    updateQuestion(i, {
                      type: e.target.value as ScreeningQuestion["type"],
                    })
                  }
                >
                  <option value="text">{t.qText}</option>
                  <option value="yes_no">{t.qYesNo}</option>
                  <option value="choice">{t.qChoice}</option>
                </select>
              </div>
            </div>

            {q.type === "choice" && (
              <div className="mt-2">
                <label className="mb-1 block text-xs text-slate-500">
                  {t.options}{" "}
                  <span className="text-slate-400">({t.optionsHint})</span>
                </label>
                <input
                  className="input"
                  value={(q.options ?? []).join(", ")}
                  placeholder={t.optionsPh}
                  onChange={(e) =>
                    updateQuestion(i, {
                      options: e.target.value.split(","),
                    })
                  }
                />
              </div>
            )}

            <div className="mt-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={q.required !== false}
                  onChange={(e) => updateQuestion(i, { required: e.target.checked })}
                  className="h-4 w-4"
                />
                {t.reqd}
              </label>
              <button type="button" onClick={() => removeQuestion(i)} className="text-xs text-red-500 hover:underline">
                {t.remove}
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addQuestion} className="btn-ghost">
          {t.addQuestion}
        </button>
      </div>

      {/* Video screening */}
      <div className="card space-y-3">
        <div>
          <p className="label">🎥 {t.videoTitle}</p>
          <p className="text-xs text-slate-500">{t.videoHint}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
          <select
            className="input sm:w-40"
            value={videoScreening}
            onChange={(e) =>
              setVideoScreening(e.target.value as "off" | "optional" | "required")
            }
          >
            <option value="off">{t.videoOff}</option>
            <option value="optional">{t.videoOptional}</option>
            <option value="required">{t.videoRequired}</option>
          </select>
          {videoScreening !== "off" && (
            <div>
              <input
                className="input"
                value={videoQuestion}
                onChange={(e) => setVideoQuestion(e.target.value)}
                placeholder={t.videoQPh}
              />
              {videoScreening === "required" && (
                <p className="mt-1 text-xs text-amber-600">{t.videoWarn}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Layer 3 — детерминированная проверка качества (только по форме, §7). */}
      <QualityPanel locale={locale} result={quality} />

      {/* §8: scorecard — спящие метаданные ДЛЯ РОЛИ. Показываем ТОЛЬКО здесь, в
          редакторе вакансии, как планирование работодателя. Read-only. Никогда
          не попадает на кандидат-фейсинг экраны и никого не оценивает. */}
      {scorecard.length > 0 && (
        <div className="card space-y-3">
          <div>
            <p className="label">🗂️ {t.scorecardTitle}</p>
            <p className="text-xs text-slate-500">{t.scorecardHint}</p>
          </div>
          <ul className="space-y-2">
            {scorecard.map((c, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <span className="text-slate-700">{c.criterion}</span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {c.weight}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? (isEdit ? t.saving : t.creating) : isEdit ? t.save : t.create}
      </button>
    </form>
    </div>
  );
}
