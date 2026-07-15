"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Locale } from "@/lib/i18n";
import CopyButton from "@/components/CopyButton";

const M = {
  en: {
    applyLink: "Apply link",
    qr: "Show QR",
    hideQr: "Hide QR",
    download: "Download QR",
    whatsapp: "Share on WhatsApp",
    waMsg: (title: string, company: string, url: string) =>
      `We're hiring: ${title} at ${company}. Apply here: ${url}`,
  },
  id: {
    applyLink: "Tautan lamaran",
    qr: "Tampilkan QR",
    hideQr: "Sembunyikan QR",
    download: "Unduh QR",
    whatsapp: "Bagikan di WhatsApp",
    waMsg: (title: string, company: string, url: string) =>
      `Kami sedang merekrut: ${title} di ${company}. Lamar di sini: ${url}`,
  },
  ru: {
    applyLink: "Ссылка для откликов",
    qr: "Показать QR",
    hideQr: "Скрыть QR",
    download: "Скачать QR",
    whatsapp: "Поделиться в WhatsApp",
    waMsg: (title: string, company: string, url: string) =>
      `Мы нанимаем: ${title} в ${company}. Откликнуться: ${url}`,
  },
  uz: {
    applyLink: "Ariza havolasi",
    qr: "QR ko‘rsatish",
    hideQr: "QR yashirish",
    download: "QR yuklab olish",
    whatsapp: "WhatsApp’da ulashish",
    waMsg: (title: string, company: string, url: string) =>
      `Ishga olyapmiz: ${company}da ${title}. Ariza: ${url}`,
  },
} as const;

export default function ShareBox({
  locale,
  applyUrl,
  title,
  company,
  slug,
}: {
  locale: Locale;
  applyUrl: string;
  title: string;
  company: string;
  slug: string;
}) {
  const t = M[locale];
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!showQr || qrDataUrl) return;
    QRCode.toDataURL(applyUrl, { width: 512, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [showQr, qrDataUrl, applyUrl]);

  const waHref = `https://wa.me/?text=${encodeURIComponent(
    t.waMsg(title, company, applyUrl)
  )}`;

  return (
    <div className="rounded-lg border border-[#e8e0d5] bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{t.applyLink}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded bg-slate-50 px-2 py-1 text-sm text-slate-700">
          {applyUrl}
        </code>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <CopyButton text={applyUrl} locale={locale} />
        <button type="button" className="btn-ghost" onClick={() => setShowQr((s) => !s)}>
          {showQr ? t.hideQr : t.qr}
        </button>
        <a href={waHref} target="_blank" rel="noreferrer" className="btn-ghost">
          {t.whatsapp}
        </a>
      </div>

      {showQr && (
        <div className="mt-3 flex flex-col items-center gap-2">
          {qrDataUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt={`QR ${slug}`} className="h-44 w-44" />
              <a href={qrDataUrl} download={`apply-${slug}.png`} className="btn-ghost">
                {t.download}
              </a>
            </>
          ) : (
            <div className="h-44 w-44 animate-pulse rounded bg-slate-100" />
          )}
        </div>
      )}
    </div>
  );
}
