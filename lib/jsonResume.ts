// =====================================================================
// JSON Resume (jsonresume.org) — открытый формат резюме.
//
// Зачем: «экспорт без привязки» должен быть проверяемым в обе стороны.
// Человек может забрать своё резюме и открыть его в другом сервисе, а может
// принести оттуда готовое — не переписывая руками.
//
// Модуль чистый: и выгрузка, и разбор — обычные функции без сети.
// =====================================================================

import { formatPeriod, type ResumeSections } from "./resume.ts";
import { emptyImport, importMonth, parseImportedResume, type ImportedResume } from "./resumeImport.ts";

/** Профиль в том виде, в каком он живёт в форме и в таблице resumes. */
export type ResumeProfile = ImportedResume;

type JsonRecord = Record<string, unknown>;

const val = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** Наш профиль → JSON Resume. Пустые секции не выводим — файл должен читаться. */
export function toJsonResume(profile: ResumeProfile): JsonRecord {
  const { sections } = profile;

  const doc: JsonRecord = {
    // Версия схемы, на которую мы ориентируемся.
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: profile.full_name,
      label: profile.headline,
      email: profile.email,
      phone: profile.contact,
      summary: profile.about,
      location: { city: profile.location },
    },
  };

  if (sections.experience.length) {
    doc.work = sections.experience.map((e) => ({
      name: e.company,
      position: e.position,
      startDate: e.start,
      // «Работаю сейчас» в JSON Resume выражается отсутствием endDate.
      ...(e.current ? {} : { endDate: e.end }),
      summary: e.description,
    }));
  }
  if (sections.education.length) {
    doc.education = sections.education.map((e) => ({
      institution: e.institution,
      area: e.program,
      startDate: e.start,
      endDate: e.end,
    }));
  }
  if (sections.skills.length) {
    doc.skills = sections.skills.map((name) => ({ name }));
  }
  if (sections.languages.length) {
    doc.languages = sections.languages.map((l) => ({
      language: l.name,
      fluency: l.level,
    }));
  }

  return doc;
}

const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/**
 * JSON Resume → наш профиль. Терпимо к неполным и чужим файлам: неизвестные
 * ключи игнорируются, кривые даты отбрасываются, ничего не бросается.
 */
export function fromJsonResume(raw: unknown): ResumeProfile {
  if (!raw || typeof raw !== "object") return emptyImport();
  const o = raw as JsonRecord;
  const basics = (o.basics ?? {}) as JsonRecord;
  const location = (basics.location ?? {}) as JsonRecord;

  // Переиспользуем разбор импорта: он уже нормализует и режет по потолкам.
  const mapped = parseImportedResume({
    full_name: val(basics.name),
    headline: val(basics.label),
    location: val(location.city) || val(location.region) || val(location.address),
    contact: val(basics.phone),
    email: val(basics.email),
    about: val(basics.summary),
    experience: list(o.work).map((item) => {
      const w = (item ?? {}) as JsonRecord;
      const end = importMonth(w.endDate);
      const highlights = list(w.highlights).map(val).filter(Boolean);
      const summary = val(w.summary);
      return {
        position: val(w.position),
        company: val(w.name) || val(w.company),
        start: importMonth(w.startDate),
        end,
        // Нет даты окончания при заполненном начале — значит, работа текущая.
        current: !end && Boolean(importMonth(w.startDate)),
        description: [summary, ...highlights].filter(Boolean).join("\n"),
      };
    }),
    education: list(o.education).map((item) => {
      const e = (item ?? {}) as JsonRecord;
      return {
        institution: val(e.institution),
        program: [val(e.studyType), val(e.area)].filter(Boolean).join(", "),
        start: importMonth(e.startDate),
        end: importMonth(e.endDate),
      };
    }),
    // Навык может прийти и объектом с keywords, и просто строкой.
    skills: list(o.skills).flatMap((item) => {
      if (typeof item === "string") return [item];
      const s = (item ?? {}) as JsonRecord;
      return [val(s.name), ...list(s.keywords).map(val)].filter(Boolean);
    }),
    languages: list(o.languages).map((item) => {
      const l = (item ?? {}) as JsonRecord;
      return { name: val(l.language), level: val(l.fluency) };
    }),
  });

  return mapped;
}

/** Человекочитаемая сводка периода — для подтверждения импорта в интерфейсе. */
export function describeSections(sections: ResumeSections, presentLabel: string): string[] {
  return sections.experience.map((e) =>
    [e.position, e.company, formatPeriod(e, presentLabel)].filter(Boolean).join(" · ")
  );
}
