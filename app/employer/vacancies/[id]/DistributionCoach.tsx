"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { Locale } from "@/lib/i18n";

const M = {
  en: {
    coachTitle: "No applications yet — let's get the word out",
    coachHint: "Share this link. Candidates apply in 2 minutes, no signup.",
    shareTitle: "Share",
    wa: "Send via WhatsApp",
    copy: "Copy link",
    copied: "Copied",
    qrShow: "Show QR",
    qrHide: "Hide QR",
    qrDownload: "Download QR",
    ig: "Instagram",
    igHint: "paste as a link in your story",
    whereTitle: "Where to send it",
    wStatus: "WhatsApp Status",
    wGroups: "Staff & community groups",
    wStories: "Instagram stories",
    wQr: "Printed QR at the venue",
    views: (n: number) => `${n} view${n === 1 ? "" : "s"}. Applications will appear here.`,
    waMsg: (title: string, company: string, loc: string, url: string) =>
      `We're hiring: ${title} at ${company}${loc ? `, ${loc}` : ""}. Apply in 2 minutes, no signup: ${url}`,
  },
  id: {
    coachTitle: "Belum ada lamaran — ayo sebarkan",
    coachHint: "Bagikan tautan ini. Kandidat melamar dalam 2 menit, tanpa daftar akun.",
    shareTitle: "Bagikan",
    wa: "Kirim via WhatsApp",
    copy: "Salin tautan",
    copied: "Tersalin",
    qrShow: "Tampilkan QR",
    qrHide: "Sembunyikan QR",
    qrDownload: "Unduh QR",
    ig: "Instagram",
    igHint: "tempel sebagai tautan di story",
    whereTitle: "Ke mana menyebarkannya",
    wStatus: "Status WhatsApp",
    wGroups: "Grup staf & komunitas",
    wStories: "Story Instagram",
    wQr: "QR cetak di lokasi",
    views: (n: number) => `${n} kali dilihat. Lamaran akan muncul di sini.`,
    waMsg: (title: string, company: string, loc: string, url: string) =>
      `Kami sedang mencari ${title} di ${company}${loc ? ` (${loc})` : ""}. Lamar cepat, tanpa daftar akun: ${url}`,
  },
  ru: {
    coachTitle: "Откликов пока нет — давайте расскажем о вакансии",
    coachHint: "Поделитесь ссылкой. Кандидаты откликаются за 2 минуты, без регистрации.",
    shareTitle: "Поделиться",
    wa: "Отправить в WhatsApp",
    copy: "Скопировать ссылку",
    copied: "Скопировано",
    qrShow: "Показать QR",
    qrHide: "Скрыть QR",
    qrDownload: "Скачать QR",
    ig: "Instagram",
    igHint: "вставьте в сторис как ссылку",
    whereTitle: "Куда отправить",
    wStatus: "Статус в WhatsApp",
    wGroups: "Рабочие и городские чаты",
    wStories: "Сторис в Instagram",
    wQr: "Печатный QR на точке",
    views: (n: number) => `Просмотров: ${n}. Отклики появятся здесь.`,
    waMsg: (title: string, company: string, loc: string, url: string) =>
      `Мы нанимаем: ${title} в ${company}${loc ? ` (${loc})` : ""}. Откликнуться за 2 минуты, без регистрации: ${url}`,
  },
  uz: {
    coachTitle: "Hali ariza yo‘q — keling, e’lon qilamiz",
    coachHint: "Havolani ulashing. Nomzodlar 2 daqiqada, ro‘yxatdan o‘tmasdan ariza beradi.",
    shareTitle: "Ulashish",
    wa: "WhatsApp orqali yuborish",
    copy: "Havolani nusxalash",
    copied: "Nusxalandi",
    qrShow: "QR ko‘rsatish",
    qrHide: "QR yashirish",
    qrDownload: "QR yuklab olish",
    ig: "Instagram",
    igHint: "story’ga havola sifatida joylang",
    whereTitle: "Qayerga yuborish",
    wStatus: "WhatsApp Status",
    wGroups: "Xodimlar va jamiyat guruhlari",
    wStories: "Instagram story",
    wQr: "Joyda bosilgan QR",
    views: (n: number) => `${n} marta ko‘rildi. Arizalar shu yerda paydo bo‘ladi.`,
    waMsg: (title: string, company: string, loc: string, url: string) =>
      `Ishga olyapmiz: ${company}da ${title}${loc ? ` (${loc})` : ""}. 2 daqiqada, ro‘yxatdan o‘tmasdan: ${url}`,
  },
} as const;

