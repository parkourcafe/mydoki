import { redirect } from "next/navigation";
import { getLocale } from "@/lib/i18n";
import { safeNextPath } from "@/lib/nextPath";

function localizedLoginPath(locale: Awaited<ReturnType<typeof getLocale>>) {
  return locale === "en" ? "/login" : `/${locale}/login`;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [sp, locale] = await Promise.all([searchParams, getLocale()]);
  const qs = new URLSearchParams({ mode: "signup" });
  const next = safeNextPath(sp.next);
  if (next) qs.set("next", next);
  redirect(`${localizedLoginPath(locale)}?${qs.toString()}`);
}
