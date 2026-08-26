// =====================================================================
// Структурное резюме кандидата.
//
// Было: весь опыт работы жил одним текстовым абзацем (resumes.experience).
// Стало: типизированные секции в resumes.sections (jsonb) — опыт, обучение,
// навыки, языки. Старое текстовое поле остаётся и показывается как запасной
// вариант, пока человек не перенёс опыт в структурные записи.
//
// Модуль чистый: без сети и без server-only. Его использует и редактор на
// клиенте, и серверный экшен (нормализация перед записью), и юнит-тесты.
// =====================================================================

export type ResumeExperience = {
  id: string;
  position: string;
  company: string;
  /**
   * Ссылка на запись трудовых отношений (employments.id), если строка взята
   * из карьерного таймлайна, а не набрана руками. Ставит только сервер,
   * проверив, что запись действительно принадлежит этому человеку.
   */
  employment_id: string | null;
  /**
   * Оформлено работодателем внутри doki (employments.manual === false).
   * Вычисляется на сервере при чтении и при отправке отклика; в резюме
   * пользователя не хранится, чтобы это нельзя было себе приписать.
   */
  verified: boolean;
  /** YYYY-MM либо пустая строка. */
  start: string;
  /** YYYY-MM либо пустая строка. При current === true игнорируется. */
  end: string;
  /** Работает здесь по сей день. */
  current: boolean;
  description: string;
};

export type ResumeEducation = {
  id: string;
  institution: string;
  program: string;
  start: string;
  end: string;
};

export type ResumeLanguage = {
  id: string;
  name: string;
  /** Свободная подпись уровня: «родной», «basic», «B2» — не enum. */
  level: string;
};

export type ResumeSections = {
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  languages: ResumeLanguage[];
};

/** Потолки: защищают и хранилище, и вёрстку одностраничного CV. */
export const RESUME_LIMITS = {
  experience: 20,
  education: 10,
  skills: 30,
  languages: 10,
  shortText: 120,
  description: 1200,
} as const;

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Валиден ли период вида YYYY-MM. Пустая строка валидной не считается. */
export function isMonth(value: string): boolean {
  return MONTH_RE.test(value);
}

export function emptySections(): ResumeSections {
  return { experience: [], education: [], skills: [], languages: [] };
}

/** Идентификатор записи. crypto есть и в браузере, и в Node ≥ 19. */
export function newEntryId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function month(value: unknown): string {
  const v = typeof value === "string" ? value.trim() : "";
  return isMonth(v) ? v : "";
}

function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function id(value: unknown): string {
  const v = typeof value === "string" ? value.trim().slice(0, 64) : "";
  return v || newEntryId();
}

/**
 * Читает секции из jsonb. Терпим к чужому и старому формату: всё неизвестное
 * отбрасывается, ничего не бросает. Результат уже нормализован.
 */
export function parseSections(raw: unknown): ResumeSections {
  if (!raw || typeof raw !== "object") return emptySections();
  const o = raw as Record<string, unknown>;

  return normalizeSections({
    experience: arr(o.experience).map((e) => {
      const x = (e ?? {}) as Record<string, unknown>;
      return {
        id: id(x.id),
        position: str(x.position, RESUME_LIMITS.shortText),
        company: str(x.company, RESUME_LIMITS.shortText),
        employment_id: str(x.employment_id, 64) || null,
        verified: x.verified === true,
        start: month(x.start),
        end: month(x.end),
        current: x.current === true,
        description: str(x.description, RESUME_LIMITS.description),
      };
    }),
    education: arr(o.education).map((e) => {
      const x = (e ?? {}) as Record<string, unknown>;
      return {
        id: id(x.id),
        institution: str(x.institution, RESUME_LIMITS.shortText),
        program: str(x.program, RESUME_LIMITS.shortText),
        start: month(x.start),
        end: month(x.end),
      };
    }),
    skills: arr(o.skills).map((s) => str(s, RESUME_LIMITS.shortText)),
    languages: arr(o.languages).map((e) => {
      const x = (e ?? {}) as Record<string, unknown>;
      return {
        id: id(x.id),
        name: str(x.name, RESUME_LIMITS.shortText),
        level: str(x.level, RESUME_LIMITS.shortText),
      };
    }),
  });
}

const experienceEmpty = (e: ResumeExperience) =>
  !e.position && !e.company && !e.description && !e.start && !e.end && !e.employment_id;

const educationEmpty = (e: ResumeEducation) =>
  !e.institution && !e.program && !e.start && !e.end;

/**
 * Приводит секции к каноническому виду: тримминг, потолки длины и количества,
 * выброс пустых записей, снятие end у текущего места работы, дедупликация
 * навыков без учёта регистра. Вызывается и на клиенте, и на сервере.
 */
