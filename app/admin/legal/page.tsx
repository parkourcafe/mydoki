import { notFound } from "next/navigation";
import { getUser } from "@/lib/queries";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAllowedAdmin } from "@/lib/admin";
import { LEGAL_CATEGORIES, LEGAL_JURISDICTION, type LegalTopic } from "@/lib/legal";
import { saveLegalTopic } from "./actions";
import TopicActions from "./TopicActions";

// Внутренний кураторский интерфейс правовых материалов (P3-3). Гейт —
// ADMIN_EMAILS (fail-closed). Интерфейс на английском (не для конечных
// пользователей). Наполнение — по проверенным материалам/источникам.
export const metadata = { robots: { index: false, follow: false } };

function TopicForm({ topic }: { topic?: LegalTopic }) {
  const v = (k: keyof LegalTopic) => (topic?.[k] as string | number | null) ?? "";
  return (
    <form action={saveLegalTopic} className="space-y-2">
      {topic && <input type="hidden" name="id" value={topic.id} />}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Title</label>
          <input name="title" required defaultValue={v("title")} className="input" />
        </div>
        <div>
          <label className="label">Category</label>
          <select name="category" defaultValue={topic?.category ?? "general"} className="input">
            {LEGAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="label">Jurisdiction</label>
          <input name="jurisdiction" defaultValue={topic?.jurisdiction ?? LEGAL_JURISDICTION} className="input" />
        </div>
        <div>
          <label className="label">Slug</label>
          <input name="slug" defaultValue={v("slug")} className="input" placeholder="auto from title" />
        </div>
        <div>
          <label className="label">Sort</label>
          <input name="sort" type="number" defaultValue={topic?.sort ?? 0} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Body (curated — verified content only)</label>
        <textarea name="body" rows={4} defaultValue={v("body")} className="input" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="label">Source</label>
          <input name="source" defaultValue={v("source")} className="input" />
        </div>
        <div>
          <label className="label">Source version</label>
          <input name="source_version" defaultValue={v("source_version")} className="input" />
        </div>
        <div>
          <label className="label">Reviewed at</label>
          <input name="reviewed_at" type="date" defaultValue={v("reviewed_at")} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Source URL</label>
        <input name="source_url" defaultValue={v("source_url")} className="input" />
      </div>
      <div>
        <label className="label">Disclaimer</label>
        <textarea name="disclaimer" rows={2} defaultValue={v("disclaimer")} className="input" />
      </div>
      <div>
        <label className="label">Specialist route</label>
        <input name="specialist_route" defaultValue={v("specialist_route")} className="input" />
      </div>
      <button type="submit" className="btn-primary">{topic ? "Save" : "Create"}</button>
    </form>
  );
}

export default async function AdminLegalPage() {
  const user = await getUser();
  if (!isAllowedAdmin(user?.email, process.env.ADMIN_EMAILS)) notFound();

  const admin = getSupabaseAdmin();
  if (!admin) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          SUPABASE_SERVICE_ROLE_KEY is not set — curation is unavailable.
        </p>
      </main>
    );
  }

  const { data } = await admin
    .from("legal_topics")
    .select("*")
    .order("jurisdiction", { ascending: true })
    .order("sort", { ascending: true });
  const topics = (data ?? []) as LegalTopic[];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Legal topics — curator</h1>
      <p className="mt-1 text-sm text-slate-500">
        Curated legal information (one jurisdiction). Publish only verified
        content with source and date. This is not legal advice authored by AI.
      </p>

      <section className="card mt-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          New topic
        </h2>
        <TopicForm />
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          All topics ({topics.length})
        </h2>
        {topics.map((topic) => (
          <div key={topic.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {topic.title}{" "}
                  <span className="text-xs text-slate-400">
                    · {topic.jurisdiction} · {topic.category} ·{" "}
                    {topic.published ? "published" : "draft"}
                  </span>
                </p>
                <p className="text-xs text-slate-400">{topic.slug}</p>
              </div>
              <TopicActions id={topic.id} published={topic.published} />
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-brand-600">Edit</summary>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <TopicForm topic={topic} />
              </div>
            </details>
          </div>
        ))}
      </section>
    </main>
  );
}
