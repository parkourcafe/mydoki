import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale, type Locale } from "@/lib/i18n";
import TalentSourcing, {
  type EmployerInvite,
  type SourcingVacancy,
} from "./TalentSourcing";

/**
 * Employer Talent Pool (v1.2 §6.3, §8.8). Раздел доступен только
 * организации с действующей верификацией; список кандидатов не выдаётся —
 * работодатель видит агрегат и собственные приглашения.
 */

const M: Record<Locale, { needVerification: string; settings: string }> = {
  ru: {
    needVerification:
      "Talent Pool доступен только организациям с действующей верификацией. Подтвердите организацию в настройках.",
    settings: "Настройки организации",
  },
  en: {
    needVerification:
      "The Talent Pool is available only to organizations with active verification. Verify your organization in settings.",
    settings: "Organization settings",
  },
  id: {
    needVerification:
      "Talent Pool hanya untuk organisasi dengan verifikasi aktif. Verifikasi organisasi Anda di pengaturan.",
    settings: "Pengaturan organisasi",
  },
  uz: {
    needVerification:
      "Talent Pool faqat amaldagi tasdiqlangan tashkilotlar uchun. Tashkilotni sozlamalarda tasdiqlang.",
    settings: "Tashkilot sozlamalari",
  },
};

export default async function EmployerTalentPage() {
  const locale = await getLocale();
  const t = M[locale];
  const user = await getUser();
  const supabase = await getSupabaseServer();

  const { data: employer } = await supabase
    .from("employer_profiles")
    .select("id, verified_at, verification_expires_at, verification_revoked_at")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const verified =
    !!employer?.verified_at &&
    !employer?.verification_revoked_at &&
    (!employer?.verification_expires_at ||
      Date.parse(employer.verification_expires_at) > Date.now());

  if (!verified) {
    return (
      <div className="card bg-white">
        <p className="text-sm text-slate-700">{t.needVerification}</p>
        <Link className="btn-primary mt-3 inline-flex" href="/employer/settings">
          {t.settings}
        </Link>
      </div>
    );
  }

  const [vacancies, invites] = await Promise.all([
    supabase
      .from("vacancies")
      .select("id, title, location, salary_range, hard_criteria")
      .eq("employer_id", employer!.id)
      .order("created_at", { ascending: false }),
    supabase.rpc("get_employer_invites"),
  ]);

  const list: SourcingVacancy[] = ((vacancies.data ?? []) as Record<string, unknown>[]).map(
    (v) => ({
      id: v.id as string,
      title: v.title as string,
      location: (v.location as string) ?? null,
      salary_range: (v.salary_range as string) ?? null,
      has_criteria: Object.keys((v.hard_criteria ?? {}) as object).length > 0,
    }),
  );

  return (
    <TalentSourcing
      locale={locale}
      vacancies={list}
      invites={(invites.data ?? []) as EmployerInvite[]}
    />
  );
}
