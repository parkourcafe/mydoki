// Юнит-тесты импорта резюме: разбор ответа модели, слияние и JSON Resume.
// npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import { emptySections } from "../../lib/resume.ts";
import {
  emptyImport,
  importMonth,
  importedCounts,
  mergeImportedResume,
  parseImportedResume,
} from "../../lib/resumeImport.ts";
import { fromJsonResume, toJsonResume } from "../../lib/jsonResume.ts";

// --------------------------- разбор модели ---------------------------

test("importMonth: только однозначный год-месяц", () => {
  assert.equal(importMonth("2019-05"), "2019-05");
  assert.equal(importMonth("2019-05-17"), "2019-05"); // из JSON Resume
  assert.equal(importMonth("2019"), ""); // год без месяца не додумываем
  assert.equal(importMonth("май 2019"), "");
  assert.equal(importMonth(null), "");
});

test("parseImportedResume: мусор даёт пустой импорт", () => {
  assert.deepEqual(parseImportedResume(null), emptyImport());
  assert.deepEqual(parseImportedResume("nope"), emptyImport());
  assert.deepEqual(parseImportedResume({ experience: 42 }), emptyImport());
});

test("parseImportedResume: читает поля и записи, чинит даты", () => {
  const r = parseImportedResume({
    full_name: "  Siti  ",
    headline: "Nanny",
    experience: [
      { position: "Nanny", company: "Villa", start: "2021", end: "2023-04", description: "Care" },
    ],
    skills: ["Cooking", "cooking"],
    languages: [{ name: "English", level: "basic" }],
    unknown_key: "ignored",
  });
  assert.equal(r.full_name, "Siti");
  assert.equal(r.sections.experience[0].start, ""); // «2021» отброшено
  assert.equal(r.sections.experience[0].end, "2023-04");
  assert.deepEqual(r.sections.skills, ["Cooking"]); // дедуп
  assert.equal(r.sections.languages[0].name, "English");
});

// ------------------------------ слияние ------------------------------

const base = () => ({
  ...emptyImport(),
  full_name: "Своё имя",
  sections: {
    ...emptySections(),
    experience: [
      { id: "1", position: "Няня", company: "Вилла", start: "2023-01", end: "", current: true, description: "Дети" },
    ],
    skills: ["Готовка"],
  },
});

test("mergeImportedResume: занятые поля не затираются, пустые заполняются", () => {
  const merged = mergeImportedResume(base(), {
    ...emptyImport(),
    full_name: "Импортированное имя",
    headline: "Импортированный заголовок",
  });
  assert.equal(merged.full_name, "Своё имя");
  assert.equal(merged.headline, "Импортированный заголовок");
});

test("mergeImportedResume: дубли записей не добавляются", () => {
  const current = base();
  const merged = mergeImportedResume(current, {
    ...emptyImport(),
    sections: {
      ...emptySections(),
      // Тот же опыт (должность/место/начало) и тот же навык в другом регистре.
      experience: [
        { id: "x", position: "Няня", company: "Вилла", start: "2023-01", end: "", current: true, description: "Дубль" },
        { id: "y", position: "Повар", company: "Кафе", start: "2020-02", end: "2022-12", current: false, description: "Кухня" },
      ],
      skills: ["готовка", "Уборка"],
    },
  });
  assert.equal(merged.sections.experience.length, 2);
  assert.equal(merged.sections.experience[1].position, "Повар");
  assert.deepEqual(merged.sections.skills, ["Готовка", "Уборка"]);

  const added = importedCounts(current, merged);
  assert.equal(added.experience, 1);
  assert.equal(added.skills, 1);
});

// ---------------------------- JSON Resume ----------------------------

const profile = () => ({
  full_name: "Siti Nurhayati",
  headline: "Nanny",
  location: "Denpasar",
  contact: "+62 812",
  email: "siti@example.com",
  about: "About me",
  sections: {
    experience: [
      { id: "1", position: "Nanny", company: "Villa Bali", start: "2023-04", end: "", current: true, description: "Care for two children" },
      { id: "2", position: "Cook", company: "Cafe", start: "2021-01", end: "2023-03", current: false, description: "Kitchen" },
    ],
    education: [{ id: "e", institution: "SMK 2", program: "Tata boga", start: "2015-07", end: "2018-06" }],
    skills: ["Cooking"],
    languages: [{ id: "l", name: "English", level: "basic" }],
  },
});

test("toJsonResume: раскладывает по схеме, у текущей работы нет endDate", () => {
  const doc = toJsonResume(profile()) as Record<string, any>;
  assert.equal(doc.basics.name, "Siti Nurhayati");
  assert.equal(doc.basics.location.city, "Denpasar");
  assert.equal(doc.work.length, 2);
  assert.equal("endDate" in doc.work[0], false);
  assert.equal(doc.work[1].endDate, "2023-03");
  assert.deepEqual(doc.skills, [{ name: "Cooking" }]);
  assert.equal(doc.languages[0].language, "English");
});

test("JSON Resume: круговой рейс сохраняет содержание", () => {
  const back = fromJsonResume(toJsonResume(profile()));
  assert.equal(back.full_name, "Siti Nurhayati");
  assert.equal(back.location, "Denpasar");
  assert.equal(back.sections.experience.length, 2);
  assert.equal(back.sections.experience[0].current, true);
  assert.equal(back.sections.experience[1].end, "2023-03");
  assert.equal(back.sections.education[0].program, "Tata boga");
  assert.deepEqual(back.sections.skills, ["Cooking"]);
  assert.equal(back.sections.languages[0].level, "basic");
});

test("fromJsonResume: чужой файл с highlights и keywords", () => {
  const r = fromJsonResume({
    basics: { name: "John Doe", location: { region: "Bali" } },
    work: [
      {
        name: "Acme",
        position: "Driver",
        startDate: "2020-03-01",
        endDate: "2022-06-30",
        summary: "Drove guests",
        highlights: ["Airport runs", "Vehicle upkeep"],
      },
    ],
    skills: [{ name: "Driving", keywords: ["Manual", "Van"] }, "First aid"],
  });
  assert.equal(r.full_name, "John Doe");
  assert.equal(r.location, "Bali");
  assert.equal(r.sections.experience[0].start, "2020-03");
  assert.equal(r.sections.experience[0].current, false);
  assert.match(r.sections.experience[0].description, /Drove guests\nAirport runs\nVehicle upkeep/);
  assert.deepEqual(r.sections.skills, ["Driving", "Manual", "Van", "First aid"]);
});

test("fromJsonResume: пустой и битый вход не роняют разбор", () => {
  assert.deepEqual(fromJsonResume(null), emptyImport());
  assert.deepEqual(fromJsonResume({}), emptyImport());
  assert.deepEqual(fromJsonResume({ work: "nope", skills: 5 }), emptyImport());
});
