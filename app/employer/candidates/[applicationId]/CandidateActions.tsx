"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import {
  setApplicationStage,
  rejectApplication,
  addApplicationNote,
  requestApplicationDocuments,
  signApplicationDoc,
} from "@/app/employer/actions";

type Doc = { type: string; label: string; file_name: string; path: string };

const M = {
  ru: {
    decision: "Решение",
    moveStage: "Этап воронки",
    documents: "Документы",
    noDocs: "Документы не приложены.",
    consentClosed: "Согласие отозвано — доступ к документам кандидата закрыт.",
    note: "Заметка команды",
    notePh: "Внутренняя заметка (кандидат не видит)",
    addNote: "Добавить заметку",
    reqDocs: "Запросить документы",
    reqDocsPh: "Каких документов не хватает",
    request: "Запросить",
    reject: "Отклонить",
    rejectPh: "Причина отказа (обязательно)",
    rejectBtn: "Отклонить с причиной",
    finished: "Отклик завершён — действия недоступны.",
    stageNames: { new: "Новый", review: "Рассмотрение", interview: "Интервью", assignment: "Задание", decision: "Решение" } as Record<string, string>,
  },
  en: {
    decision: "Decision",
    moveStage: "Funnel stage",
    documents: "Documents",
    noDocs: "No documents attached.",
    consentClosed: "Consent revoked — access to the candidate's documents is closed.",
    note: "Team note",
    notePh: "Internal note (candidate can't see it)",
    addNote: "Add note",
    reqDocs: "Request documents",
    reqDocsPh: "Which documents are missing",
    request: "Request",
    reject: "Reject",
    rejectPh: "Rejection reason (required)",
    rejectBtn: "Reject with reason",
    finished: "Application finished — actions unavailable.",
    stageNames: { new: "New", review: "Review", interview: "Interview", assignment: "Assignment", decision: "Decision" } as Record<string, string>,
  },
  uz: {
    decision: "Qaror",
    moveStage: "Voronka bosqichi",
    documents: "Hujjatlar",
    noDocs: "Hujjatlar biriktirilmagan.",
    consentClosed: "Rozilik bekor qilindi — nomzod hujjatlariga kirish yopiq.",
    note: "Jamoa eslatmasi",
    notePh: "Ichki eslatma (nomzod koʻrmaydi)",
    addNote: "Eslatma qoʻshish",
    reqDocs: "Hujjat soʻrash",
    reqDocsPh: "Qaysi hujjatlar yetishmaydi",
    request: "Soʻrash",
    reject: "Rad etish",
    rejectPh: "Rad etish sababi (majburiy)",
    rejectBtn: "Sabab bilan rad etish",
    finished: "Ariza yakunlandi — amallar mavjud emas.",
    stageNames: { new: "Yangi", review: "Koʻrib chiqish", interview: "Suhbat", assignment: "Topshiriq", decision: "Qaror" } as Record<string, string>,
  },
  id: {
    decision: "Keputusan",
    moveStage: "Tahap corong",
    documents: "Dokumen",
    noDocs: "Tidak ada dokumen terlampir.",
    consentClosed: "Persetujuan dicabut — akses ke dokumen kandidat ditutup.",
    note: "Catatan tim",
    notePh: "Catatan internal (kandidat tidak melihat)",
    addNote: "Tambah catatan",
    reqDocs: "Minta dokumen",
    reqDocsPh: "Dokumen apa yang kurang",
    request: "Minta",
    reject: "Tolak",
    rejectPh: "Alasan penolakan (wajib)",
    rejectBtn: "Tolak dengan alasan",
    finished: "Lamaran selesai — aksi tidak tersedia.",
    stageNames: { new: "Baru", review: "Ditinjau", interview: "Wawancara", assignment: "Tugas", decision: "Keputusan" } as Record<string, string>,
  },
} as const;

async function openDoc(path: string) {
  const w = window.open("", "_blank");
  const url = await signApplicationDoc(path);
  if (url && w) w.location.href = url;
  else if (w) w.close();
}

export default function CandidateActions({
  locale,
  applicationId,
  vacancyId,
  stages,
  currentStage,
  state,
  docs,
  consentRevoked,
}: {
  locale: Locale;
  applicationId: string;
  vacancyId: string;
  stages: string[];
  currentStage: string;
  state: "active" | "hired" | "rejected" | "withdrawn";
  docs: Doc[];
  consentRevoked: boolean;
}) {
  const t = M[locale];
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [reqNote, setReqNote] = useState("");
  const [reason, setReason] = useState("");

  const active = state === "active";

  function run(fn: () => Promise<unknown>) {
    start(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <section className="card space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {t.decision}
      </h2>

      {!active && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
          {t.finished}
        </p>
      )}

      {/* Этапы воронки */}
      <div>
        <p className="mb-1 text-xs text-slate-400">{t.moveStage}</p>
        <div className="flex flex-wrap gap-2">
          {stages.map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending || !active || s === currentStage}
              onClick={() =>
                run(() => setApplicationStage(applicationId, vacancyId, s))
              }
              className={
                (s === currentStage
                  ? "bg-brand-500 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100") +
                " min-h-[36px] rounded-lg px-3 text-sm font-medium disabled:opacity-50"
              }
            >
              {t.stageNames[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Документы */}
      <div>
        <p className="mb-1 text-xs text-slate-400">{t.documents}</p>
        {consentRevoked ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {t.consentClosed}
          </p>
        ) : docs.length === 0 ? (
          <p className="text-sm text-slate-400">{t.noDocs}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {docs.map((d, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => openDoc(d.path)}
                  className="text-brand-600 hover:underline"
                >
                  📄 {d.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {active && (
        <>
          {/* Запрос документов */}
          <div>
            <label className="label">{t.reqDocs}</label>
            <textarea
              value={reqNote}
              onChange={(e) => setReqNote(e.target.value)}
              rows={2}
              className="input"
              placeholder={t.reqDocsPh}
            />
            <button
              type="button"
              disabled={pending || !reqNote.trim()}
              onClick={() =>
                run(async () => {
                  await requestApplicationDocuments(applicationId, vacancyId, reqNote);
                  setReqNote("");
                })
              }
              className="btn-ghost mt-2 disabled:opacity-50"
            >
              {t.request}
            </button>
          </div>

          {/* Заметка */}
          <div>
            <label className="label">{t.note}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="input"
              placeholder={t.notePh}
            />
            <button
              type="button"
              disabled={pending || !note.trim()}
              onClick={() =>
                run(async () => {
                  await addApplicationNote(applicationId, vacancyId, note);
                  setNote("");
                })
              }
              className="btn-ghost mt-2"
            >
              {t.addNote}
            </button>
          </div>

          {/* Отказ с причиной */}
          <div className="border-t border-slate-100 pt-4">
            <label className="label">{t.reject}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="input"
              placeholder={t.rejectPh}
            />
            <button
              type="button"
              disabled={pending || !reason.trim()}
              onClick={() =>
                run(() => rejectApplication(applicationId, vacancyId, reason))
              }
              className="btn-danger mt-2"
            >
              {t.rejectBtn}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
