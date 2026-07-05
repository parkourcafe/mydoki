import type { DocType, RequiredDocument, ScreeningQuestion } from "./career";
import { ROLE_TEMPLATES } from "./roleTemplates";
import type { VacancyInitial } from "@/app/employer/vacancies/new/VacancyForm";

// Диалоговый сбор вакансии (Quick-режим, Фаза 1). Один вопрос — один экран.
// Ответы детерминированно собираются в черновик вакансии (без AI). Контент
// на русском (пилот). Кастомные значения хранятся как "custom:<текст>".

export type Option = { value: string; label: string };

export type Step = {
  id: string;
  kind: "role" | "single" | "multi" | "text";
  title: string;
  hint?: string;
  options?: Option[];
  allowCustom?: boolean;
  placeholder?: string;
  optional?: boolean;
  /** Показывать шаг только если предикат истинен. */
  when?: (a: Answers) => boolean;
};

export type Answers = Record<string, string | string[] | undefined>;

const CUSTOM = "custom:";
export function isCustom(v: string): boolean {
  return v.startsWith(CUSTOM);
}
export function customText(v: string): string {
  return v.slice(CUSTOM.length);
}
export function mkCustom(text: string): string {
  return CUSTOM + text.trim();
}

export const STEPS: Step[] = [
  { id: "role", kind: "role", title: "Кого именно ищем?", hint: "Выбери близкую роль — под неё подставим задачи и документы." },
  {
    id: "location",
    kind: "text",
    title: "Где работа? (куда приглашаешь)",
    placeholder: "напр. Чангу, Бали",
  },
  {
    id: "schedule",
    kind: "single",
    title: "Формат и график работы?",
    allowCustom: true,
    options: [
      { value: "Полный день", label: "Полный день" },
      { value: "Смены / посменно", label: "Смены / посменно" },
      { value: "Частичная занятость", label: "Частичная занятость" },
      { value: "Поле + ежедневная отчётность", label: "Поле + ежедневная отчётность" },
      { value: "Удалённо", label: "Удалённо" },
      { value: "Удалённо + разъезды", label: "Удалённо + разъезды" },
    ],
  },
  {
    id: "experience",
    kind: "single",
    title: "Сколько нужно опыта?",
    options: [
      { value: "Без опыта — научим", label: "Без опыта — научим" },
      { value: "До 1 года", label: "До 1 года" },
      { value: "1–3 года", label: "1–3 года" },
      { value: "3+ лет", label: "3+ лет" },
      { value: "Не важно", label: "Не важно" },
    ],
  },
  {
    id: "languages",
    kind: "single",
    title: "Какой язык обязателен от кандидата?",
    allowCustom: true,
    options: [
      { value: "Bahasa Indonesia", label: "Bahasa Indonesia" },
      { value: "Bahasa Indonesia + English", label: "Bahasa Indonesia + English" },
      { value: "English", label: "English" },
      { value: "Русский + English", label: "Русский + English" },
      { value: "Не важно", label: "Не важно" },
    ],
  },
  {
    id: "tasks",
    kind: "multi",
    title: "Что человек будет делать каждый день?",
    hint: "Можно выбрать несколько.",
    allowCustom: true,
    options: [
      { value: "Звонки и WhatsApp", label: "Звонки и WhatsApp" },
      { value: "Поиск контактов", label: "Поиск контактов" },
      { value: "Выезды на встречи", label: "Выезды на встречи" },
      { value: "Размещение объявлений", label: "Размещение объявлений" },
      { value: "Продажи / закрытие клиентов", label: "Продажи / закрытие клиентов" },
      { value: "Вести таблицу / CRM", label: "Вести таблицу / CRM" },
      { value: "Ежедневный отчёт", label: "Ежедневный отчёт" },
      { value: "Обслуживание гостей", label: "Обслуживание гостей" },
      { value: "Готовка", label: "Готовка" },
      { value: "Уборка / чистота", label: "Уборка / чистота" },
      { value: "Касса / расчёт", label: "Касса / расчёт" },
    ],
  },
  {
    id: "qualities",
    kind: "multi",
    title: "Какие качества критичны? (идеальный кандидат)",
    hint: "Можно выбрать несколько.",
    allowCustom: true,
    options: [
      { value: "Энергичность", label: "Энергичность" },
      { value: "Самостоятельность", label: "Самостоятельность" },
      { value: "Уверенная речь", label: "Уверенная речь" },
      { value: "Презентабельность", label: "Презентабельность" },
      { value: "Ответственность", label: "Ответственность" },
      { value: "Организованность", label: "Организованность" },
      { value: "Не боится звонить незнакомым", label: "Не боится звонить незнакомым" },
      { value: "Умение слушать", label: "Умение слушать" },
    ],
  },
  {
    id: "musts",
    kind: "multi",
    title: "Что обязательно иметь?",
    hint: "Жёсткие требования. Можно выбрать несколько.",
    allowCustom: true,
    options: [
      { value: "transport", label: "Свой транспорт + права (SIM C)" },
      { value: "trips", label: "Готовность к разъездам" },
      { value: "english", label: "Английский" },
      { value: "food_exp", label: "Опыт в общепите" },
      { value: "shifts", label: "Готовность к сменам / ночам" },
    ],
  },
  {
    id: "documents",
    kind: "multi",
    title: "Какие документы просить у кандидата?",
    hint: "Можно выбрать несколько.",
    allowCustom: true,
    options: [
      { value: "ktp", label: "KTP" },
      { value: "cv", label: "CV / резюме" },
      { value: "health", label: "Медсправка" },
      { value: "sim", label: "Права (SIM C)" },
      { value: "intro", label: "Голосовое / видео-интро" },
      { value: "diploma", label: "Диплом / сертификат" },
    ],
  },
  {
    id: "salaryModel",
    kind: "single",
    title: "Как платим?",
    options: [
      { value: "Только фикс", label: "Только фикс" },
      { value: "Фикс + % с продаж", label: "Фикс + % с продаж" },
      { value: "Договорная", label: "Договорная" },
    ],
  },
  {
    id: "dealDef",
    kind: "single",
    title: "Что считается закрытой сделкой?",
    allowCustom: true,
    when: (a) => a.salaryModel === "Фикс + % с продаж",
    options: [
      { value: "Клиент оплатил", label: "Клиент оплатил" },
      { value: "Внёс подтверждённый депозит", label: "Внёс подтверждённый депозит" },
      { value: "Подписал договор", label: "Подписал договор" },
      { value: "Пришёл на встречу", label: "Пришёл на встречу" },
    ],
  },
  {
    id: "salary",
    kind: "text",
    title: "Сумма зарплаты?",
    optional: true,
    placeholder: "напр. Rp 4–5 млн / мес",
  },
];

