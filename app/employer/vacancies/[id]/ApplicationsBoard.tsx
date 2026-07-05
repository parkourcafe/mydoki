"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  timeAgo,
  waLink,
  type ApplicationStatus,
  type RequiredDocument,
} from "@/lib/career";
import {
  setApplicationStatus,
  signApplicationDoc,
  signApplicationVideo,
} from "@/app/employer/actions";
import { track } from "@/lib/analytics";

export type BoardDoc = { type: string; label: string; file_name: string; path: string };
export type BoardAnswer = { question: string; answer: string; type: string };
export type BoardApp = {
  id: string;
  full_name: string;
  whatsapp: string;
  email: string | null;
  status: ApplicationStatus;
  created_at: string;
  documents: BoardDoc[];
  answers: BoardAnswer[];
};

type Filter = "all" | "new" | "complete" | "missing";

const M = {
  en: {
    total: "Total", new: "New", shortlisted: "Shortlisted", rejected: "Rejected", hired: "Hired",
    fAll: "All", fNew: "New", fComplete: "All docs complete", fMissing: "Missing docs",
    empty: "No applications match this filter yet.",
    shortlist: "Shortlist", reject: "Reject", whatsapp: "WhatsApp", markHired: "Mark as hired",
    requestDoc: "Request doc", soon: "Coming soon",
    reqDocMsg: (list: string) =>
      list
        ? `Hello! Your application is missing some documents: ${list}. Could you please send them in reply to this message?`
        : `Hello! Could you please send the remaining documents for your application?`,
    stNew: "New", stViewed: "Viewed", stShortlisted: "Shortlisted", stRejected: "Rejected", stHired: "Hired",
    answersNone: "No answers", docsNone: "No documents required",
  },
  id: {
    total: "Total", new: "Baru", shortlisted: "Terpilih", rejected: "Ditolak", hired: "Diterima",
    fAll: "Semua", fNew: "Baru", fComplete: "Dokumen lengkap", fMissing: "Dokumen kurang",
    empty: "Belum ada lamaran yang cocok dengan filter ini.",
    shortlist: "Pilih", reject: "Tolak", whatsapp: "WhatsApp", markHired: "Tandai diterima",
    requestDoc: "Minta dokumen", soon: "Segera hadir",
    reqDocMsg: (list: string) =>
      list
        ? `Halo! Lamaran Anda kurang beberapa dokumen: ${list}. Boleh dikirim sebagai balasan pesan ini?`
        : `Halo! Boleh kirimkan dokumen yang tersisa untuk lamaran Anda?`,
    stNew: "Baru", stViewed: "Dilihat", stShortlisted: "Terpilih", stRejected: "Ditolak", stHired: "Diterima",
    answersNone: "Tidak ada jawaban", docsNone: "Tidak ada dokumen wajib",
  },
  ru: {
    total: "Всего", new: "Новые", shortlisted: "Отобраны", rejected: "Отклонены", hired: "Приняты",
    fAll: "Все", fNew: "Новые", fComplete: "Все документы", fMissing: "Не хватает",
    empty: "Пока нет откликов под этот фильтр.",
    shortlist: "В шортлист", reject: "Отклонить", whatsapp: "WhatsApp", markHired: "Принят на работу",
    requestDoc: "Запросить док.", soon: "Скоро",
    reqDocMsg: (list: string) =>
      list
        ? `Здравствуйте! По вашему отклику не хватает документов: ${list}. Пришлите их, пожалуйста, в ответ на это сообщение.`
        : `Здравствуйте! Пришлите, пожалуйста, недостающие документы по вашему отклику.`,
    stNew: "Новый", stViewed: "Просмотрен", stShortlisted: "Отобран", stRejected: "Отклонён", stHired: "Принят",
    answersNone: "Нет ответов", docsNone: "Документы не требуются",
  },
  uz: {
    total: "Jami", new: "Yangi", shortlisted: "Tanlangan", rejected: "Rad etilgan", hired: "Qabul qilingan",
    fAll: "Barchasi", fNew: "Yangi", fComplete: "Hujjatlar to‘liq", fMissing: "Hujjat yetishmaydi",
    empty: "Bu filtrga mos ariza yo‘q.",
    shortlist: "Tanlash", reject: "Rad etish", whatsapp: "WhatsApp", markHired: "Ishga qabul qilindi",
    requestDoc: "Hujjat so‘rash", soon: "Tez orada",
    reqDocMsg: (list: string) =>
      list
        ? `Assalomu alaykum! Arizangizda ba'zi hujjatlar yetishmaydi: ${list}. Iltimos, shu xabarga javoban yuboring.`
        : `Assalomu alaykum! Iltimos, arizangiz uchun qolgan hujjatlarni yuboring.`,
    stNew: "Yangi", stViewed: "Ko‘rilgan", stShortlisted: "Tanlangan", stRejected: "Rad etilgan", stHired: "Qabul qilingan",
    answersNone: "Javoblar yo‘q", docsNone: "Hujjat talab qilinmaydi",
  },
} as const;