function withSrc(url: string, src: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}src=${src}`;
}

export default function DistributionCoach({
  locale,
  applyUrl,
  title,
  company,
  location,
  slug,
  viewsCount,
  compact = false,
}: {
  locale: Locale;
  applyUrl: string;
  title: string;
  company: string;
  location: string | null;
  slug: string;
  viewsCount: number;
  compact?: boolean;
}) {
  const t = M[locale];
  const [open, setOpen] = useState(!compact);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const waHref = `https://wa.me/?text=${encodeURIComponent(
    t.waMsg(title, company, location ?? "", withSrc(applyUrl, "wa"))
  )}`;

  useEffect(() => {
    if (!showQr || qrDataUrl) return;
    QRCode.toDataURL(withSrc(applyUrl, "qr"), { width: 512, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [showQr, qrDataUrl, applyUrl]);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard заблокирован — молча */
    }
  }

  // Печатный QR: QR + заголовок + короткий URL на белом фоне (canvas → PNG).
  async function downloadQr() {
    const data = await QRCode.toDataURL(withSrc(applyUrl, "qr"), { width: 1024, margin: 2 });
    const shortUrl = applyUrl.replace(/^https?:\/\//, "");
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1024, 1024);
      ctx.textAlign = "center";
      ctx.fillStyle = "#241c17";
      ctx.font = "bold 46px system-ui, -apple-system, sans-serif";
      const ttl = title.length > 34 ? title.slice(0, 33) + "…" : title;
      ctx.fillText(ttl, 512, 1096);
      ctx.fillStyle = "#8f4126";
      ctx.font = "32px system-ui, -apple-system, sans-serif";
      ctx.fillText(shortUrl, 512, 1150);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `apply-${slug}.png`;
      a.click();
    };
    img.src = data;
  }

  const actions = (
    <>
      <div className="flex flex-wrap gap-2">
        <a href={waHref} target="_blank" rel="noreferrer" className="btn-primary">
          💬 {t.wa}
        </a>
        <button type="button" onClick={() => copy(withSrc(applyUrl, "link"), "link")} className="btn-ghost">
          {copied === "link" ? `✓ ${t.copied}` : `🔗 ${t.copy}`}
        </button>
        <button type="button" onClick={() => setShowQr((s) => !s)} className="btn-ghost">
          {showQr ? t.qrHide : `▦ ${t.qrShow}`}
        </button>
        <button type="button" onClick={() => copy(withSrc(applyUrl, "ig"), "ig")} className="btn-ghost">
          {copied === "ig" ? `✓ ${t.copied}` : `📸 ${t.ig}`}
        </button>
      </div>
      {copied === "ig" && <p className="mt-1 text-xs text-slate-500">{t.igHint}</p>}

      {showQr && (
        <div className="mt-3 flex flex-col items-center gap-2">
          {qrDataUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt={`QR ${slug}`} className="h-44 w-44" />
              <button type="button" onClick={downloadQr} className="btn-ghost">
                ⤓ {t.qrDownload}
              </button>
            </>
          ) : (
            <div className="h-44 w-44 animate-pulse rounded bg-slate-100" />
          )}
        </div>
      )}
    </>
  );

  // Компактный режим (есть отклики): кнопка «Поделиться» → поповер.
  if (compact) {
    return (
      <div className="relative">
        <button type="button" onClick={() => setOpen((o) => !o)} className="btn-ghost">
          🔗 {t.shareTitle}
        </button>
        {open && (
          <div className="absolute right-0 z-20 mt-2 w-[min(92vw,26rem)] rounded-xl border border-[#e8e0d5] bg-white p-4 shadow-lg">
            {actions}
          </div>
        )}
      </div>
    );
  }

  // Полный coach (0 откликов).
  const checklist: { label: string; src: string }[] = [
    { label: t.wStatus, src: "wa" },
    { label: t.wGroups, src: "wa" },
    { label: t.wStories, src: "ig" },
    { label: t.wQr, src: "qr" },
  ];

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">{t.coachTitle}</h2>
      <p className="mt-1 text-sm text-slate-500">{t.coachHint}</p>

      <div className="mt-4">{actions}</div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t.whereTitle}
        </p>
        <ul className="space-y-1.5">
          {checklist.map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="text-brand-500">•</span>
                {row.label}
              </span>
              <button
                type="button"
                onClick={() => copy(withSrc(applyUrl, row.src), `w-${row.label}`)}
                className="shrink-0 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
              >
                {copied === `w-${row.label}` ? `✓ ${t.copied}` : t.copy}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 rounded-lg bg-[#fdfaf5] px-3 py-2 text-sm text-slate-500">
        👁 {t.views(viewsCount)}
      </p>
    </div>
  );
}
