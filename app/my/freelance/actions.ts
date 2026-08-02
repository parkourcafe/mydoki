"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";

export type PortfolioItem = {
  title: string;
  description: string;
  link: string;
  image_path?: string | null;
};

export type PortfolioInput = {
  display_name: string;
  tagline: string;
  about: string;
  contact_whatsapp: string;
  contact_email: string;
  items: PortfolioItem[];
};

/** Сохранить профиль фрилансера + список работ (переписываем работы целиком). */
export async function savePortfolio(
  input: PortfolioInput,
): Promise<{ ok: true } | { error: string }> {
  const user = await getUser();
  if (!user) return { error: "auth" };
  const supabase = await getSupabaseServer();

  const clean = (s: string) => {
    const v = (s ?? "").trim();
    return v.length ? v : null;
  };

  // Профиль (upsert). token/is_public не трогаем — ими управляет toggle.
  const { error: e1 } = await supabase.from("portfolios").upsert(
    {
      user_id: user.id,
      display_name: clean(input.display_name),
      tagline: clean(input.tagline),
      about: clean(input.about),
      contact_whatsapp: clean(input.contact_whatsapp),
      contact_email: clean(input.contact_email),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (e1) return { error: e1.message };

  // Работы: удаляем старые и вставляем актуальные (простая полная замена).
  const items = (input.items ?? [])
    .map((it, idx) => ({
      user_id: user.id,
      title: (it.title ?? "").trim().slice(0, 120),
      description: (it.description ?? "").trim().slice(0, 1000) || null,
      link: (it.link ?? "").trim().slice(0, 500) || null,
      image_path: (it.image_path ?? "").trim().slice(0, 400) || null,
      sort: idx,
    }))
    .filter((it) => it.title || it.description || it.link || it.image_path)
    .slice(0, 50);

  const { error: e2 } = await supabase
    .from("portfolio_items")
    .delete()
    .eq("user_id", user.id);
  if (e2) return { error: e2.message };

  if (items.length) {
    const { error: e3 } = await supabase.from("portfolio_items").insert(items);
    if (e3) return { error: e3.message };
  }

  revalidatePath("/my/freelance");
  return { ok: true };
}

/** Опубликовать / снять с публикации портфолио. */
export async function setPortfolioPublic(
  isPublic: boolean,
): Promise<{ ok: true } | { error: string }> {
  const user = await getUser();
  if (!user) return { error: "auth" };
  const supabase = await getSupabaseServer();

  // Гарантируем, что строка есть (первый вход мог не сохранять профиль).
  const { error } = await supabase.from("portfolios").upsert(
    { user_id: user.id, is_public: isPublic, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
  if (error) return { error: error.message };

  revalidatePath("/my/freelance");
  return { ok: true };
}