function StatusBadge({ status, t }: { status: ApplicationStatus; t: (typeof M)[Locale] }) {
  const map: Record<ApplicationStatus, { label: string; cls: string }> = {
    new: { label: t.stNew, cls: "bg-blue-100 text-blue-700" },
    viewed: { label: t.stViewed, cls: "bg-slate-100 text-slate-600" },
    shortlisted: { label: t.stShortlisted, cls: "bg-green-100 text-green-700" },
    rejected: { label: t.stRejected, cls: "bg-red-100 text-red-700" },
    hired: { label: t.stHired, cls: "bg-emerald-600 text-white" },
  };
  const s = map[status];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

function VideoIntro({ path, label }: { path: string; label: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function load() {
    setLoading(true);
    const u = await signApplicationVideo(path);
    setLoading(false);
    setUrl(u);
  }
  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <p className="mb-1 text-xs text-slate-400">🎥 {label}</p>
      {url ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={url} controls playsInline className="w-full rounded-lg bg-black" />
      ) : (
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="btn border border-brand-200 bg-brand-50 text-brand-700 disabled:opacity-50"
        >
          {loading ? "…" : "▶ Video"}
        </button>
      )}
    </div>
  );
}

async function openDoc(path: string) {
  // Открываем вкладку синхронно (иначе блокировщик), затем ставим URL.
  const w = window.open("", "_blank");
  const url = await signApplicationDoc(path);
  if (url && w) w.location.href = url;
  else if (w) w.close();
}

