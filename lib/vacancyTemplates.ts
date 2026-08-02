import type { Locale } from "./i18n";
import {
  docTypeLabel,
  filterApplicationStageDocuments,
  type DocType,
  type RequiredDocument,
  type ScreeningQuestion,
} from "./career";

// =====================================================================
// T11 Layer 1 — Role templates (первичная поверхность создания вакансии).
//
// MVP-реализация — типизированный TS-реестр констант. НЕ строим админ-редактор
// и не заводим таблицу/CMS в T11 (см. DEV_TASK §5). Форма реестра стабильна
// (id, category, локализация), чтобы позже без переписывания переехать в
// таблицу vacancy_templates, когда это понадобится (много шаблонов, не-тех
// редактирование, локализация по рынкам, A/B).
//
// Каждый шаблон прифиллит форму, включая дефолтные required_documents (самая
// ценная часть). Пять пусковых шаблонов покрывают ~80% рынка запуска
// (гостеприимство, стаффинг, школы). Расширяем позже.
// =====================================================================

export type VacancyTemplateCategory =
  | "hospitality"
  | "staffing"
  | "school"
  | "logistics"
  | "security";

/** Дефолтный документ шаблона. Подпись берём из docTypeLabel, кроме override. */
type TemplateDoc = {
  type: DocType;
  required: boolean;
  /** Своя подпись, если стандартной локализации типа недостаточно (напр. SIM). */
  labelOverride?: Record<Locale, string>;
};

type TemplateQuestion = {
  type: "text" | "yes_no";
  text: Record<Locale, string>;
};

export type VacancyTemplate = {
  /** Стабильный id (совместим с будущим PK таблицы vacancy_templates). */
  id: string;
  category: VacancyTemplateCategory;
  emoji: string;
  /** Метка чипа и дефолтное название должности. */
  label: Record<Locale, string>;
  documents: TemplateDoc[];
  questions: TemplateQuestion[];
};