export function normalizeSections(input: ResumeSections): ResumeSections {
  const experience = input.experience
    .map((e) => ({
      id: id(e.id),
      position: str(e.position, RESUME_LIMITS.shortText),
      company: str(e.company, RESUME_LIMITS.shortText),
      employment_id: str(e.employment_id, 64) || null,
      verified: e.verified === true,
      start: month(e.start),
      end: e.current === true ? "" : month(e.end),
      current: e.current === true,
      description: str(e.description, RESUME_LIMITS.description),
    }))
    .filter((e) => !experienceEmpty(e))
    .slice(0, RESUME_LIMITS.experience);

  const education = input.education
    .map((e) => ({
      id: id(e.id),
      institution: str(e.institution, RESUME_LIMITS.shortText),
      program: str(e.program, RESUME_LIMITS.shortText),
      start: month(e.start),
      end: month(e.end),
    }))
    .filter((e) => !educationEmpty(e))
    .slice(0, RESUME_LIMITS.education);

  const seen = new Set<string>();
  const skills: string[] = [];
  for (const raw of input.skills) {
    const s = str(raw, RESUME_LIMITS.shortText);
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    skills.push(s);
    if (skills.length >= RESUME_LIMITS.skills) break;
  }

  const languages = input.languages
    .map((l) => ({
      id: id(l.id),
      name: str(l.name, RESUME_LIMITS.shortText),
      level: str(l.level, RESUME_LIMITS.shortText),
    }))
    .filter((l) => l.name)
    .slice(0, RESUME_LIMITS.languages);

  return { experience, education, skills, languages };
}

/** Есть ли в секциях хоть что-то заполненное. */
export function hasStructuredContent(s: ResumeSections): boolean {
  return (
    s.experience.length > 0 ||
    s.education.length > 0 ||
    s.skills.length > 0 ||
    s.languages.length > 0
  );
}

/** Свежие сверху; записи без даты начала — в конец. */
export function sortExperienceDesc(items: ResumeExperience[]): ResumeExperience[] {
  return items.slice().sort((a, b) => {
    if (!a.start && !b.start) return 0;
    if (!a.start) return 1;
    if (!b.start) return -1;
    return a.start < b.start ? 1 : a.start > b.start ? -1 : 0;
  });
}

/**
 * Период для показа: «2023-04 — 2024-06», «2023-04 — сейчас», «2023-04».
 * Подпись «сейчас» приходит из словаря экрана — модуль не знает про локали.
 */
export function formatPeriod(
  e: { start: string; end: string; current: boolean },
  presentLabel: string
): string {
  const end = e.current ? presentLabel : e.end;
  if (e.start && end) return `${e.start} — ${end}`;
  return e.start || end || "";
}

/** Пустая запись опыта для формы. */
export function blankExperience(): ResumeExperience {
  return {
    id: newEntryId(),
    position: "",
    company: "",
    employment_id: null,
    verified: false,
    start: "",
    end: "",
    current: false,
    description: "",
  };
}

/** Идентификаторы трудовых отношений, на которые ссылается резюме. */
export function linkedEmploymentIds(sections: ResumeSections): string[] {
  const ids = new Set<string>();
  for (const e of sections.experience) if (e.employment_id) ids.add(e.employment_id);
  return [...ids];
}

/**
 * Проставляет отметку «подтверждено работодателем» по списку записей, которые
 * сервер уже проверил (принадлежат человеку и оформлены не вручную). Всё
 * остальное явно сбрасывается: отметку нельзя принести с клиента.
 */
export function markVerifiedExperience(
  sections: ResumeSections,
  verifiedEmploymentIds: Iterable<string>
): ResumeSections {
  const verified = new Set(verifiedEmploymentIds);
  return {
    ...sections,
    experience: sections.experience.map((e) => ({
      ...e,
      verified: Boolean(e.employment_id) && verified.has(e.employment_id as string),
    })),
  };
}

/** Снимает отметку подтверждения со всех записей (перед записью в resumes). */
export function clearVerified(sections: ResumeSections): ResumeSections {
  return markVerifiedExperience(sections, []);
}

/** Запись резюме из трудовых отношений: даты в employments — YYYY-MM-DD. */
export function experienceFromEmployment(employment: {
  id: string;
  position: string;
  company_name: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
}): ResumeExperience {
  return {
    id: newEntryId(),
    position: employment.position ?? "",
    company: employment.company_name ?? "",
    employment_id: employment.id,
    verified: false,
    start: (employment.start_date ?? "").slice(0, 7),
    end: employment.status === "ended" ? (employment.end_date ?? "").slice(0, 7) : "",
    current: employment.status !== "ended",
    description: "",
  };
}

/** Пустая запись обучения для формы. */
export function blankEducation(): ResumeEducation {
  return { id: newEntryId(), institution: "", program: "", start: "", end: "" };
}

/** Пустая запись языка для формы. */
export function blankLanguage(): ResumeLanguage {
  return { id: newEntryId(), name: "", level: "" };
}
