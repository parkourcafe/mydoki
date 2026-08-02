import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import VacancyForm from "./VacancyForm";
import EmployerVerification from "@/app/employer/EmployerVerification";
import VacancyLimitReached from "./VacancyLimitReached";
import { aiTextConfigured } from "@/lib/vacancyAI";
import EmployerSetupForm from "./EmployerSetupForm";

const M = {
  en: {
    setupTitle: "Set up your company",
    setupText: "This appears on your vacancy and application pages.",
    company: "Company name",
    companyPh: "e.g. Sunset Cafe",
    whatsapp: "Contact WhatsApp",
    email: "Contact email",
    optional: "optional",
    save: "Continue",
    companyRequired: "Enter your company name.",
    saveError: "We couldn't save your company. Please try again.",
    loadErrorTitle: "Company setup is temporarily unavailable",
    loadErrorText: "Refresh the page and try again in a moment.",
  },
  id: {
    setupTitle: "Siapkan perusahaan Anda",
    setupText: "Ini tampil di halaman lowongan dan lamaran Anda.",
    company: "Nama perusahaan",
    companyPh: "mis. Sunset Cafe",
    whatsapp: "WhatsApp kontak",
    email: "Email kontak",
    optional: "opsional",
    save: "Lanjut",
    companyRequired: "Masukkan nama perusahaan Anda.",
    saveError: "Perusahaan tidak dapat disimpan. Silakan coba lagi.",
    loadErrorTitle: "Pengaturan perusahaan sementara tidak tersedia",
    loadErrorText: "Muat ulang halaman dan coba lagi sebentar lagi.",
  },
  ru: {
    setupTitle: "Настройте компанию",
    setupText: "Это увидят на страницах вакансии и отклика.",
    company: "Название компании",
    companyPh: "напр. Sunset Cafe",
    whatsapp: "WhatsApp для связи",
    email: "Email для связи",
    optional: "необязательно",
    save: "Продолжить",
    companyRequired: "Введите название компании.",
    saveError: "Не удалось сохранить компанию. Попробуйте ещё раз.",
    loadErrorTitle: "Настройка компании временно недоступна",
    loadErrorText: "Обновите страницу и попробуйте ещё раз через минуту.",
  },
  uz: {
    setupTitle: "Kompaniyangizni sozlang",
    setupText: "Bu vakansiya va ariza sahifalarida ko‘rinadi.",
    company: "Kompaniya nomi",
    companyPh: "mas. Sunset Cafe",
    whatsapp: "Aloqa WhatsApp",
    email: "Aloqa email",
    optional: "ixtiyoriy",
    save: "Davom etish",
    companyRequired: "Kompaniya nomini kiriting.",
    saveError: "Kompaniyani saqlab bo‘lmadi. Qayta urinib ko‘ring.",
    loadErrorTitle: "Kompaniyani sozlash vaqtincha mavjud emas",
    loadErrorText: "Sahifani yangilang va birozdan keyin qayta urinib ko‘ring.",
  },
} as const;

export default async function NewVacancyPage() {
  const locale = await getLocale();
  const t = M[locale];
  const user = await getUser();
  if (!user) redirect("/login");
  const supabase = await getSupabaseServer();

  const { data: profile, error: profileError } = await supabase
    .from("employer_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("loadEmployerProfile failed", {
      code: profileError.code,
      message: profileError.message,
    });
    return (
      <div className="mx-auto max-w-lg">
        <div className="card">
          <h1 className="text-xl font-semibold">{t.loadErrorTitle}</h1>
          <p className="mt-2 text-sm text-slate-500">{t.loadErrorText}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg">
        <EmployerSetupForm copy={t} />
      </div>
    );
  }

  // Работодатель должен подтвердить email кодом, прежде чем публиковать
  // вакансии (общая функция create_vacancy требует verified_at).
  if (!profile.verified_at) {
    return <EmployerVerification locale={locale} />;
  }

  // Лимит бесплатного тарифа: считаем АКТИВНЫЕ вакансии. Если достигнут —
  // показываем экран «напишите нам» вместо формы (монетизация, пилот).
  const limit = (profile.vacancy_limit as number | null) ?? 3;
  const { count: activeCount } = await supabase
    .from("vacancies")
    .select("id", { count: "exact", head: true })
    .eq("employer_id", profile.id)
    .eq("status", "active");
  if ((activeCount ?? 0) >= limit) {
    return <VacancyLimitReached locale={locale} limit={limit} />;
  }

  // AI-freeform (Vacancy Composer Layer 2, §8) включён, если модель настроена
  // И env-переключатель VACANCY_AI_COMPOSER не выставлен в "off". Manual/template
  // пути от него не зависят.
  const aiEnabled =
    aiTextConfigured() && process.env.VACANCY_AI_COMPOSER !== "off";

  return (
    <VacancyForm
      locale={locale}
      defaultCompany={profile.company_name}
      aiEnabled={aiEnabled}
    />
  );
}