export const VACANCY_TEMPLATES: readonly VacancyTemplate[] = [
  {
    // Покрывает F&B-семью (бариста / официант / повар) — единые дефолты.
    id: "barista",
    category: "hospitality",
    emoji: "☕",
    label: { en: "Barista", id: "Barista", ru: "Бариста", uz: "Barista" },
    documents: [
      { type: "cv", required: false },
    ],
    questions: [
      {
        type: "yes_no",
        text: {
          en: "Do you have F&B experience?",
          id: "Punya pengalaman F&B?",
          ru: "Есть опыт в общепите (F&B)?",
          uz: "F&B (umumiy ovqatlanish) tajribangiz bormi?",
        },
      },
      {
        type: "yes_no",
        text: {
          en: "Available for shift work?",
          id: "Bersedia kerja shift?",
          ru: "Готовы работать посменно?",
          uz: "Smenali ishlashga tayyormisiz?",
        },
      },
    ],
  },
  {
    id: "housekeeping",
    category: "hospitality",
    emoji: "🧹",
    label: {
      en: "Housekeeping",
      id: "Housekeeping",
      ru: "Горничная",
      uz: "Xonabop",
    },
    documents: [
      { type: "cv", required: false },
    ],
    questions: [
      {
        type: "text",
        text: {
          en: "Previous hotel/villa experience?",
          id: "Pengalaman di hotel/vila sebelumnya?",
          ru: "Опыт работы в отеле/на вилле?",
          uz: "Mehmonxona/villada avvalgi tajriba?",
        },
      },
    ],
  },
  {
    id: "teacher",
    category: "school",
    emoji: "📚",
    label: { en: "Teacher", id: "Guru", ru: "Учитель", uz: "O‘qituvchi" },
    documents: [
      { type: "cv", required: true },
      { type: "diploma", required: true },
      { type: "certificate", required: false },
    ],
    questions: [
      {
        type: "text",
        text: {
          en: "Which subjects/levels can you teach?",
          id: "Mata pelajaran/jenjang apa yang bisa Anda ajar?",
          ru: "Какие предметы/уровни можете преподавать?",
          uz: "Qaysi fan/darajalarni o‘qita olasiz?",
        },
      },
    ],
  },
  {
    id: "security",
    category: "security",
    emoji: "🛡️",
    label: { en: "Security", id: "Satpam", ru: "Охранник", uz: "Qorovul" },
    documents: [
      { type: "cv", required: false },
      { type: "certificate", required: false },
    ],
    questions: [
      {
        type: "yes_no",
        text: {
          en: "Do you hold a Garda license?",
          id: "Apakah Anda punya lisensi Garda?",
          ru: "Есть ли у вас лицензия Garda?",
          uz: "Garda litsenziyangiz bormi?",
        },
      },
    ],
  },
  {
    id: "driver",
    category: "logistics",
    emoji: "🚗",
    label: { en: "Driver", id: "Sopir", ru: "Водитель", uz: "Haydovchi" },
    documents: [
      { type: "cv", required: true },
      {
        type: "other",
        required: false,
        labelOverride: {
          en: "SIM (driving license)",
          id: "SIM",
          ru: "Водительское удостоверение (SIM)",
          uz: "SIM (haydovchilik guvohnomasi)",
        },
      },
    ],
    questions: [
      {
        type: "text",
        text: {
          en: "Which SIM (license) class?",
          id: "SIM kelas apa?",
          ru: "Какая категория прав (SIM)?",
          uz: "Qaysi toifadagi SIM (guvohnoma)?",
        },
      },
    ],
  },
  {
    // Bali hospitality wedge — общий пак под персонал виллы.
    // Только документы стадии отклика; KTP/мед-справка собираются после оффера.
    id: "villa_staff",
    category: "hospitality",
    emoji: "🏝️",
    label: {
      en: "Villa staff",
      id: "Staf vila",
      ru: "Персонал виллы",
      uz: "Villa xodimi",
    },
    documents: [
      { type: "cv", required: false },
      {
        type: "other",
        required: false,
        labelOverride: {
          en: "SKCK (police record)",
          id: "SKCK",
          ru: "Справка о несудимости (SKCK)",
          uz: "SKCK (sudlanmaganlik guvohnomasi)",
        },
      },
      {
        type: "other",
        required: false,
        labelOverride: {
          en: "Photo",
          id: "Pas foto",
          ru: "Фото",
          uz: "Pas foto",
        },
      },
      {
        type: "other",
        required: false,
        labelOverride: {
          en: "Work reference",
          id: "Surat referensi kerja",
          ru: "Рекомендация с работы",
          uz: "Ish tavsiyanomasi",
        },
      },
    ],
    questions: [
      {
        type: "text",
        text: {
          en: "Previous villa/hospitality experience?",
          id: "Pengalaman di vila/perhotelan sebelumnya?",
          ru: "Опыт работы на вилле/в гостеприимстве?",
          uz: "Villa/mehmondoʻstlikdagi avvalgi tajriba?",
        },
      },
    ],
  },
  {
    id: "receptionist",
    category: "hospitality",
    emoji: "🛎️",
    label: {
      en: "Receptionist",
      id: "Resepsionis",
      ru: "Ресепшн",
      uz: "Resepsionist",
    },
    documents: [
      { type: "cv", required: true },
      { type: "certificate", required: false },
      {
        type: "other",
        required: false,
        labelOverride: {
          en: "Photo",
          id: "Pas foto",
          ru: "Фото",
          uz: "Pas foto",
        },
      },
    ],
    questions: [
      {
        type: "text",
        text: {
          en: "English level (basic/intermediate/fluent)?",
          id: "Tingkat bahasa Inggris (dasar/menengah/lancar)?",
          ru: "Уровень английского (базовый/средний/свободный)?",
          uz: "Ingliz tili darajasi (boshlangʻich/oʻrta/erkin)?",
        },
      },
    ],
  },
  {
    // Универсальный вход для агентств: линейный персонал без узкой роли.
    id: "staff_general",
    category: "staffing",
    emoji: "👥",
    label: {
      en: "General staff",
      id: "Staf umum",
      ru: "Линейный персонал",
      uz: "Umumiy xodim",
    },
    documents: [
      { type: "cv", required: false },
      {
        type: "other",
        required: false,
        labelOverride: {
          en: "SKCK (police record)",
          id: "SKCK",
          ru: "Справка о несудимости (SKCK)",
          uz: "SKCK (sudlanmaganlik guvohnomasi)",
        },
      },
      {
        type: "other",
        required: false,
        labelOverride: {
          en: "Photo",
          id: "Pas foto",
          ru: "Фото",
          uz: "Pas foto",
        },
      },
    ],
    questions: [
      {
        type: "text",
        text: {
          en: "Which position are you applying for?",
          id: "Melamar untuk posisi apa?",
          ru: "На какую позицию откликаетесь?",
          uz: "Qaysi lavozimga ariza berayapsiz?",
        },
      },
    ],
  },
] as const;

