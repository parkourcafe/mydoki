"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import {
  DOC_TYPES,
  docTypeLabel,
  type DocType,
  type RequiredDocument,
  type ScreeningQuestion,
} from "@/lib/career";
import { createVacancy, updateVacancy } from "@/app/employer/actions";
import { track } from "@/lib/analytics";
import RolePicker from "./RolePicker";
import type { RoleTemplate } from "@/lib/roleTemplates";

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
    descSection: "Job description",
    descPlace: "About the place & you",
    descPlacePh: "e.g. Cozy 30-seat cafe in Canggu, family vibe. I'm the owner — I value honesty and initiative.",
    descWho: "Who we're looking for",
    descWhoPh: "e.g. A cook for a small cafe kitchen",
    descPurpose: "Why / what for",
    descPurposePh: "e.g. We can't keep up at rush hour — need a second cook",
    descExpect: "What we expect",
    descExpectPh: "e.g. Cook from the menu, keep things clean, work as a team",
    descSkills: "Skills needed",
    descSkillsPh: "e.g. 1+ year kitchen experience, knows local cuisine",
    urgency: "Urgency",
    normal: "Normal",
    hiringNow: "Hiring now",
    closesAt: "Closes on",
    optional: "optional",
    docs: "Required documents",
    docsHint: "Documents the candidate must upload.",
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
    descSection: "Deskripsi lowongan",
    descPlace: "Tentang tempat & Anda",
    descPlacePh: "mis. Kafe nyaman 30 kursi di Canggu, suasana kekeluargaan. Saya pemiliknya — menghargai kejujuran dan inisiatif.",
    descWho: "Siapa yang dicari",
    descWhoPh: "mis. Juru masak untuk dapur kafe kecil",
    descPurpose: "Untuk apa",
    descPurposePh: "mis. Kewalahan saat jam sibuk — butuh juru masak kedua",
    descExpect: "Yang diharapkan",
    descExpectPh: "mis. Masak sesuai menu, jaga kebersihan, kerja tim",
    descSkills: "Keterampilan",
    descSkillsPh: "mis. Pengalaman dapur 1+ tahun, tahu masakan lokal",
    urgency: "Urgensi",
    normal: "Normal",
    hiringNow: "Butuh cepat",
    closesAt: "Ditutup pada",
    optional: "opsional",
    docs: "Dokumen wajib",
    docsHint: "Dokumen yang harus diunggah kandidat.",
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
    descSection: "Описание вакансии",
    descPlace: "О месте и о вас",
    descPlacePh: "напр. Уютное кафе на 30 мест в Чангу, семейная атмосфера. Я — владелец, ценю честность и инициативу.",
    descWho: "Кого ищем",
    descWhoPh: "напр. Повар на кухню небольшого кафе",
    descPurpose: "Для чего / зачем",
    descPurposePh: "напр. Не успеваем в часы пик — нужен второй повар",
    descExpect: "Что ожидаем",
    descExpectPh: "напр. Готовить по меню, держать чистоту, работать в команде",
    descSkills: "Какие навыки",
    descSkillsPh: "напр. Опыт на кухне от 1 года, знание местной кухни",
    urgency: "Срочность",
    normal: "Обычная",
    hiringNow: "Срочный набор",
    closesAt: "Закрыть",
    optional: "необязательно",
    docs: "Обязательные документы",
    docsHint: "Документы, которые кандидат должен загрузить.",
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
    descSection: "Vakansiya tavsifi",
    descPlace: "Joy va o‘zingiz haqida",
    descPlacePh: "mas. Changuda 30 o‘rinli qulay kafe, oilaviy muhit. Men egasiman — halollik va tashabbusni qadrlayman.",
    descWho: "Kim kerak",
    descWhoPh: "mas. Kichik kafe oshxonasiga oshpaz",
    descPurpose: "Nima uchun",
    descPurposePh: "mas. Gavjum vaqtda ulgurmayapmiz — ikkinchi oshpaz kerak",
    descExpect: "Nima kutamiz",
    descExpectPh: "mas. Menyu bo‘yicha pishirish, tozalik, jamoada ishlash",
    descSkills: "Qanday ko‘nikmalar",
    descSkillsPh: "mas. Oshxonada 1+ yil tajriba, mahalliy taomlarni bilish",
    urgency: "Shoshilinchlik",
    normal: "Oddiy",
    hiringNow: "Shoshilinch",
    closesAt: "Yopilish sanasi",
    optional: "ixtiyoriy",
    docs: "Majburiy hujjatlar",
    docsHint: "Nomzod yuklashi shart bo‘lgan hujjatlar.",
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
  },
} as const;

// Описание вакансии храним ОДНИМ полем `description` (кандидат видит цельный
// текст), но в форме делим на 4 части. Маркеры-эмодзи в заголовках не зависят
// от языка — по ним разбираем текст обратно на части при редактировании.
const DESC_SECTIONS = [
  { emoji: "🏠", key: "place" },
  { emoji: "👤", key: "who" },
  { emoji: "🎯", key: "purpose" },
  { emoji: "✅", key: "expect" },
  { emoji: "🧩", key: "skills" },
] as const;

type DescParts = {
  place: string;
  who: string;
  purpose: string;
  expect: string;
  skills: string;
};

function combineDescription(parts: DescParts, labels: DescParts): string {
  return DESC_SECTIONS.map(({ emoji, key }) => {
    const text = parts[key].trim();
    return text ? `${emoji} ${labels[key]}\n${text}` : "";
  })
    .filter(Boolean)
    .join("\n\n");
}

