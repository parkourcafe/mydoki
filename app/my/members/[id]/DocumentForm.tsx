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

function fmtSize(n: number) {
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} КБ`;
  return `${(n / 1024 / 1024).toFixed(1)} МБ`;
}

export default function DocumentForm({
  memberId,
  assetId,
}: {
  memberId?: string;
  assetId?: string;
}) {
  const router = useRouter();
  const [f, setF] = useState<Fields>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const pickRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const autoRan = useRef(false);

  const set = (k: keyof Fields, v: string) => setF((p) => ({ ...p, [k]: v }));

  function addFiles(list: FileList | null) {
    if (!list || !list.length) return;
    const incoming = Array.from(list);
    setFiles((prev) => {
      const seen = new Set(prev.map((x) => x.name + x.size));
      return [...prev, ...incoming.filter((x) => !seen.has(x.name + x.size))];
    });
    // Авто-распознавание по первому файлу (один раз). Тихо — если ИИ не настроен.
    const first = incoming.find(
      (x) => x.type.startsWith("image/") || x.type === "application/pdf"
    );
    if (first && !autoRan.current) {
      autoRan.current = true;
      classify(first, true);
    }
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function classify(picked?: File, silent = false) {
    const file = picked ?? files[0];
    if (!file) {
      if (!silent) setMsg("Сначала выберите файл или сфотографируйте документ.");
      return;
    }
    if (!silent) setMsg(null);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/classify", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        if (!silent) setMsg(data.error ?? "Не удалось распознать.");
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
          tags:
            Array.isArray(data.tags) && data.tags.length
              ? data.tags.join(", ")
              : p.tags,
        }));
        setMsg("Поля заполнены автоматически — проверьте и сохраните.");
      }
    } catch {
      if (!silent) setMsg("Сеть недоступна — попробуйте ещё раз.");
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

      if (files.length) {
        const supabase = getSupabaseBrowser();
        for (const file of files) {
          const safe = file.name.replace(/[^\w.\-]+/g, "_") || "file";
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
        <label className="label">Файлы документа</label>

        <input
          ref={pickRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <input
          ref={camRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => pickRef.current?.click()}
            className="btn-ghost"
          >
            📎 Выбрать файл
          </button>
          <button
            type="button"
            onClick={() => camRef.current?.click()}
            className="btn-ghost"
          >
            📷 Сфотографировать
          </button>
          <button
            type="button"
            onClick={() => classify()}
            disabled={busy || !files.length}
            className="btn-ghost"
          >
            {busy ? "Распознаю…" : "✨ Распознать даты (AI)"}
          </button>
        </div>

        {files.length > 0 && (
          <ul className="mt-3 space-y-1">
            {files.map((file, i) => (
              <li
                key={file.name + file.size + i}
                className="flex items-center justify-between rounded-md bg-white px-2 py-1 text-sm"
              >
                <span className="truncate">
                  {file.name}{" "}
                  <span className="text-xs text-slate-400">
                    {fmtSize(file.size)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="ml-2 text-xs text-red-500 hover:underline"
                >
                  убрать
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-2 text-xs text-slate-500">
          На телефоне «Сфотографировать» откроет камеру. Файлы грузятся напрямую
          в приватное хранилище — размер не ограничен.
        </p>
        {msg && <p className="mt-1 text-xs text-slate-600">{msg}</p>}
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