export default function ApplicationsBoard({
  locale,
  vacancyId,
  requiredDocs,
  initialApplications,
}: {
  locale: Locale;
  vacancyId: string;
  requiredDocs: RequiredDocument[];
  initialApplications: BoardApp[];
}) {
  const t = M[locale];
  const [apps, setApps] = useState<BoardApp[]>(initialApplications);
  const [filter, setFilter] = useState<Filter>("all");
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const requiredOnly = requiredDocs.filter((d) => d.required);

  const hasType = (app: BoardApp, type: string) =>
    app.documents.some((d) => d.type === type);
  const isComplete = (app: BoardApp) => requiredOnly.every((d) => hasType(app, d.type));

  const stats = useMemo(() => {
    let nw = 0, sl = 0, rj = 0, hd = 0;
    for (const a of apps) {
      if (a.status === "shortlisted") sl++;
      else if (a.status === "rejected") rj++;
      else if (a.status === "hired") hd++;
      else nw++; // new + viewed = ещё не решено
    }
    return { total: apps.length, nw, sl, rj, hd };
  }, [apps]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "new":
        return apps.filter((a) => a.status === "new" || a.status === "viewed");
      case "complete":
        return apps.filter((a) => isComplete(a));
      case "missing":
        return apps.filter((a) => !isComplete(a));
      default:
        return apps;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps, filter]);

  async function changeStatus(id: string, status: ApplicationStatus) {
    const prev = apps;
    setApps((p) => p.map((a) => (a.id === id ? { ...a, status } : a)));
    setPending((p) => ({ ...p, [id]: true }));
    try {
      await setApplicationStatus(id, vacancyId, status);
      track("application_status_changed", { to: status, vacancy_id: vacancyId });
    } catch {
      setApps(prev); // откат при ошибке
    } finally {
      setPending((p) => ({ ...p, [id]: false }));
    }
  }

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t.fAll },
    { key: "new", label: t.fNew },
    { key: "complete", label: t.fComplete },
    { key: "missing", label: t.fMissing },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {[
          { label: t.total, value: stats.total },
          { label: t.new, value: stats.nw },
          { label: t.shortlisted, value: stats.sl },
          { label: t.hired, value: stats.hd },
          { label: t.rejected, value: stats.rj },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-[#e8e0d5] bg-[#fdfaf5] p-3 text-center">
            <div className="text-xl font-semibold">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={
              (filter === f.key
                ? "bg-brand-500 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100") +
              " min-h-[36px] rounded-lg px-3 text-sm font-medium"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          {t.empty}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((a) => (
            <li key={a.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">{a.full_name}</p>
                  <p className="text-xs text-slate-400">{timeAgo(a.created_at, locale)}</p>
                </div>
                <StatusBadge status={a.status} t={t} />
              </div>

              {/* Document checklist */}
              {requiredDocs.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {requiredDocs.map((d, i) => {
                    const uploaded = a.documents.find((x) => x.type === d.type);
                    return (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        {uploaded ? (
                          <span className="text-green-600">✅</span>
                        ) : (
                          <span className="text-red-500">❌</span>
                        )}
                        {uploaded ? (
                          <button
                            type="button"
                            onClick={() => openDoc(uploaded.path)}
                            className="text-brand-600 hover:underline"
                          >
                            {d.label}
                          </button>
                        ) : (
                          <span className="text-slate-500">
                            {d.label}
                            {!d.required && " ·"}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Answers */}
              {a.answers.length > 0 && (
                <dl className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                  {a.answers.map((ans, i) => (
                    <div key={i}>
                      <dt className="text-xs text-slate-400">{ans.question}</dt>
                      <dd className="text-sm text-slate-700">{ans.answer || "—"}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {/* Видео-ответ */}
              {(() => {
                const v = a.documents.find((d) => d.type === "video_intro");
                return v ? <VideoIntro path={v.path} label={v.label} /> : null;
              })()}

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {(a.status === "new" || a.status === "viewed") && (
                  <button
                    type="button"
                    disabled={pending[a.id]}
                    onClick={() => changeStatus(a.id, "shortlisted")}
                    className="btn border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                  >
                    ⭐ {t.shortlist}
                  </button>
                )}
                {a.status === "shortlisted" && (
                  <button
                    type="button"
                    disabled={pending[a.id]}
                    onClick={() => changeStatus(a.id, "hired")}
                    className="btn border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    ✅ {t.markHired}
                  </button>
                )}
                <a
                  href={waLink(a.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("whatsapp_clicked", { vacancy_id: vacancyId })}
                  className="btn border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  💬 {t.whatsapp}
                </a>
                <a
                  href={waLink(
                    a.whatsapp,
                    t.reqDocMsg(
                      requiredOnly
                        .filter((d) => !hasType(a, d.type))
                        .map((d) => d.label)
                        .join(", "),
                    ),
                  )}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("doc_requested", { vacancy_id: vacancyId })}
                  className="btn border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                >
                  📄 {t.requestDoc}
                </a>
                {a.status !== "rejected" && a.status !== "hired" && (
                  <button
                    type="button"
                    disabled={pending[a.id]}
                    onClick={() => changeStatus(a.id, "rejected")}
                    className="btn border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                  >
                    {t.reject}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
