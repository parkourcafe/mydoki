"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { EMPLOYMENT_TYPES, employmentTypeLabel } from "@/lib/employment";
import { createEmploymentFromApplication } from "@/app/employer/actions";

const M = {
  ru: {
    title: "Оформление сотрудника",
    hired: "Кандидат нанят. Оформите трудовые отношения — запись появится и у сотрудника в «Моих трудовых отношениях».",
    onboard: "Оформить сотрудника",
    position: "Должность",
    type: "Тип занятости",
    start: "Дата начала",
    create: "Оформить",
    cancel: "Отмена",
    already: "Сотрудник оформлен.",
    openCard: "Карточка сотрудника →",
    noAccount:
      "У кандидата нет аккаунта Doki — оформить в трудовые отношения нельзя (нужен аккаунт человека). Кандидат может зарегистрироваться и откликнуться снова.",
    error: "Не удалось оформить. Проверьте, что кандидат нанят.",
  },
  en: {
    title: "Onboard employee",
    hired: "Candidate is hired. Create the employment — it will also show up in their “My employment”.",
    onboard: "Onboard employee",
    position: "Position",
    type: "Employment type",
    start: "Start date",
    create: "Onboard",
    cancel: "Cancel",
    already: "Employee onboarded.",
    openCard: "Employee card →",
    noAccount:
      "The candidate has no Doki account — they can't be added to employment (a personal account is required). They can register and apply again.",
    error: "Couldn't onboard. Make sure the candidate is hired.",
  },
  id: {
    title: "Proses karyawan",
    hired: "Kandidat diterima. Buat hubungan kerja — juga muncul di “Hubungan kerja saya” miliknya.",
    onboard: "Proses karyawan",
    position: "Posisi",
    type: "Jenis kerja",
    start: "Tanggal mulai",
    create: "Proses",
    cancel: "Batal",
    already: "Karyawan telah diproses.",
    openCard: "Kartu karyawan →",
    noAccount:
      "Kandidat tidak punya akun Doki — tidak bisa dimasukkan ke hubungan kerja (perlu akun pribadi). Kandidat bisa daftar dan melamar lagi.",
    error: "Gagal memproses. Pastikan kandidat sudah diterima.",
  },
  uz: {
    title: "Xodimni rasmiylashtirish",
    hired: "Nomzod qabul qilindi. Mehnat munosabatlarini yarating — yozuv uning “Mehnat munosabatlarim”ida ham koʻrinadi.",
    onboard: "Xodimni rasmiylashtirish",
    position: "Lavozim",
    type: "Bandlik turi",
    start: "Boshlanish sanasi",
    create: "Rasmiylashtirish",
    cancel: "Bekor qilish",
    already: "Xodim rasmiylashtirildi.",
    openCard: "Xodim kartasi →",
    noAccount:
      "Nomzodda Doki akkaunti yoʻq — mehnat munosabatlariga qoʻshib boʻlmaydi (shaxsiy akkaunt kerak). Nomzod roʻyxatdan oʻtib, qayta ariza bera oladi.",
    error: "Rasmiylashtirib boʻlmadi. Nomzod qabul qilinganini tekshiring.",
  },
} as const;

export default function EmployeeOnboard({
  locale,
  applicationId,
  defaultPosition,
  hasAccount,
  existingEmploymentId,
}: {
  locale: Locale;
  applicationId: string;
  defaultPosition: string;
  hasAccount: boolean;
  existingEmploymentId: string | null;
}) {
  const t = M[locale];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [position, setPosition] = useState(defaultPosition);
  const [type, setType] = useState("full_time");
  const [startDate, setStartDate] = useState("");
  const [err, setErr] = useState(false);

  if (existingEmploymentId) {
    return (
      <section className="card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{t.already}</p>
        <a
          href={`/employer/employees/${existingEmploymentId}`}
          className="mt-2 inline-block text-sm text-brand-600 hover:underline"
        >
          {t.openCard}
        </a>
      </section>
    );
  }

  return (
    <section className="card space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {t.title}
      </h2>

      {!hasAccount ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {t.noAccount}
        </p>
      ) : !open ? (
        <>
          <p className="text-sm text-slate-600">{t.hired}</p>
          <button type="button" onClick={() => setOpen(true)} className="btn-primary">
            {t.onboard}
          </button>
        </>
      ) : (
        <div className="space-y-3">
          {err && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{t.error}</p>
          )}
          <div>
            <label className="label">{t.position}</label>
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">{t.type}</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input">
              {EMPLOYMENT_TYPES.map((v) => (
                <option key={v} value={v}>
                  {employmentTypeLabel(locale, v)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t.start}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending || !position.trim()}
              onClick={() =>
                start(async () => {
                  setErr(false);
                  const res = await createEmploymentFromApplication(
                    applicationId,
                    position.trim(),
                    type,
                    startDate || null
                  );
                  if ("error" in res) {
                    setErr(true);
                    return;
                  }
                  router.push(`/employer/employees/${res.id}`);
                })
              }
              className="btn-primary"
            >
              {t.create}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
