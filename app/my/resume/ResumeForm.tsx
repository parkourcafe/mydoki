"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { saveResume, type ResumeCustomField } from "./actions";
import {
  blankEducation,
  blankExperience,
  blankLanguage,
  emptySections,
  RESUME_LIMITS,
  type ResumeEducation,
  type ResumeExperience,
  type ResumeLanguage,
  type ResumeSections,
} from "@/lib/resume";
import { checkResume, type ResumeWarningId } from "@/lib/resumeQuality";
import {
  importedCounts,
  mergeImportedResume,
  parseImportedResume,
  type ImportedResume,
} from "@/lib/resumeImport";
import { fromJsonResume } from "@/lib/jsonResume";

export type ResumeData = {
  full_name: string | null;
  headline: string | null;
  location: string | null;
  contact: string | null;
  email: string | null;
  about: string | null;
  experience: string | null;
  custom_fields: ResumeCustomField[] | null;
  sections: ResumeSections;
};

const M = {
  ru: {
    title: "Моё резюме",
    subtitle:
      "Заполните, что считаете нужным, — все поля необязательны. Можно добавить свои пункты.",
    fullName: "Имя",
    fullNamePh: "Как к вам обращаться",
    headline: "Кто вы / чем занимаетесь",
    headlinePh: "напр. Няня, 5 лет опыта",
    location: "Город",
    locationPh: "напр. Денпасар",
    contact: "WhatsApp / телефон",
    contactPh: "+62 …",
    email: "Email",
    about: "О себе",
    aboutPh: "Пара предложений о себе и что ищете",
    readyTitle: "Готовность профиля",
    importTitle: "Импорт",
    importHint:
      "Загрузите старое CV — заполним профиль автоматически. Ничего не затрём: пустые поля заполним, новые записи добавим.",
    importCv: "Заполнить из файла CV",
    importJson: "Импорт JSON Resume",
    exportJson: "Скачать JSON Resume",
    importBusy: "Разбираю файл…",
    importOk: "Готово. Проверьте, что получилось, и сохраните.",
    importNothing: "В файле не нашлось того, чего ещё нет в профиле.",
    importFailed: "Не удалось разобрать файл.",
    importSettings: "Настройки распознавания",
    readyAllGood: "Всё заполнено — профиль готов.",
    expTitle: "Опыт работы",
    expHint:
      "Каждое место работы — отдельная запись: так работодатель видит вашу историю, а не абзац текста.",
    addExp: "＋ Добавить место работы",
    position: "Должность",
    positionPh: "напр. Няня",
    company: "Где",
    companyPh: "напр. семья в Убуде, вилла, кафе",
    start: "Начало",
    end: "Окончание",
    currentJob: "Работаю здесь сейчас",
    verified: "✓ Подтверждено работодателем",
    verifiedHint:
      "Должность, место и период взяты из оформления у работодателя — здесь они не редактируются.",
    unlink: "Открепить",
    duties: "Обязанности",
    dutiesPh: "Что входило в вашу работу",
    legacyTitle: "Опыт одним текстом",
    legacyHint:
      "Старая запись. Перенесите её в места работы выше — и можно очистить это поле.",
    eduTitle: "Обучение",
    addEdu: "＋ Добавить обучение",
    institution: "Где учились",
    institutionPh: "напр. SMK 2 Денпасар, курсы",
    program: "Специальность / курс",
    programPh: "напр. кулинария",
    skillsTitle: "Навыки",
    skillsHint: "Короткими пунктами: готовка, уборка, вождение, уход за детьми.",
    skillPh: "Навык",
    addSkill: "Добавить",
    langsTitle: "Языки",
    addLang: "＋ Добавить язык",
    langNamePh: "Язык (напр. английский)",
    langLevelPh: "Уровень (напр. базовый)",
    customTitle: "Свои поля",
    customHint:
      "Добавьте, чего не хватает: Instagram, портфолио, готовность к переезду и т.п.",
    addField: "＋ Добавить своё поле",
    fieldLabelPh: "Название (напр. Instagram)",
    fieldValuePh: "Значение (напр. @my.profile)",
    remove: "Удалить",
    entry: "Запись",
    save: "Сохранить резюме",
    downloadPdf: "Скачать CV (PDF)",
    saving: "Сохраняю…",
    saved: "Сохранено ✓",
    failed: "Не удалось сохранить. Попробуйте ещё раз.",
  },
  en: {
    title: "My resume",
    subtitle:
      "Fill in what you like — every field is optional. You can add your own fields.",
    fullName: "Name",
    fullNamePh: "How to address you",
    headline: "Who you are / what you do",
    headlinePh: "e.g. Nanny, 5 years' experience",
    location: "City",
    locationPh: "e.g. Denpasar",
    contact: "WhatsApp / phone",
    contactPh: "+62 …",
    email: "Email",
    about: "About you",
    aboutPh: "A couple of sentences about you and what you're looking for",
    readyTitle: "Profile readiness",
    importTitle: "Import",
    importHint:
      "Upload your old CV and we'll fill the profile in. Nothing is overwritten: empty fields get filled, new entries get added.",
    importCv: "Fill in from a CV file",
    importJson: "Import JSON Resume",
    exportJson: "Download JSON Resume",
    importBusy: "Reading the file…",
    importOk: "Done. Check the result and save.",
    importNothing: "The file had nothing your profile doesn't already have.",
    importFailed: "Couldn't read the file.",
    importSettings: "Recognition settings",
    readyAllGood: "Everything is filled in — your profile is ready.",
    expTitle: "Work experience",
    expHint:
      "One entry per job: an employer then sees your history instead of a paragraph of text.",
    addExp: "＋ Add a job",
    position: "Role",
    positionPh: "e.g. Nanny",
    company: "Where",
    companyPh: "e.g. a family in Ubud, a villa, a cafe",
    start: "Start",
    end: "End",
    currentJob: "I work here now",
    verified: "✓ Verified by the employer",
    verifiedHint:
      "Role, place and period come from the employer's record — they aren't edited here.",
    unlink: "Unlink",
    duties: "Duties",
    dutiesPh: "What your work involved",
    legacyTitle: "Experience as plain text",
    legacyHint:
      "Your older note. Move it into the jobs above — then you can clear this field.",
    eduTitle: "Education",
    addEdu: "＋ Add education",
    institution: "Where you studied",
    institutionPh: "e.g. SMK 2 Denpasar, a course",
    program: "Subject / course",
    programPh: "e.g. cooking",
    skillsTitle: "Skills",
    skillsHint: "Short items: cooking, cleaning, driving, childcare.",
    skillPh: "Skill",
    addSkill: "Add",
    langsTitle: "Languages",
    addLang: "＋ Add a language",
    langNamePh: "Language (e.g. English)",
    langLevelPh: "Level (e.g. basic)",
    customTitle: "Your own fields",
    customHint:
      "Add what's missing: Instagram, portfolio, willing to relocate, etc.",
    addField: "＋ Add your own field",
    fieldLabelPh: "Label (e.g. Instagram)",
    fieldValuePh: "Value (e.g. @my.profile)",
    remove: "Remove",
    entry: "Entry",
    save: "Save resume",
    downloadPdf: "Download CV (PDF)",
    saving: "Saving…",
    saved: "Saved ✓",
    failed: "Couldn't save. Please try again.",
  },
  id: {
    title: "Resume saya",
    subtitle:
      "Isi sesuka Anda — semua kolom opsional. Anda bisa menambah kolom sendiri.",
    fullName: "Nama",
    fullNamePh: "Cara memanggil Anda",
    headline: "Siapa Anda / bidang Anda",
    headlinePh: "mis. Pengasuh, pengalaman 5 tahun",
    location: "Kota",
    locationPh: "mis. Denpasar",
    contact: "WhatsApp / telepon",
    contactPh: "+62 …",
    email: "Email",
    about: "Tentang Anda",
    aboutPh: "Beberapa kalimat tentang Anda dan yang Anda cari",
    readyTitle: "Kesiapan profil",
    importTitle: "Impor",
    importHint:
      "Unggah resume lama Anda — profil akan terisi otomatis. Tidak ada yang ditimpa: kolom kosong diisi, entri baru ditambahkan.",
    importCv: "Isi dari berkas CV",
    importJson: "Impor JSON Resume",
    exportJson: "Unduh JSON Resume",
    importBusy: "Membaca berkas…",
    importOk: "Selesai. Periksa hasilnya lalu simpan.",
    importNothing: "Tidak ada hal baru di berkas itu untuk profil Anda.",
    importFailed: "Gagal membaca berkas.",
    importSettings: "Pengaturan pengenalan",
    readyAllGood: "Semua terisi — profil Anda siap.",
    expTitle: "Pengalaman kerja",
    expHint:
      "Satu entri untuk satu tempat kerja: pemberi kerja melihat riwayat Anda, bukan satu paragraf.",
    addExp: "＋ Tambah tempat kerja",
    position: "Posisi",
    positionPh: "mis. Pengasuh",
    company: "Di mana",
    companyPh: "mis. keluarga di Ubud, vila, kafe",
    start: "Mulai",
    end: "Selesai",
    currentJob: "Saya masih bekerja di sini",
    verified: "✓ Terverifikasi oleh pemberi kerja",
    verifiedHint:
      "Posisi, tempat dan masa kerja berasal dari catatan pemberi kerja — tidak diubah di sini.",
    unlink: "Lepaskan",
    duties: "Tugas",
    dutiesPh: "Apa saja pekerjaan Anda",
    legacyTitle: "Pengalaman dalam bentuk teks",
    legacyHint:
      "Catatan lama Anda. Pindahkan ke daftar tempat kerja di atas — lalu kolom ini bisa dikosongkan.",
    eduTitle: "Pendidikan",
    addEdu: "＋ Tambah pendidikan",
    institution: "Tempat belajar",
    institutionPh: "mis. SMK 2 Denpasar, kursus",
    program: "Jurusan / kursus",
    programPh: "mis. tata boga",
    skillsTitle: "Keterampilan",
    skillsHint: "Poin singkat: memasak, bersih-bersih, menyetir, mengasuh anak.",
    skillPh: "Keterampilan",
    addSkill: "Tambah",
    langsTitle: "Bahasa",
    addLang: "＋ Tambah bahasa",
    langNamePh: "Bahasa (mis. Inggris)",
    langLevelPh: "Tingkat (mis. dasar)",
    customTitle: "Kolom sendiri",
    customHint:
      "Tambahkan yang kurang: Instagram, portofolio, siap pindah, dll.",
    addField: "＋ Tambah kolom sendiri",
    fieldLabelPh: "Label (mis. Instagram)",
    fieldValuePh: "Isi (mis. @my.profile)",
    remove: "Hapus",
    entry: "Entri",
    save: "Simpan resume",
    downloadPdf: "Unduh CV (PDF)",
    saving: "Menyimpan…",
    saved: "Tersimpan ✓",
    failed: "Gagal menyimpan. Coba lagi.",
  },
  uz: {
    title: "Mening rezyumem",
    subtitle:
      "Xohlaganingizni to‘ldiring — barcha maydonlar ixtiyoriy. O‘z maydonlaringizni qo‘shsangiz bo‘ladi.",
    fullName: "Ism",
    fullNamePh: "Sizga qanday murojaat qilaylik",
    headline: "Kimsiz / nima bilan shug‘ullanasiz",
    headlinePh: "mas. Enaga, 5 yillik tajriba",
    location: "Shahar",
    locationPh: "mas. Denpasar",
    contact: "WhatsApp / telefon",
    contactPh: "+62 …",
    email: "Email",
    about: "O‘zingiz haqingizda",
    aboutPh: "O‘zingiz va nima izlayotganingiz haqida bir necha gap",
    readyTitle: "Profil tayyorligi",
    importTitle: "Import",
    importHint:
      "Eski CV faylingizni yuklang — profil avtomatik to‘ldiriladi. Hech narsa o‘chirilmaydi: bo‘sh maydonlar to‘ldiriladi, yangi yozuvlar qo‘shiladi.",
    importCv: "CV faylidan to‘ldirish",
    importJson: "JSON Resume importi",
    exportJson: "JSON Resume yuklab olish",
    importBusy: "Fayl o‘qilmoqda…",
    importOk: "Tayyor. Natijani tekshiring va saqlang.",
    importNothing: "Faylda profilingizda hali yo‘q narsa topilmadi.",
    importFailed: "Faylni o‘qib bo‘lmadi.",
    importSettings: "Aniqlash sozlamalari",
    readyAllGood: "Hammasi to‘ldirilgan — profilingiz tayyor.",
    expTitle: "Ish tajribasi",
    expHint:
      "Har bir ish joyi — alohida yozuv: ish beruvchi matn emas, tarixingizni ko‘radi.",
    addExp: "＋ Ish joyini qo‘shish",
    position: "Lavozim",
    positionPh: "mas. Enaga",
    company: "Qayerda",
    companyPh: "mas. Ubuddagi oila, villa, kafe",
    start: "Boshlanishi",
    end: "Tugashi",
    currentJob: "Hozir shu yerda ishlayman",
    verified: "✓ Ish beruvchi tasdiqlagan",
    verifiedHint:
      "Lavozim, joy va davr ish beruvchi yozuvidan olingan — bu yerda tahrirlanmaydi.",
    unlink: "Uzish",
    duties: "Vazifalar",
    dutiesPh: "Ishingiz nimalardan iborat edi",
    legacyTitle: "Tajriba matn ko‘rinishida",
    legacyHint:
      "Eski yozuv. Uni yuqoridagi ish joylariga ko‘chiring — keyin bu maydonni tozalash mumkin.",
    eduTitle: "Ta’lim",
    addEdu: "＋ Ta’lim qo‘shish",
    institution: "Qayerda o‘qigansiz",
    institutionPh: "mas. SMK 2 Denpasar, kurslar",
    program: "Yo‘nalish / kurs",
    programPh: "mas. oshpazlik",
    skillsTitle: "Ko‘nikmalar",
    skillsHint: "Qisqa bandlar: ovqat pishirish, tozalash, haydash, bolaga qarash.",
    skillPh: "Ko‘nikma",
    addSkill: "Qo‘shish",
    langsTitle: "Tillar",
    addLang: "＋ Til qo‘shish",
    langNamePh: "Til (mas. ingliz)",
    langLevelPh: "Daraja (mas. boshlang‘ich)",
    customTitle: "O‘z maydonlaringiz",
    customHint:
      "Yetishmaganini qo‘shing: Instagram, portfolio, ko‘chishga tayyorlik va h.k.",
    addField: "＋ O‘z maydonini qo‘shish",
    fieldLabelPh: "Nomi (mas. Instagram)",
    fieldValuePh: "Qiymati (mas. @my.profile)",
    remove: "O‘chirish",
    entry: "Yozuv",
    save: "Rezyumeni saqlash",
    downloadPdf: "CV yuklab olish (PDF)",
    saving: "Saqlanmoqda…",
    saved: "Saqlandi ✓",
    failed: "Saqlab bo‘lmadi. Yana urinib ko‘ring.",
  },
} as const;

