"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { saveResume, type ResumeCustomField } from "./actions";

export type ResumeData = {
  full_name: string | null;
  headline: string | null;
  location: string | null;
  contact: string | null;
  email: string | null;
  about: string | null;
  experience: string | null;
  custom_fields: ResumeCustomField[] | null;
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
    experience: "Опыт работы",
    experiencePh: "Где и кем работали, ключевые обязанности",
    customTitle: "Свои поля",
    customHint:
      "Добавьте, чего не хватает: Instagram, портфолио, языки, готовность к переезду и т.п.",
    addField: "＋ Добавить своё поле",
    fieldLabelPh: "Название (напр. Instagram)",
    fieldValuePh: "Значение (напр. @my.profile)",
    remove: "Удалить",
    save: "Сохранить резюме",
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
    experience: "Work experience",
    experiencePh: "Where and as what you worked, key duties",
    customTitle: "Your own fields",
    customHint:
      "Add what's missing: Instagram, portfolio, languages, willing to relocate, etc.",
    addField: "＋ Add your own field",
    fieldLabelPh: "Label (e.g. Instagram)",
    fieldValuePh: "Value (e.g. @my.profile)",
    remove: "Remove",
    save: "Save resume",
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
    experience: "Pengalaman kerja",
    experiencePh: "Di mana dan sebagai apa, tugas utama",
    customTitle: "Kolom sendiri",
    customHint:
      "Tambahkan yang kurang: Instagram, portofolio, bahasa, siap pindah, dll.",
    addField: "＋ Tambah kolom sendiri",
    fieldLabelPh: "Label (mis. Instagram)",
    fieldValuePh: "Isi (mis. @my.profile)",
    remove: "Hapus",
    save: "Simpan resume",
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
    experience: "Ish tajribasi",
    experiencePh: "Qayerda va kim bo‘lib ishlagansiz, asosiy vazifalar",
    customTitle: "O‘z maydonlaringiz",
    customHint:
      "Yetishmaganini qo‘shing: Instagram, portfolio, tillar, ko‘chishga tayyorlik va h.k.",
    addField: "＋ O‘z maydonini qo‘shish",
    fieldLabelPh: "Nomi (mas. Instagram)",
    fieldValuePh: "Qiymati (mas. @my.profile)",
    remove: "O‘chirish",
    save: "Rezyumeni saqlash",
    saving: "Saqlanmoqda…",
    saved: "Saqlandi ✓",
    failed: "Saqlab bo‘lmadi. Yana urinib ko‘ring.",
  },
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

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addField() {
    setCustom((c) => [...c, { label: "", value: "" }]);
  }
  function updateField(i: number, patch: Partial<ResumeCustomField>) {
    setCustom((c) => c.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }
  function removeField(i: number) {
    setCustom((c) => c.filter((_, idx) => idx !== i));
  }

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

          <div>
            <label className="label">{t.experience}</label>
            <textarea
              className="input min-h-[100px]"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder={t.experiencePh}
            />
          </div>
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
          {done && (
            <span className="text-sm font-medium text-green-600">{t.saved}</span>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  );
}
