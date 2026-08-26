import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import { signOut } from "@/app/my/actions";
import SignOutButton from "@/components/SignOutButton";
import IdentifyUser from "@/components/IdentifyUser";
import AnalyticsEvents from "@/components/AnalyticsEvents";
import { isNativeRequest } from "@/lib/isNativeRequest";

const M = {
  en: { brand: "Doki for employers", newVacancy: "+ New vacancy", vacancies: "Vacancies", employees: "Employees", talent: "Talent Pool", settings: "Settings", signOut: "Sign out" },
  id: { brand: "Doki untuk perusahaan", newVacancy: "+ Lowongan baru", vacancies: "Lowongan", employees: "Karyawan", talent: "Talent Pool", settings: "Pengaturan", signOut: "Keluar" },
  ru: { brand: "Doki для работодателей", newVacancy: "+ Новая вакансия", vacancies: "Вакансии", employees: "Сотрудники", talent: "Talent Pool", settings: "Настройки", signOut: "Выйти" },
  uz: { brand: "Ish beruvchilar uchun Doki", newVacancy: "+ Yangi vakansiya", vacancies: "Vakansiyalar", employees: "Xodimlar", talent: "Talent Pool", settings: "Sozlamalar", signOut: "Chiqish" },
} as const;

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = M[locale];
  const user = await getUser();
  if (!user) redirect("/login");
  const native = await isNativeRequest();

  return (
    <div className="min-h-screen">
      {!native && <IdentifyUser userId={user.id} locale={locale} />}
      {!native && <AnalyticsEvents />}
      <header className="border-b border-[#e8e0d5] bg-[#fdfaf5]">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/employer" className="font-semibold text-brand-700">
            {t.brand}
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/employer/employees" className="btn-ghost">
              {t.employees}
            </Link>
            <Link href="/employer/talent" className="btn-ghost">
              {t.talent}
            </Link>
            <Link href="/employer/settings" className="btn-ghost">
              {t.settings}
            </Link>
            <Link href="/employer/vacancies/new" className="btn-primary">
              {t.newVacancy}
            </Link>
            <form action={signOut}>
              <SignOutButton label={t.signOut} className="btn-ghost" />
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