/** Что делать по каждому замечанию. Коды приходят из lib/resumeQuality. */
const W: Record<Locale, Record<ResumeWarningId, string>> = {
  ru: {
    no_name: "Укажите имя",
    no_contact: "Добавьте WhatsApp или email",
    no_headline: "Напишите, кто вы по профессии",
    no_location: "Укажите город",
    no_experience: "Добавьте хотя бы одно место работы",
    legacy_experience_text: "Перенесите опыт из текста в отдельные места работы",
    no_period: "Нет даты начала",
    reversed_period: "Период заканчивается раньше, чем начинается",
    future_period: "Период начинается в будущем",
    no_role_description: "Опишите обязанности",
    no_skills: "Добавьте навыки",
    no_languages: "Добавьте языки",
  },
  en: {
    no_name: "Add your name",
    no_contact: "Add a WhatsApp number or an email",
    no_headline: "Say what you do",
    no_location: "Add your city",
    no_experience: "Add at least one job",
    legacy_experience_text: "Move your experience from the text into separate jobs",
    no_period: "No start date",
    reversed_period: "The period ends before it starts",
    future_period: "The period starts in the future",
    no_role_description: "Describe the duties",
    no_skills: "Add your skills",
    no_languages: "Add the languages you speak",
  },
  id: {
    no_name: "Isi nama Anda",
    no_contact: "Tambahkan WhatsApp atau email",
    no_headline: "Tulis profesi Anda",
    no_location: "Isi kota Anda",
    no_experience: "Tambahkan setidaknya satu tempat kerja",
    legacy_experience_text: "Pindahkan pengalaman dari teks ke tempat kerja terpisah",
    no_period: "Tanggal mulai kosong",
    reversed_period: "Periode berakhir sebelum dimulai",
    future_period: "Periode dimulai di masa depan",
    no_role_description: "Jelaskan tugas Anda",
    no_skills: "Tambahkan keterampilan",
    no_languages: "Tambahkan bahasa yang Anda kuasai",
  },
  uz: {
    no_name: "Ismingizni kiriting",
    no_contact: "WhatsApp yoki email qo‘shing",
    no_headline: "Kasbingizni yozing",
    no_location: "Shahringizni kiriting",
    no_experience: "Kamida bitta ish joyini qo‘shing",
    legacy_experience_text: "Tajribani matndan alohida ish joylariga ko‘chiring",
    no_period: "Boshlanish sanasi yo‘q",
    reversed_period: "Davr boshlanishidan oldin tugaydi",
    future_period: "Davr kelajakda boshlanadi",
    no_role_description: "Vazifalarni yozing",
    no_skills: "Ko‘nikmalarni qo‘shing",
    no_languages: "Bilgan tillaringizni qo‘shing",
  },
};