export function getTemplate(id: string): VacancyTemplate | undefined {
  return VACANCY_TEMPLATES.find((t) => t.id === id);
}

export type TemplatePrefill = {
  role_template: string;
  category: VacancyTemplateCategory;
  title: string;
  required_documents: RequiredDocument[];
  screening_questions: ScreeningQuestion[];
};

/** Разворачивает шаблон в значения формы для текущей локали. */
export function templatePrefill(
  template: VacancyTemplate,
  locale: Locale
): TemplatePrefill {
  return {
    role_template: template.id,
    category: template.category,
    title: template.label[locale] ?? template.label.en,
    required_documents: filterApplicationStageDocuments(
      template.documents.map((d) => ({
        type: d.type,
        label: d.labelOverride?.[locale] ?? docTypeLabel(locale, d.type),
        required: d.required,
      })),
    ),
    screening_questions: template.questions.map((q) => ({
      question: q.text[locale] ?? q.text.en,
      type: q.type,
      required: true,
    })),
  };
}

// Ключевые слова для эвристики role_category_detected (аналитика §10, событие 3)
// и подсказки категории по свободному вводу. Только детект категории — НЕ скоринг.
const CATEGORY_KEYWORDS: Record<VacancyTemplateCategory, string[]> = {
  hospitality: [
    "barista",
    "бариста",
    "waiter",
    "официант",
    "cook",
    "повар",
    "chef",
    "kitchen",
    "cafe",
    "caf",
    "кафе",
    "restaurant",
    "ресторан",
    "bar",
    "бар",
    "f&b",
    "housekeeping",
    "housekeeper",
    "горничн",
    "клинин",
    "cleaner",
    "villa",
    "вилл",
    "hotel",
    "отель",
    "hostel",
    "resepsionis",
    "receptionist",
  ],
  school: [
    "teacher",
    "учител",
    "преподават",
    "guru",
    "tutor",
    "репетитор",
    "school",
    "школ",
    "kindergarten",
    "детск",
    "nanny",
    "няня",
    "educator",
  ],
  logistics: [
    "driver",
    "водител",
    "sopir",
    "courier",
    "курьер",
    "delivery",
    "доставк",
    "logistic",
    "логист",
    "warehouse",
    "склад",
    "sim",
  ],
  security: [
    "security",
    "охранник",
    "охран",
    "satpam",
    "guard",
    "garda",
    "watchman",
    "сторож",
  ],
  staffing: [
    "staff",
    "персонал",
    "helper",
    "разнорабоч",
    "labor",
    "worker",
    "рабоч",
  ],
};

/**
 * Грубая эвристика: к какой категории тяготеет свободный ввод. Только для
 * аналитики/подсказки шаблона — не влияет на кандидатов. Возвращает null,
 * если явных совпадений нет.
 */
export function detectRoleCategory(
  text: string
): VacancyTemplateCategory | null {
  const hay = (text || "").toLowerCase();
  if (!hay.trim()) return null;
  let best: VacancyTemplateCategory | null = null;
  let bestHits = 0;
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS) as [
    VacancyTemplateCategory,
    string[]
  ][]) {
    const hits = words.reduce((n, w) => (hay.includes(w) ? n + 1 : n), 0);
    if (hits > bestHits) {
      bestHits = hits;
      best = cat;
    }
  }
  return best;
}