/** Видимые шаги для текущих ответов (с учётом when). */
export function visibleSteps(a: Answers): Step[] {
  return STEPS.filter((s) => !s.when || s.when(a));
}

// ── Сборка черновика из ответов ──────────────────────────────────────

const DOC_MAP: Record<string, { type: DocType; label: string; required: boolean }> = {
  ktp: { type: "ktp", label: "KTP", required: true },
  cv: { type: "cv", label: "CV / резюме", required: true },
  health: { type: "health_cert", label: "Медсправка", required: true },
  sim: { type: "other", label: "Права (SIM C)", required: true },
  intro: { type: "other", label: "Голосовое / видео-интро", required: false },
  diploma: { type: "diploma", label: "Диплом / сертификат", required: false },
};

function arr(a: Answers, id: string): string[] {
  const v = a[id];
  return Array.isArray(v) ? v : [];
}
function str(a: Answers, id: string): string {
  const v = a[id];
  return typeof v === "string" ? v : "";
}
function labelize(values: string[]): string[] {
  return values.map((v) => (isCustom(v) ? customText(v) : v)).filter(Boolean);
}

function joinLines(base: string, extra: string[]): string {
  const lines = [base.trim(), ...extra.map((e) => `— ${e}`)].filter(Boolean);
  return lines.join("\n");
}

