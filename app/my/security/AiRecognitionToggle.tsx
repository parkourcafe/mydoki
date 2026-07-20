"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";

const M = {
  ru: {
    label: "Включить распознавание документов (ИИ)",
    disclosure: (p: string) =>
      `Когда включено: первое фото нового документа сразу отправляется во внешний сервис распознавания (${p}), чтобы определить категорию, тип, даты и разложить документ по нужной папке. Если категория неоднозначна — мы спросим вас, а не выберем сами. Кнопка «Распознать заново» доступна для повторного анализа. Выключите переключатель — и ничего не будет отправляться.`,
    notConfigured:
      "Сейчас провайдер распознавания не подключён — функция недоступна. Настройку можно сохранить заранее.",
    saved: "Сохранено.",
    saveError: "Не удалось сохранить.",
  },
  en: {
    label: "Enable document recognition (AI)",
    disclosure: (p: string) =>
      `When enabled: the first photo of a new document is sent right away to an external recognition service (${p}) to detect its category, type, dates, and file it in the right folder. If the category is ambiguous, we'll ask you instead of guessing. The “Recognize again” button lets you re-run it. Turn the toggle off and nothing is sent.`,
    notConfigured:
      "No recognition provider is connected yet — the feature is unavailable. You can save the setting in advance.",
    saved: "Saved.",
    saveError: "Could not save.",
  },
  id: {
    label: "Aktifkan pengenalan dokumen (AI)",
    disclosure: (p: string) =>
      `Saat aktif: foto pertama dari dokumen baru langsung dikirim ke layanan pengenalan eksternal (${p}) untuk mendeteksi kategori, jenis, tanggal, dan menempatkannya di folder yang tepat. Jika kategorinya tidak jelas, kami akan bertanya, bukan menebak. Tombol “Kenali ulang” tersedia untuk menjalankannya lagi. Matikan sakelar dan tidak ada yang akan dikirim.`,
    notConfigured:
      "Belum ada penyedia pengenalan yang terhubung — fitur tidak tersedia. Anda dapat menyimpan pengaturan ini terlebih dahulu.",
    saved: "Tersimpan.",
    saveError: "Gagal menyimpan.",
  },
  uz: {
    label: "Hujjatlarni aniqlashni yoqish (AI)",
    disclosure: (p: string) =>
      `Yoqilganda: yangi hujjatning birinchi fotosi darhol tashqi aniqlash xizmatiga (${p}) yuboriladi — toifa, turi, sanalari aniqlanadi va tegishli papkaga joylashtiriladi. Toifa noaniq boʻlsa — taxmin qilmasdan sizdan soʻraymiz. “Qayta aniqlash” tugmasi qayta ishga tushirish uchun mavjud. Tugmani oʻchiring — hech narsa yuborilmaydi.`,
    notConfigured:
      "Hozircha aniqlash provayderi ulanmagan — funksiya mavjud emas. Sozlamani oldindan saqlashingiz mumkin.",
    saved: "Saqlandi.",
    saveError: "Saqlab boʻlmadi.",
  },
} as const;

/** Согласие на ИИ-распознавание — хранится в метаданных пользователя. */
export default function AiRecognitionToggle({
  initial,
  configured,
  provider,
  locale,
}: {
  initial: boolean;
  configured: boolean;
  provider: string | null;
  locale: Locale;
}) {
  const t = M[locale];
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function toggle(next: boolean) {
    setOn(next);
    setBusy(true);
    setMsg(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({
      data: { ai_recognition: next },
    });
    setBusy(false);
    if (error) {
      setOn(!next); // откат при ошибке
      setMsg(t.saveError);
    } else {
      setMsg(t.saved);
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={on}
          disabled={busy}
          onChange={(e) => toggle(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600"
        />
        <span className="text-sm font-medium text-slate-800">{t.label}</span>
      </label>
      <p className="text-xs leading-relaxed text-slate-500">
        {t.disclosure(provider ?? "—")}
      </p>
      {!configured && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {t.notConfigured}
        </p>
      )}
      {msg && <span className="text-xs text-slate-500">{msg}</span>}
    </div>
  );
}