function parseDescription(desc: string | null | undefined): DescParts {
  const out: DescParts = { place: "", who: "", purpose: "", expect: "", skills: "" };
  if (!desc) return out;
  const hasMarkers = DESC_SECTIONS.some(({ emoji }) => desc.includes(emoji));
  if (!hasMarkers) return { ...out, who: desc.trim() }; // старый цельный текст
  const buf: Record<keyof DescParts, string[]> = {
    place: [],
    who: [],
    purpose: [],
    expect: [],
    skills: [],
  };
  let current: keyof DescParts | null = null;
  for (const line of desc.split("\n")) {
    const hit = DESC_SECTIONS.find(({ emoji }) => line.trimStart().startsWith(emoji));
    if (hit) {
      current = hit.key;
      continue;
    }
    if (current) buf[current].push(line);
  }
  for (const { key } of DESC_SECTIONS) out[key] = buf[key].join("\n").trim();
  return out;
}

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
  fromWizard = false,
}: {
  locale: Locale;
  defaultCompany: string;
  mode?: "create" | "edit";
  vacancyId?: string;
  initial?: VacancyInitial;
  fromWizard?: boolean;
}) {
  const t = M[locale];
  const router = useRouter();
  const isEdit = mode === "edit";

  const [title, setTitle] = useState(initial?.title ?? "");
  const [company, setCompany] = useState(initial?.company_name ?? defaultCompany);
  const [location, setLocation] = useState(initial?.location ?? "");
  const [salary, setSalary] = useState(initial?.salary_range ?? "");
  const [schedule, setSchedule] = useState(initial?.schedule ?? "");
  const initDesc = parseDescription(initial?.description);
  const [descPlace, setDescPlace] = useState(initDesc.place);
  const [descWho, setDescWho] = useState(initDesc.who);
  const [descPurpose, setDescPurpose] = useState(initDesc.purpose);
  const [descExpect, setDescExpect] = useState(initDesc.expect);
  const [descSkills, setDescSkills] = useState(initDesc.skills);
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
  const [pickerOpen, setPickerOpen] = useState(!isEdit && !fromWizard);

  // Выбор роли из библиотеки → заполняем название, 4 блока и документы.
  function applyRole(r: RoleTemplate) {
    setTitle(r.title);
    setDescWho(r.blocks.who);
    setDescPurpose(r.blocks.purpose);
    setDescExpect(r.blocks.expect);
    setDescSkills(r.blocks.skills);
    setDocs(
      r.docs.map((d) => ({
        type: d.type,
        label: d.label ?? docTypeLabel(locale, d.type),
        required: d.required,
      }))
    );
    setPickerOpen(false);
    track("role_template_picked", { role: r.key });
  }

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
      const cleanDocs = docs
        .map((d) => ({
          type: d.type,
          label: (d.label || docTypeLabel(locale, d.type)).trim(),
          required: d.required,
        }))
        .filter((d) => d.label);
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
        description:
          combineDescription(
            { place: descPlace, who: descWho, purpose: descPurpose, expect: descExpect, skills: descSkills },
            { place: t.descPlace, who: t.descWho, purpose: t.descPurpose, expect: t.descExpect, skills: t.descSkills }
          ) || undefined,
        urgency,
        closes_at: closesAt || null,
        required_documents: cleanDocs,
        screening_questions: cleanQuestions,
        video_screening: videoScreening,
        video_question:
          videoScreening !== "off" ? videoQuestion.trim() || null : null,
      };

      if (isEdit && vacancyId) {
        await updateVacancy({ id: vacancyId, ...payload });
        router.push(`/employer/vacancies/${vacancyId}?updated=1`);
      } else {
        const { id } = await createVacancy(payload);
        track("vacancy_created", { vacancy_id: id });
        router.push(`/employer/vacancies/${id}?created=1`);
      }
    } catch {
      setError(t.errGeneric);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">{isEdit ? t.editTitle : t.title}</h1>

      {!isEdit && (
        <RolePicker
          locale={locale}
          open={pickerOpen}
          onToggle={() => setPickerOpen((o) => !o)}
          onPick={applyRole}
        />
      )}

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
        <div className="sm:col-span-2 space-y-3">
          <p className="label">
            {t.descSection} <span className="font-normal text-slate-400">({t.optional})</span>
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">🏠 {t.descPlace}</label>
            <textarea rows={3} className="input" value={descPlace} onChange={(e) => setDescPlace(e.target.value)} placeholder={t.descPlacePh} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">👤 {t.descWho}</label>
            <textarea rows={3} className="input" value={descWho} onChange={(e) => setDescWho(e.target.value)} placeholder={t.descWhoPh} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">🎯 {t.descPurpose}</label>
            <textarea rows={3} className="input" value={descPurpose} onChange={(e) => setDescPurpose(e.target.value)} placeholder={t.descPurposePh} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">✅ {t.descExpect}</label>
            <textarea rows={4} className="input" value={descExpect} onChange={(e) => setDescExpect(e.target.value)} placeholder={t.descExpectPh} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">🧩 {t.descSkills}</label>
            <textarea rows={3} className="input" value={descSkills} onChange={(e) => setDescSkills(e.target.value)} placeholder={t.descSkillsPh} />
          </div>
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
                  {DOC_TYPES.map((dt) => (
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

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? (isEdit ? t.saving : t.creating) : isEdit ? t.save : t.create}
      </button>
    </form>
  );
}