function block(emoji: string, label: string, text: string): string {
  const t = text.trim();
  return t ? `${emoji} ${label}\n${t}` : "";
}

export function buildDraft(a: Answers, defaultCompany: string): VacancyInitial {
  const roleVal = str(a, "role");
  const role = isCustom(roleVal)
    ? undefined
    : ROLE_TEMPLATES.find((r) => r.key === roleVal);
  const title = role?.title ?? (isCustom(roleVal) ? customText(roleVal) : "");

  const baseWho = role?.blocks.who ?? "";
  const basePurpose = role?.blocks.purpose ?? "";
  const baseExpect = role?.blocks.expect ?? "";
  const baseSkills = role?.blocks.skills ?? "";

  // who + качества; expect + задачи; skills + опыт/языки/требования.
  const who = joinLines(baseWho, labelize(arr(a, "qualities")));
  const expect = joinLines(baseExpect, labelize(arr(a, "tasks")));

  const skillLines: string[] = [];
  const exp = str(a, "experience");
  if (exp && exp !== "Не важно") skillLines.push(`Опыт: ${exp}`);
  const lang = str(a, "languages");
  if (lang && lang !== "Не важно") skillLines.push(`Язык: ${lang}`);
  for (const m of arr(a, "musts")) {
    const opt = STEPS.find((s) => s.id === "musts")?.options?.find((o) => o.value === m);
    skillLines.push(isCustom(m) ? customText(m) : opt?.label ?? m);
  }
  const skills = joinLines(baseSkills, skillLines);

  const description = [
    block("👤", "Кого ищем", who),
    block("🎯", "Для чего", basePurpose),
    block("✅", "Что ожидаем", expect),
    block("🧩", "Какие навыки", skills),
  ]
    .filter(Boolean)
    .join("\n\n");

  // Документы: из ответа, иначе из шаблона роли.
  const docSel = arr(a, "documents");
  let docs: RequiredDocument[];
  if (docSel.length) {
    docs = docSel.map((v) =>
      isCustom(v)
        ? { type: "other" as DocType, label: customText(v), required: true }
        : DOC_MAP[v] ?? { type: "other" as DocType, label: v, required: true }
    );
  } else {
    docs = (role?.docs ?? [{ type: "ktp" as DocType, required: true }]).map((d) => ({
      type: d.type,
      label: d.label ?? DOC_MAP[d.type]?.label ?? "Документ",
      required: d.required,
    }));
  }

  // Зарплата: сумма + модель оплаты.
  const salaryModel = str(a, "salaryModel");
  const salaryParts: string[] = [];
  if (str(a, "salary")) salaryParts.push(str(a, "salary"));
  if (salaryModel && salaryModel !== "Договорная") {
    const deal = str(a, "dealDef");
    salaryParts.push(
      salaryModel + (deal ? ` (сделка = ${isCustom(deal) ? customText(deal) : deal})` : "")
    );
  }
  const salary_range = salaryParts.join(" · ") || null;

  // Скрининг-вопрос из требований (Фаза 1 — минимум).
  const screening_questions: ScreeningQuestion[] = [];
  if (arr(a, "musts").includes("transport")) {
    screening_questions.push({
      question: "Есть ли у вас свой транспорт и права (SIM C)?",
      type: "yes_no",
      required: true,
    });
  }

  return {
    title,
    company_name: defaultCompany,
    location: str(a, "location") || null,
    salary_range,
    schedule: str(a, "schedule") || null,
    description: description || null,
    urgency: "normal",
    closes_at: null,
    required_documents: docs,
    screening_questions,
    video_screening: "off",
    video_question: null,
  };
}
