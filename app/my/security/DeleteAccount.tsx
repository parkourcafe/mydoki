"use client";

import { useState } from "react";
import { deleteAccount } from "@/app/my/actions";
import type { Locale } from "@/lib/i18n";

const M = {
  ru: {
    summary: "Удалить аккаунт",
    warn: "Это навсегда удалит ваш аккаунт, ваши пространства и все документы, файлы и записи в них. Восстановить будет нельзя.",
    typeToConfirm: "Чтобы подтвердить, введите «УДАЛИТЬ»:",
    word: "УДАЛИТЬ",
    button: "Удалить аккаунт навсегда",
  },
  en: {
    summary: "Delete account",
    warn: "This permanently deletes your account, your spaces and all documents, files and records in them. It cannot be undone.",
    typeToConfirm: "Type “DELETE” to confirm:",
    word: "DELETE",
    button: "Delete account permanently",
  },
  id: {
    summary: "Hapus akun",
    warn: "Ini menghapus permanen akun Anda, ruang Anda, dan semua dokumen, berkas, serta catatan di dalamnya. Tidak dapat dibatalkan.",
    typeToConfirm: "Ketik “HAPUS” untuk konfirmasi:",
    word: "HAPUS",
    button: "Hapus akun permanen",
  },
  uz: {
    summary: "Hisobni oʻchirish",
    warn: "Bu hisobingizni, makonlaringizni va ulardagi barcha hujjatlar, fayllar va yozuvlarni butunlay oʻchiradi. Buni qaytarib boʻlmaydi.",
    typeToConfirm: "Tasdiqlash uchun «OʻCHIRISH» deb yozing:",
    word: "OʻCHIRISH",
    button: "Hisobni butunlay oʻchirish",
  },
} as const;

export default function DeleteAccount({ locale }: { locale: Locale }) {
  const t = M[locale];
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const armed = val.trim().toLocaleUpperCase() === t.word;

  return (
    <details className="rounded-xl border border-red-200 bg-red-50/40 p-5">
      <summary className="cursor-pointer font-medium text-red-700">
        {t.summary}
      </summary>
      <p className="mt-3 text-sm text-red-700">{t.warn}</p>
      <form
        action={deleteAccount}
        onSubmit={() => setBusy(true)}
        className="mt-4 space-y-3"
      >
        <label className="block text-sm text-slate-600">{t.typeToConfirm}</label>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="input max-w-xs"
          placeholder={t.word}
          autoComplete="off"
          autoCapitalize="characters"
        />
        <button
          type="submit"
          disabled={!armed || busy}
          className="btn-danger disabled:opacity-50"
        >
          {t.button}
        </button>
      </form>
    </details>
  );
}
