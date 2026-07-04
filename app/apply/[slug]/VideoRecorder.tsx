"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

const M = {
  ru: {
    record: "● Записать",
    stop: "■ Стоп",
    retake: "Переснять",
    recording: "Идёт запись",
    attempts: (n: number) => `Осталось попыток: ${n}`,
    maxReached: "Попытки записи исчерпаны.",
    orUpload: "Не получается записать? Загрузите видеофайл:",
    denied: "Нет доступа к камере. Разрешите доступ или загрузите файл ниже.",
    hintCap: "до 60 секунд",
  },
  en: {
    record: "● Record",
    stop: "■ Stop",
    retake: "Retake",
    recording: "Recording",
    attempts: (n: number) => `Attempts left: ${n}`,
    maxReached: "No recording attempts left.",
    orUpload: "Can't record? Upload a video file:",
    denied: "No camera access. Allow it or upload a file below.",
    hintCap: "up to 60 seconds",
  },
  id: {
    record: "● Rekam",
    stop: "■ Stop",
    retake: "Rekam ulang",
    recording: "Merekam",
    attempts: (n: number) => `Sisa percobaan: ${n}`,
    maxReached: "Percobaan rekaman habis.",
    orUpload: "Tak bisa merekam? Unggah file video:",
    denied: "Tidak ada akses kamera. Izinkan atau unggah file di bawah.",
    hintCap: "maks 60 detik",
  },
  uz: {
    record: "● Yozish",
    stop: "■ To‘xtatish",
    retake: "Qayta yozish",
    recording: "Yozilmoqda",
    attempts: (n: number) => `Qolgan urinishlar: ${n}`,
    maxReached: "Yozish urinishlari tugadi.",
    orUpload: "Yoza olmayapsizmi? Video fayl yuklang:",
    denied: "Kamera ruxsati yo‘q. Ruxsat bering yoki quyida fayl yuklang.",
    hintCap: "60 soniyagacha",
  },
} as const;

const MAX_SEC = 60;
const MAX_ATTEMPTS = 3;

function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const m of ["video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return "";
}

export default function VideoRecorder({
  locale,
  onVideo,
}: {
  locale: Locale;
  onVideo: (file: File | null) => void;
}) {
  const t = M[locale];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  const supported = typeof window !== "undefined" && pickMime() !== "";

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  };

  // Чистим ресурсы при размонтировании.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopTracks();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    setDenied(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onVideo(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      const mime = pickMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const type = mime.split(";")[0] || "video/webm";
        const ext = type.includes("mp4") ? "mp4" : "webm";
        const blob = new Blob(chunksRef.current, { type });
        const file = new File([blob], `intro.${ext}`, { type });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        onVideo(file);
        stopTracks();
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
      setSeconds(0);
      // Живое превью с камеры.
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        void videoRef.current.play().catch(() => {});
      }
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SEC) stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      setDenied(true);
      stopTracks();
    }
  }

  function stop() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recRef.current && recRef.current.state !== "inactive") {
      recRef.current.stop();
    }
    setRecording(false);
    setAttempts((a) => a + 1);
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function onPickFile(file: File | null) {
    onVideo(file ?? null);
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  const attemptsLeft = MAX_ATTEMPTS - attempts;
  const canRecord = supported && !recording && attemptsLeft > 0;

  return (
    <div className="space-y-2">
      {/* Превью / плеер */}
      <div className="overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          className="mx-auto max-h-64 w-full bg-black"
          playsInline
          controls={!recording && !!previewUrl}
          src={!recording && previewUrl ? previewUrl : undefined}
        />
      </div>

      {supported && (
        <div className="flex flex-wrap items-center gap-2">
          {recording ? (
            <button
              type="button"
              onClick={stop}
              className="btn border border-red-300 bg-red-50 text-red-700"
            >
              {t.stop} · {seconds}s / {MAX_SEC}s
            </button>
          ) : (
            <button
              type="button"
              onClick={start}
              disabled={!canRecord}
              className="btn border border-brand-300 bg-brand-50 text-brand-700 disabled:opacity-50"
            >
              {previewUrl ? t.retake : t.record}
            </button>
          )}
          <span className="text-xs text-slate-500">
            {recording
              ? `🔴 ${t.recording}`
              : attemptsLeft > 0
                ? `${t.attempts(attemptsLeft)} · ${t.hintCap}`
                : t.maxReached}
          </span>
        </div>
      )}

      {denied && <p className="text-xs text-amber-600">{t.denied}</p>}

      {/* Фолбэк: загрузка файла (старые устройства / нет доступа) */}
      {(!supported || denied) && (
        <div>
          <p className="mb-1 text-xs text-slate-500">{t.orUpload}</p>
          <input
            type="file"
            accept="video/webm,video/mp4,video/quicktime,video/*"
            capture="user"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>
      )}
    </div>
  );
}