const SEVERITY_CLS = {
  error: "text-red-600",
  warning: "text-amber-700",
  info: "text-slate-500",
} as const;

export default function ResumeForm({
  locale,
  initial,
  defaultEmail,
}: {
  locale: Locale;
  initial: ResumeData | null;
  defaultEmail: string;
}) {
  const t = M[locale];
  const w = W[locale];

  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [email, setEmail] = useState(initial?.email ?? defaultEmail ?? "");
  const [about, setAbout] = useState(initial?.about ?? "");
  const [experience, setExperience] = useState(initial?.experience ?? "");
  const [custom, setCustom] = useState<ResumeCustomField[]>(
    initial?.custom_fields?.length ? initial.custom_fields : [],
  );
  const [sections, setSections] = useState<ResumeSections>(
    initial?.sections ?? emptySections(),
  );
  const [skillDraft, setSkillDraft] = useState("");

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [importBusy, setImportBusy] = useState(false);
  const [importNote, setImportNote] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  // Самая частая причина отказа — распознавание выключено в настройках;
  // только в этом случае показываем ссылку туда.
  const [importNeedsSettings, setImportNeedsSettings] = useState(false);

  // Дата нужна только для замечания «период в будущем»; берём один раз.
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  const quality = useMemo(
    () =>
      checkResume(
        {
          full_name: fullName,
          headline,
          location,
          contact,
          email,
          legacyExperience: experience,
          sections,
        },
        today,
      ),
    [fullName, headline, location, contact, email, experience, sections, today],
  );

  // --- импорт ---
  function currentProfile(): ImportedResume {
    return { full_name: fullName, headline, location, contact, email, about, sections };
  }

  /** Кладёт разобранный профиль поверх текущего: пустое заполняем, записи добавляем. */
  function applyImport(imported: ImportedResume) {
    const before = currentProfile();
    const merged = mergeImportedResume(before, imported);

    setFullName(merged.full_name);
    setHeadline(merged.headline);
    setLocation(merged.location);
    setContact(merged.contact);
    setEmail(merged.email);
    setAbout(merged.about);
    setSections(merged.sections);

    const added = importedCounts(before, merged);
    const basicsChanged = (
      [
        [before.full_name, merged.full_name],
        [before.headline, merged.headline],
        [before.location, merged.location],
        [before.contact, merged.contact],
        [before.email, merged.email],
        [before.about, merged.about],
      ] as [string, string][]
    ).some(([was, now]) => was !== now);

    const anythingNew =
      basicsChanged ||
      added.experience + added.education + added.skills + added.languages > 0;
    setImportNote(anythingNew ? t.importOk : t.importNothing);
  }

  function resetImportState() {
    setImportNote(null);
    setImportError(null);
    setImportNeedsSettings(false);
  }

  /** Старое CV файлом: разбирает провайдер на сервере (нужно согласие на ИИ). */
  async function onCvFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // чтобы тот же файл можно было выбрать повторно
    if (!file) return;

    resetImportState();
    setImportBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/resume-parse", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | Record<string, unknown>
        | null;
      if (!res.ok) {
        const message =
          data && typeof (data as { error?: string }).error === "string"
            ? (data as { error: string }).error
            : t.importFailed;
        setImportError(message);
        setImportNeedsSettings(res.status === 403);
        return;
      }
      applyImport(parseImportedResume(data));
    } catch {
      setImportError(t.importFailed);
    } finally {
      setImportBusy(false);
    }
  }

  /** JSON Resume: открытый формат, разбираем прямо в браузере — без сервера. */
  async function onJsonFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    resetImportState();
    try {
      applyImport(fromJsonResume(JSON.parse(await file.text())));
    } catch {
      setImportError(t.importFailed);
    }
  }

  // --- места работы ---
  const addExperience = () =>
    setSections((s) =>
      s.experience.length >= RESUME_LIMITS.experience
        ? s
        : { ...s, experience: [...s.experience, blankExperience()] },
    );
  const updateExperience = (i: number, patch: Partial<ResumeExperience>) =>
    setSections((s) => ({
      ...s,
      experience: s.experience.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    }));
  /** Открепить строку от трудовых отношений: дальше это обычная запись. */
  const unlinkExperience = (i: number) =>
    setSections((s) => ({
      ...s,
      experience: s.experience.map((e, idx) =>
        idx === i ? { ...e, employment_id: null, verified: false } : e
      ),
    }));
  const removeExperience = (i: number) =>
    setSections((s) => ({
      ...s,
      experience: s.experience.filter((_, idx) => idx !== i),
    }));

  // --- обучение ---
  const addEducation = () =>
    setSections((s) =>
      s.education.length >= RESUME_LIMITS.education
        ? s
        : { ...s, education: [...s.education, blankEducation()] },
    );
  const updateEducation = (i: number, patch: Partial<ResumeEducation>) =>
    setSections((s) => ({
      ...s,
      education: s.education.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    }));
  const removeEducation = (i: number) =>
    setSections((s) => ({
      ...s,
      education: s.education.filter((_, idx) => idx !== i),
    }));

  // --- навыки ---
  function addSkill() {
    const value = skillDraft.trim();
    if (!value) return;
    setSections((s) =>
      s.skills.length >= RESUME_LIMITS.skills ||
      s.skills.some((x) => x.toLowerCase() === value.toLowerCase())
        ? s
        : { ...s, skills: [...s.skills, value] },
    );
    setSkillDraft("");
  }
  const removeSkill = (i: number) =>
    setSections((s) => ({ ...s, skills: s.skills.filter((_, idx) => idx !== i) }));

  // --- языки ---
  const addLanguage = () =>
    setSections((s) =>
      s.languages.length >= RESUME_LIMITS.languages
        ? s
        : { ...s, languages: [...s.languages, blankLanguage()] },
    );
  const updateLanguage = (i: number, patch: Partial<ResumeLanguage>) =>
    setSections((s) => ({
      ...s,
      languages: s.languages.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    }));
  const removeLanguage = (i: number) =>
    setSections((s) => ({
      ...s,
      languages: s.languages.filter((_, idx) => idx !== i),
    }));

  // --- свои поля ---
  const addField = () => setCustom((c) => [...c, { label: "", value: "" }]);
  const updateField = (i: number, patch: Partial<ResumeCustomField>) =>
    setCustom((c) => c.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const removeField = (i: number) =>
    setCustom((c) => c.filter((_, idx) => idx !== i));

  async function onSave() {
    setBusy(true);
    setError(null);
    setDone(false);
    const res = await saveResume({
      full_name: fullName,
      headline,
      location,
      contact,
      email,
      about,
      experience,
      custom_fields: custom,
      sections,
    });
    setBusy(false);
    if ("error" in res) {
      setError(t.failed);
    } else {
      setDone(true);
      // Прячем «Сохранено ✓» через пару секунд, чтобы не мозолило глаз.
      setTimeout(() => setDone(false), 2500);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      <div className="space-y-4">
        {/* Импорт: заполнить профиль из готового файла */}
        <div className="card space-y-3">
          <div>
            <h2 className="font-medium">{t.importTitle}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{t.importHint}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className={`btn-ghost ${importBusy ? "opacity-60" : "cursor-pointer"}`}>
              {importBusy ? t.importBusy : t.importCv}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                disabled={importBusy}
                onChange={onCvFile}
              />
            </label>
            <label className="btn-ghost cursor-pointer">
              {t.importJson}
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={onJsonFile}
              />
            </label>
            <a href="/my/resume/json" className="btn-ghost">
              {t.exportJson}
            </a>
          </div>
          {importNote && <p className="text-sm text-green-600">{importNote}</p>}
          {importError && (
            <p className="text-sm text-red-600">
              {importError}
              {importNeedsSettings && (
                <>
                  {" "}
                  <a href="/my/security" className="underline">
                    {t.importSettings}
                  </a>
                </>
              )}
            </p>
          )}
        </div>

        {/* Готовность профиля — считается на лету, ничего не блокирует */}
        <div className="card space-y-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-medium">{t.readyTitle}</h2>
            <span className="text-sm text-slate-500">
              {quality.checksPassed}/{quality.checksTotal}
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={quality.completeness}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${quality.completeness}%` }}
            />
          </div>
          {quality.warnings.length === 0 ? (
            <p className="text-sm text-green-600">{t.readyAllGood}</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {quality.warnings.map((warning, i) => (
                <li key={`${warning.id}-${warning.index ?? "x"}-${i}`} className={SEVERITY_CLS[warning.severity]}>
                  {w[warning.id]}
                  {warning.index !== undefined && (
                    <span className="text-slate-400">
                      {" "}
                      · {t.entry} {warning.index + 1}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t.fullName}</label>
              <input
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fullNamePh}
              />
            </div>
            <div>
              <label className="label">{t.headline}</label>
              <input
                className="input"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder={t.headlinePh}
              />
            </div>
            <div>
              <label className="label">{t.location}</label>
              <input
                className="input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.locationPh}
              />
            </div>
            <div>
              <label className="label">{t.contact}</label>
              <input
                className="input"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t.contactPh}
                inputMode="tel"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">{t.email}</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
              />
            </div>
          </div>

          <div>
            <label className="label">{t.about}</label>
            <textarea
              className="input min-h-[80px]"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder={t.aboutPh}
            />
          </div>
        </div>

        {/* Опыт работы: по одной записи на место работы */}
        <div className="card space-y-3">
          <div>
            <h2 className="font-medium">{t.expTitle}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{t.expHint}</p>
          </div>

          {sections.experience.length > 0 && (
            <ul className="space-y-3">
              {sections.experience.map((e, i) => (
                <li key={e.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      {t.entry} {i + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {e.verified && (
                        <button
                          type="button"
                          onClick={() => unlinkExperience(i)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
                        >
                          {t.unlink}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExperience(i)}
                        aria-label={t.remove}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Подтверждённая строка приходит из оформления у работодателя:
                      её факты не редактируем, иначе отметка перестанет быть правдой. */}
                  {e.verified && (
                    <div className="mb-2 rounded-lg bg-green-50 px-3 py-2">
                      <p className="text-xs font-medium text-green-700">{t.verified}</p>
                      <p className="mt-0.5 text-xs text-green-800/70">{t.verifiedHint}</p>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label">{t.position}</label>
                      <input
                        className="input"
                        value={e.position}
                        disabled={e.verified}
                        onChange={(ev) => updateExperience(i, { position: ev.target.value })}
                        placeholder={t.positionPh}
                      />
                    </div>
                    <div>
                      <label className="label">{t.company}</label>
                      <input
                        className="input"
                        value={e.company}
                        disabled={e.verified}
                        onChange={(ev) => updateExperience(i, { company: ev.target.value })}
                        placeholder={t.companyPh}
                      />
                    </div>
                    <div>
                      <label className="label">{t.start}</label>
                      <input
                        className="input"
                        type="month"
                        value={e.start}
                        disabled={e.verified}
                        onChange={(ev) => updateExperience(i, { start: ev.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">{t.end}</label>
                      <input
                        className="input"
                        type="month"
                        value={e.end}
                        disabled={e.current || e.verified}
                        onChange={(ev) => updateExperience(i, { end: ev.target.value })}
                      />
                    </div>
                  </div>
                  <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={e.current}
                      disabled={e.verified}
                      onChange={(ev) =>
                        updateExperience(i, {
                          current: ev.target.checked,
                          ...(ev.target.checked ? { end: "" } : null),
                        })
                      }
                    />
                    {t.currentJob}
                  </label>
                  <div className="mt-2">
                    <label className="label">{t.duties}</label>
                    <textarea
                      className="input min-h-[70px]"
                      value={e.description}
                      onChange={(ev) => updateExperience(i, { description: ev.target.value })}
                      placeholder={t.dutiesPh}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {sections.experience.length < RESUME_LIMITS.experience && (
            <button type="button" onClick={addExperience} className="btn-ghost">
              {t.addExp}
            </button>
          )}
        </div>

        {/* Старое текстовое поле показываем, только если в нём что-то есть */}
        {experience.trim().length > 0 && (
          <div className="card space-y-2">
            <div>
              <h2 className="font-medium">{t.legacyTitle}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{t.legacyHint}</p>
            </div>
            <textarea
              className="input min-h-[100px]"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
          </div>
        )}

        {/* Обучение */}
        <div className="card space-y-3">
          <h2 className="font-medium">{t.eduTitle}</h2>

          {sections.education.length > 0 && (
            <ul className="space-y-3">
              {sections.education.map((e, i) => (
                <li key={e.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      {t.entry} {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEducation(i)}
                      aria-label={t.remove}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label">{t.institution}</label>
                      <input
                        className="input"
                        value={e.institution}
                        onChange={(ev) => updateEducation(i, { institution: ev.target.value })}
                        placeholder={t.institutionPh}
                      />
                    </div>
                    <div>
                      <label className="label">{t.program}</label>
                      <input
                        className="input"
                        value={e.program}
                        onChange={(ev) => updateEducation(i, { program: ev.target.value })}
                        placeholder={t.programPh}
                      />
                    </div>
                    <div>
                      <label className="label">{t.start}</label>
                      <input
                        className="input"
                        type="month"
                        value={e.start}
                        onChange={(ev) => updateEducation(i, { start: ev.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">{t.end}</label>
                      <input
                        className="input"
                        type="month"
                        value={e.end}
                        onChange={(ev) => updateEducation(i, { end: ev.target.value })}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {sections.education.length < RESUME_LIMITS.education && (
            <button type="button" onClick={addEducation} className="btn-ghost">
              {t.addEdu}
            </button>
          )}
        </div>

        {/* Навыки */}
        <div className="card space-y-3">
          <div>
            <h2 className="font-medium">{t.skillsTitle}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{t.skillsHint}</p>
          </div>

          {sections.skills.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {sections.skills.map((s, i) => (
                <li
                  key={`${s}-${i}`}
                  className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(i)}
                    aria-label={t.remove}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {sections.skills.length < RESUME_LIMITS.skills && (
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={skillDraft}
                onChange={(e) => setSkillDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder={t.skillPh}
              />
              <button type="button" onClick={addSkill} className="btn-ghost shrink-0">
                {t.addSkill}
              </button>
            </div>
          )}
        </div>

        {/* Языки */}
        <div className="card space-y-3">
          <h2 className="font-medium">{t.langsTitle}</h2>

          {sections.languages.length > 0 && (
            <ul className="space-y-2">
              {sections.languages.map((l, i) => (
                <li key={l.id} className="flex flex-col gap-2 sm:flex-row">
                  <input
                    className="input sm:flex-1"
                    value={l.name}
                    onChange={(e) => updateLanguage(i, { name: e.target.value })}
                    placeholder={t.langNamePh}
                  />
                  <input
                    className="input sm:w-1/3"
                    value={l.level}
                    onChange={(e) => updateLanguage(i, { level: e.target.value })}
                    placeholder={t.langLevelPh}
                  />
                  <button
                    type="button"
                    onClick={() => removeLanguage(i)}
                    aria-label={t.remove}
                    className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {sections.languages.length < RESUME_LIMITS.languages && (
            <button type="button" onClick={addLanguage} className="btn-ghost">
              {t.addLang}
            </button>
          )}
        </div>

        {/* Свои поля */}
        <div className="card space-y-3">
          <div>
            <h2 className="font-medium">{t.customTitle}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{t.customHint}</p>
          </div>

          {custom.length > 0 && (
            <ul className="space-y-2">
              {custom.map((f, i) => (
                <li key={i} className="flex flex-col gap-2 sm:flex-row">
                  <input
                    className="input sm:w-1/3"
                    value={f.label}
                    onChange={(e) => updateField(i, { label: e.target.value })}
                    placeholder={t.fieldLabelPh}
                  />
                  <input
                    className="input sm:flex-1"
                    value={f.value}
                    onChange={(e) => updateField(i, { value: e.target.value })}
                    placeholder={t.fieldValuePh}
                  />
                  <button
                    type="button"
                    onClick={() => removeField(i)}
                    aria-label={t.remove}
                    className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button type="button" onClick={addField} className="btn-ghost">
            {t.addField}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className="btn-primary"
          >
            {busy ? t.saving : t.save}
          </button>
          {/* Скачивание берёт последнюю СОХРАНЁННУЮ версию — обычная ссылка,
              чтобы работал и «сохранить как» в мобильном браузере. */}
          <a href="/my/resume/pdf" className="btn-ghost">
            {t.downloadPdf}
          </a>
          {done && (
            <span className="text-sm font-medium text-green-600">{t.saved}</span>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  );
}
