"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import {
  createEmploymentVerification,
  revokeEmploymentVerification,
} from "@/app/my/actions";

const M = {
  ru: {
    title: "Подтверждение занятости",
    intro: "Создайте ссылку — третья сторона подтвердит факт и период вашей работы (компания, должность, период, статус). Оплата, причины и оценки не показываются. Ссылку можно отозвать.",
    create: "Создать ссылку",
    link: "Ссылка для проверки",
    copy: "Копировать",
    copied: "Скопировано",
    revoke: "Отозвать ссылку",
    err: "Не удалось. Возможно, запись добавлена вручную и не может быть подтверждена.",
  },
  en: {
    title: "Employment verification",
    intro: "Create a link so a third party can confirm the fact and period of your employment (company, position, period, status). Compensation, reasons and evaluations are not shown. You can revoke the link.",
    create: "Create link",
    link: "Verification link",
    copy: "Copy",
    copied: "Copied",
    revoke: "Revoke link",
    err: "Failed. The record may be self-added and can't be verified.",
  },
  id: {
    title: "Verifikasi kerja",
    intro: "Buat tautan agar pihak ketiga bisa mengonfirmasi fakta dan periode kerja Anda (perusahaan, posisi, periode, status). Kompensasi, alasan, dan penilaian tidak ditampilkan. Tautan bisa dicabut.",
    create: "Buat tautan",
    link: "Tautan verifikasi",
    copy: "Salin",
    copied: "Tersalin",
    revoke: "Cabut tautan",
    err: "Gagal. Catatan mungkin ditambah manual dan tidak bisa diverifikasi.",
  },
  uz: {
    title: "Bandlikni tasdiqlash",
    intro: "Havola yarating — uchinchi tomon ish faktingiz va davringizni tasdiqlaydi (kompaniya, lavozim, davr, holat). To‘lov, sabab va baholar ko‘rsatilmaydi. Havolani qaytarib olish mumkin.",
    create: "Havola yaratish",
    link: "Tasdiqlash havolasi",
    copy: "Nusxa olish",
    copied: "Nusxa olindi",
    revoke: "Havolani qaytarib olish",
    err: "Bo‘lmadi. Yozuv qo‘lda qo‘shilgan bo‘lishi va tasdiqlanmasligi mumkin.",
  },
} as const;

export default function VerificationBox({
  locale,
  employmentId,
  activeToken,
}: {
  locale: Locale;
  employmentId: string;
  activeToken: string | null;
}) {
  const t = M[locale];
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState(false);
  const [copied, setCopied] = useState(false);

  const link = activeToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${activeToken}`
    : "";

  return (
    <section className="card space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t.title}</h2>
      <p className="text-xs text-slate-400">{t.intro}</p>
      {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{t.err}</p>}

      {activeToken ? (
        <div className="space-y-2">
          <label className="label">{t.link}</label>
          <div className="flex gap-2">
            <input readOnly value={link} className="input" onFocus={(e) => e.currentTarget.select()} />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(link).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              }}
              className="btn-ghost shrink-0"
            >
              {copied ? t.copied : t.copy}
            </button>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await revokeEmploymentVerification(employmentId);
                router.refresh();
              })
            }
            className="btn-danger"
          >
            {t.revoke}
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setErr(false);
            start(async () => {
              const res = await createEmploymentVerification(employmentId);
              if ("error" in res) { setErr(true); return; }
              router.refresh();
            });
          }}
          className="btn-primary"
        >
          {t.create}
        </button>
      )}
    </section>
  );
}
