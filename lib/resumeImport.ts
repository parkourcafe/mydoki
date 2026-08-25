// =====================================================================
// Импорт резюме из внешнего источника (старый файл CV, разобранный моделью,
// или выгрузка в формате JSON Resume) в нашу структуру.
//
// Модуль чистый: без сети и без server-only. Разбор ответа модели и слияние
// с тем, что человек уже заполнил, — это правила продукта, а не запрос к
// провайдеру, поэтому они живут отдельно и покрыты тестами.
//
// Главное правило слияния: импорт НИЧЕГО не затирает. Заполняем только
// пустые поля и добавляем только те записи, которых ещё нет.
// =====================================================================

import {
  emptySections,
  isMonth,
  newEntryId,
  normalizeSections,
  RESUME_LIMITS,
  type ResumeSections,
} from "./resume.ts";

export type ImportedResume = {
  full_name: string;
  headline: string;
  location: string;
  contact: string;
  email: string;
  about: string;
  sections: ResumeSections;
};

export function emptyImport(): ImportedResume {
  return {
    full_name: "",
    headline: "",
    location: "",
    contact: "",
    email: "",
    about: "",
    sections: emptySections(),
  };
}

function text(value: unknown, max: number = RESUME_LIMITS.shortText): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Период из внешнего источника. Берём только то, что однозначно читается как
 * год-месяц: «2019» без месяца превращать в «2019-01» нельзя — это выдуманная
 * точность. Незаполненный период потом подсветит проверка качества.
 */
export function importMonth(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  // JSON Resume допускает YYYY-MM-DD — месяц из него берём как есть.
  const head = raw.slice(0, 7);
  return isMonth(head) ? head : "";
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Ответ модели → наша структура. Терпимо к пропущенным полям и лишним ключам,
 * ничего не бросает: то, что не разобралось, просто не попадает в результат.
 */
export function parseImportedResume(raw: unknown): ImportedResume {
  if (!raw || typeof raw !== "object") return emptyImport();
  const o = raw as Record<string, unknown>;

  const sections = normalizeSections({
    experience: list(o.experience).map((item) => {
      const x = (item ?? {}) as Record<string, unknown>;
      return {
        id: newEntryId(),
        position: text(x.position),
        company: text(x.company),
        // Импорт — всегда самодекларация: связи с трудовыми отношениями
        // внутри doki у чужого файла быть не может.
        employment_id: null,
        verified: false,
        start: importMonth(x.start),
        end: importMonth(x.end),
        current: x.current === true,
        description: text(x.description, RESUME_LIMITS.description),
      };
    }),
    education: list(o.education).map((item) => {
      const x = (item ?? {}) as Record<string, unknown>;
      return {
        id: newEntryId(),
        institution: text(x.institution),
        program: text(x.program),
        start: importMonth(x.start),
        end: importMonth(x.end),
      };
    }),
    skills: list(o.skills).map((s) => text(s)),
    languages: list(o.languages).map((item) => {
      const x = (item ?? {}) as Record<string, unknown>;
      return { id: newEntryId(), name: text(x.name), level: text(x.level) };
    }),
  });

  return {
    full_name: text(o.full_name),
    headline: text(o.headline),
    location: text(o.location),
    contact: text(o.contact),
    email: text(o.email),
    about: text(o.about, RESUME_LIMITS.description),
    sections,
  };
}

const key = (parts: (string | undefined)[]) =>
  parts.map((p) => (p ?? "").trim().toLowerCase()).join("|");

/**
 * Слияние импорта с текущим состоянием формы: пустые поля заполняем, занятые
 * не трогаем, записи добавляем только новые. Человек всегда остаётся хозяином
 * того, что уже написал своими руками.
 */
export function mergeImportedResume(
  current: ImportedResume,
  imported: ImportedResume
): ImportedResume {
  const fill = (mine: string, theirs: string) => (mine.trim() ? mine : theirs);

  const haveExperience = new Set(
    current.sections.experience.map((e) => key([e.position, e.company, e.start]))
  );
  const haveEducation = new Set(
    current.sections.education.map((e) => key([e.institution, e.program, e.start]))
  );
  const haveSkills = new Set(current.sections.skills.map((s) => s.toLowerCase()));
  const haveLanguages = new Set(
    current.sections.languages.map((l) => l.name.toLowerCase())
  );

  return {
    full_name: fill(current.full_name, imported.full_name),
    headline: fill(current.headline, imported.headline),
    location: fill(current.location, imported.location),
    contact: fill(current.contact, imported.contact),
    email: fill(current.email, imported.email),
    about: fill(current.about, imported.about),
    sections: normalizeSections({
      experience: [
        ...current.sections.experience,
        ...imported.sections.experience.filter(
          (e) => !haveExperience.has(key([e.position, e.company, e.start]))
        ),
      ],
      education: [
        ...current.sections.education,
        ...imported.sections.education.filter(
          (e) => !haveEducation.has(key([e.institution, e.program, e.start]))
        ),
      ],
      skills: [
        ...current.sections.skills,
        ...imported.sections.skills.filter((s) => !haveSkills.has(s.toLowerCase())),
      ],
      languages: [
        ...current.sections.languages,
        ...imported.sections.languages.filter(
          (l) => !haveLanguages.has(l.name.toLowerCase())
        ),
      ],
    }),
  };
}

/** Сколько записей реально добавил импорт — для честного сообщения человеку. */
export function importedCounts(
  before: ImportedResume,
  after: ImportedResume
): { experience: number; education: number; skills: number; languages: number } {
  return {
    experience: after.sections.experience.length - before.sections.experience.length,
    education: after.sections.education.length - before.sections.education.length,
    skills: after.sections.skills.length - before.sections.skills.length,
    languages: after.sections.languages.length - before.sections.languages.length,
  };
}
