"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { attachDocumentFile, createDocumentMeta } from "@/app/my/actions";

type Fields = {
  title: string;
  category: string;
  subtype: string;
  issuer: string;
  doc_number: string;
  issued_at: string;
  expires_at: string;
  tags: string;
  notes: string;
};

const EMPTY: Fields = {
  title: "",
  category: "identity",
  subtype: "",
  issuer: "",
  doc_number: "",
  issued_at: "",
  expires_at: "",
  tags: "",
  notes: "",
};

export default function DocumentForm({
  memberId,
  assetId,
}: {
  memberId?: string;
  assetId?: string;
}) {
  const router = useRouter();
  const [f, setF] = useState<Fields>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof Fields, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function classify() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMsg("Сначала выберите файл — фото или скан документа.");
      return;
    }
    setMsg(null);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/classify", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error ?? "Не удалось распознать.");
      } else {
        setF((p) => ({
          ...p,
          category: data.category ?? p.category,
          subtype: data.subtype ?? p.subtype,
          title: data.title ?? p.title,
          issuer: data.issuer ?? p.issuer,
          doc_number: data.doc_number ?? p.doc_number,
          issued_at: data.issued_at ?? p.issued_at,
          expires_at: data.expires_at ?? p.expires_at,
          tags: Array.isArray(data.tags) && data.tags.length ? data.tags.join(", ") : p.tags,
        }));
        setMsg("Поля заполнены автоматически — проверьте и сохраните.");
      }
    } catch {
      setMsg("Сеть недоступна — попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveErr(null);
    if (!f.title.trim()) {
      setSaveErr("Введите название документа.");
      return;
    }
    setSaving(true);
    try {
      const tags = f.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { id, householdId } = await createDocumentMeta({
        member_id: memberId ?? null,
        asset_id: assetId ?? null,
        title: f.title,
        category: f.category,
        subtype: f.subtype,
        issuer: f.issuer,
        doc_number: f.doc_number,
        issued_at: f.issued_at,
        expires_at: f.expires_at,
        notes: f.notes,
        tags,
      });

      const files = Array.from(fileRef.current?.files ?? []);
      if (files.length) {
        const supabase = getSupabaseBrowser();
        for (const file of files) {
          const safe = file.name.replace(/[^\w.\-]+/g, "_");
          const path = `${householdId}/${id}/${Date.now()}-${safe}`;
          const { error } = await supabase.storage
            .from("vault-files")
            .upload(path, file, {
              contentType: file.type || "application/octet-stream",
              upsert: false,
            });
          if (error) throw new Error(`Файл «${file.name}»: ${error.message}`);
          await attachDocumentFile({
            documentId: id,
            householdId,
            storagePath: path,
            fileName: file.name,
            mimeType: file.type || null,
            sizeBytes: file.size,
          });
        }
      }

      router.push(`/my/documents/${id}`);
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : "Не удалось сохранить.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2 rounded-lg border border-dashed border-brand-300 bg-brand-50/40 p-3">
        <label className="label">Файлы (сканы / фото)</label>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="input bg-white"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={classify}
            disabled={busy}
            className="btn-ghost"
          >
            {busy ? "Распознаю…" : "✨ Распознать (AI)"}
          </button>
          <span className="text-xs text-slate-500">
            Заполнит поля по первому файлу. Файлы грузятся напрямую в приватное
            хранилище.
          </span>
        </div>
        {msg && <p className="mt-2 text-xs text-slate-600">{msg}</p>}
      </div>

      <div className="sm:col-span-2">
        <label className="label">Название</label>
        <input
          required
          value={f.title}
          onChange={(e) => set("title", e.target.value)}
          className="input"
          placeholder="Паспорт РФ"
        />
      </div>
      <div>
        <label className="label">Категория</label>
        <select
          value={f.category}
          onChange={(e) => set("category", e.target.value)}
          className="input"
        >
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Тип / подтип</label>
        <input
          value={f.subtype}
          onChange={(e) => set("subtype", e.target.value)}
          className="input"
          placeholder="паспорт, диплом…"
        />
      </div>
      <div>
        <label className="label">Кем выдан</label>
        <input
          value={f.issuer}
          onChange={(e) => set("issuer", e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="label">Номер</label>
        <input
          value={f.doc_number}
          onChange={(e) => set("doc_number", e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="label">Дата выдачи</label>
        <input
          type="date"
          value={f.issued_at}
          onChange={(e) => set("issued_at", e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="label">Действует до</label>
        <input
          type="date"
          value={f.expires_at}
          onChange={(e) => set("expires_at", e.target.value)}
          className="input"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Теги (через запятую)</label>
        <input
          value={f.tags}
          onChange={(e) => set("tags", e.target.value)}
          className="input"
          placeholder="срочно, оригинал"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Заметки</label>
        <textarea
          rows={2}
          value={f.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="input"
        />
      </div>

      {saveErr && (
        <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {saveErr}
        </p>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Сохраняю…" : "Сохранить документ"}
        </button>
      </div>
    </form>
  );
}
