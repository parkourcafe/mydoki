// Юнит-тесты структурного резюме и его проверки качества. npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  parseSections,
  normalizeSections,
  emptySections,
  hasStructuredContent,
  sortExperienceDesc,
  formatPeriod,
  isMonth,
  RESUME_LIMITS,
  type ResumeExperience,
} from "../../lib/resume.ts";
import { checkResume } from "../../lib/resumeQuality.ts";

const TODAY = "2026-08-24";

const exp = (o: Partial<ResumeExperience>): ResumeExperience => ({
  id: "x",
  position: "Nanny",
  company: "Villa Bali",
  start: "2023-01",
  end: "",
  current: true,
  description: "Care for two children",
  ...o,
});

// ----------------------------- lib/resume ----------------------------

test("isMonth: только YYYY-MM", () => {
  assert.equal(isMonth("2023-01"), true);
  assert.equal(isMonth("2023-12"), true);
  assert.equal(isMonth("2023-13"), false);
  assert.equal(isMonth("2023-1"), false);
  assert.equal(isMonth("2023"), false);
  assert.equal(isMonth(""), false);
});

test("parseSections: мусор и отсутствие данных дают пустые секции", () => {
  assert.deepEqual(parseSections(null), emptySections());
  assert.deepEqual(parseSections("nope"), emptySections());
  assert.deepEqual(parseSections({}), emptySections());
  assert.deepEqual(parseSections({ experience: "not-an-array" }), emptySections());
});

test("parseSections: читает записи, чинит даты и проставляет id", () => {
  const s = parseSections({
    experience: [
      { position: "  Driver  ", company: "Hotel", start: "2022-3", end: "2023-05" },
    ],
  });
  assert.equal(s.experience.length, 1);
  assert.equal(s.experience[0].position, "Driver");
  assert.equal(s.experience[0].start, ""); // «2022-3» не YYYY-MM → отброшено
  assert.equal(s.experience[0].end, "2023-05");
  assert.ok(s.experience[0].id.length > 0);
});

test("normalizeSections: выбрасывает пустые записи", () => {
  const s = normalizeSections({
    ...emptySections(),
    experience: [
      exp({}),
      { id: "y", position: "", company: "", start: "", end: "", current: false, description: "" },
    ],
    education: [{ id: "e", institution: "", program: "", start: "", end: "" }],
    languages: [{ id: "l", name: "", level: "native" }],
  });
  assert.equal(s.experience.length, 1);
  assert.equal(s.education.length, 0);
  assert.equal(s.languages.length, 0); // язык без названия смысла не имеет
});

test("normalizeSections: у текущего места работы конец периода снимается", () => {
  const s = normalizeSections({
    ...emptySections(),
    experience: [exp({ current: true, end: "2024-01" })],
  });
  assert.equal(s.experience[0].end, "");
});

test("normalizeSections: навыки дедуплицируются без учёта регистра", () => {
  const s = normalizeSections({
    ...emptySections(),
    skills: ["Cooking", "cooking", " COOKING ", "Driving", ""],
  });
  assert.deepEqual(s.skills, ["Cooking", "Driving"]);
});

test("normalizeSections: соблюдает потолки количества", () => {
  const many = Array.from({ length: RESUME_LIMITS.experience + 5 }, (_, i) =>
    exp({ id: `e${i}`, position: `Role ${i}` })
  );
  const s = normalizeSections({ ...emptySections(), experience: many });
  assert.equal(s.experience.length, RESUME_LIMITS.experience);
});

test("hasStructuredContent / sortExperienceDesc / formatPeriod", () => {
  assert.equal(hasStructuredContent(emptySections()), false);
  assert.equal(
    hasStructuredContent({ ...emptySections(), skills: ["Cooking"] }),
    true
  );

  const sorted = sortExperienceDesc([
    exp({ id: "a", start: "2020-01" }),
    exp({ id: "b", start: "" }),
    exp({ id: "c", start: "2024-01" }),
  ]);
  assert.deepEqual(sorted.map((e) => e.id), ["c", "a", "b"]);

  assert.equal(formatPeriod({ start: "2023-01", end: "", current: true }, "сейчас"), "2023-01 — сейчас");
  assert.equal(formatPeriod({ start: "2023-01", end: "2024-02", current: false }, "сейчас"), "2023-01 — 2024-02");
  assert.equal(formatPeriod({ start: "2023-01", end: "", current: false }, "сейчас"), "2023-01");
  assert.equal(formatPeriod({ start: "", end: "", current: false }, "сейчас"), "");
});

// -------------------------- lib/resumeQuality ------------------------

const ids = (r: ReturnType<typeof checkResume>) => r.warnings.map((w) => w.id);

test("checkResume: пустое резюме — честный ноль наполнения", () => {
  const r = checkResume({ sections: emptySections() }, TODAY);
  assert.equal(r.completeness, 0);
  assert.equal(r.checksPassed, 0);
  assert.ok(ids(r).includes("no_name"));
  assert.ok(ids(r).includes("no_contact"));
  assert.ok(ids(r).includes("no_experience"));
});

test("checkResume: заполненное резюме — сто процентов и без замечаний", () => {
  const r = checkResume(
    {
      full_name: "Siti",
      headline: "Nanny, 5 years",
      location: "Denpasar",
      contact: "+62 812 000 000",
      sections: {
        experience: [exp({})],
        education: [{ id: "e", institution: "SMA 1", program: "", start: "2015-07", end: "2018-06" }],
        skills: ["Cooking"],
        languages: [{ id: "l", name: "English", level: "basic" }],
      },
    },
    TODAY
  );
  assert.equal(r.completeness, 100);
  assert.deepEqual(r.warnings, []);
});

test("checkResume: email вместо WhatsApp тоже считается контактом", () => {
  const withEmail = checkResume(
    { email: "a@b.co", sections: emptySections() },
    TODAY
  );
  assert.equal(ids(withEmail).includes("no_contact"), false);
});

test("checkResume: старый текстовый опыт не считается пропажей, но подсвечивается", () => {
  const r = checkResume(
    { legacyExperience: "Работала няней в Убуде", sections: emptySections() },
    TODAY
  );
  assert.equal(ids(r).includes("no_experience"), false);
  assert.ok(ids(r).includes("legacy_experience_text"));
});

test("checkResume: перевёрнутый и будущий период, пустой период и описание", () => {
  const r = checkResume(
    {
      sections: {
        ...emptySections(),
        experience: [
          exp({ id: "a", start: "2024-05", end: "2023-01", current: false }),
          exp({ id: "b", start: "2027-01" }),
          exp({ id: "c", start: "", description: "" }),
        ],
      },
    },
    TODAY
  );
  const list = r.warnings;
  assert.ok(list.some((w) => w.id === "reversed_period" && w.index === 0));
  assert.ok(list.some((w) => w.id === "future_period" && w.index === 1));
  assert.ok(list.some((w) => w.id === "no_period" && w.index === 2));
  assert.ok(list.some((w) => w.id === "no_role_description" && w.index === 2));
  // Ошибки идут первыми.
  assert.equal(list[0].severity, "error");
});

test("checkResume: у текущего места работы пустой конец периода — не ошибка", () => {
  const r = checkResume(
    { sections: { ...emptySections(), experience: [exp({ current: true, end: "" })] } },
    TODAY
  );
  assert.equal(ids(r).includes("reversed_period"), false);
});
