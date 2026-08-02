import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getLocale, type Locale } from "@/lib/i18n";
import { employmentTypeLabel } from "@/lib/employment";
import { type VerifiedEmployment, verifiedStatusLabel } from "@/lib/verification";

export const metadata = { robots: { index: false, follow: false } };

const M = {
  ru: {
    notFoundTitle: "Подтверждение не найдено",
    notFoundText: "Ссылка недействительна, отозвана или срок её действия истёк.",
    title: "Подтверждение занятости",
    company: "Компания",
    position: "Должность",
    type: "Тип занятости",
    period: "Период",
    status: "Статус",
    present: "н. в.",
    source: "Данные предоставлены работодателем и подтверждены по ссылке, которой поделился сам работник.",
    disclaimer: "Показаны только факт и период работы. Оплата, причины и любые оценки не раскрываются.",
    checkedAt: "Проверено",
    poweredBy: "Работает на",
  },
  en: {
    notFoundTitle: "Verification not found",
    notFoundText: "The link is invalid, revoked, or expired.",
    title: "Employment verification",
    company: "Company",
    position: "Position",
    type: "Employment type",
    period: "Period",
    status: "Status",
    present: "present",
    source: "Data is provided by the employer and confirmed via a link shared by the employee themselves.",
    disclaimer: "Only the fact and period of employment are shown. Compensation, reasons and any evaluations are not disclosed.",
    checkedAt: "Checked",
    poweredBy: "Powered by",
  },
  id: {
    notFoundTitle: "Verifikasi tidak ditemukan",
    notFoundText: "Tautan tidak valid, dicabut, atau kedaluwarsa.",
    title: "Verifikasi kerja",
    company: "Perusahaan",
    position: "Posisi",
    type: "Jenis kerja",
    period: "Periode",
    status: "Status",
    present: "sekarang",
    source: "Data disediakan perusahaan dan dikonfirmasi melalui tautan yang dibagikan karyawan sendiri.",
    disclaimer: "Hanya fakta dan periode kerja yang ditampilkan. Kompensasi, alasan, dan penilaian tidak diungkapkan.",
    checkedAt: "Diperiksa",
    poweredBy: "Didukung oleh",
  },
  uz: {
    notFoundTitle: "Tasdiq topilmadi",
    notFoundText: "Havola yaroqsiz, qaytarib olingan yoki muddati tugagan.",
    title: "Bandlikni tasdiqlash",
    company: "Kompaniya",
    position: "Lavozim",
    type: "Bandlik turi",
    period: "Davr",
    status: "Holat",
    present: "hozir",
    source: "Ma'lumot ish beruvchi tomonidan berilgan va xodimning o‘zi ulashgan havola orqali tasdiqlangan.",
    disclaimer: "Faqat ish fakti va davri ko‘rsatiladi. To‘lov, sabab va baholar oshkor qilinmaydi.",
    checkedAt: "Tekshirilgan",
    poweredBy: "Ishlaydi",
  },
} as const;

function fmt(d: string | null, present: string): string {
  return d ? new Date(d).toLocaleDateString() : present;
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const locale: Locale = await getLocale();
  const t = M[locale];
  const { token } = await params;

  const supabase = await getSupabaseServer();
  const { data } = await supabase.rpc("get_employment_verification", { p_token: token });
  const v = data as VerifiedEmployment | null;

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        {!v ? (
          <div className="card text-center">
            <div className="mb-2 text-3xl">🔍</div>
            <h1 className="text-lg font-semibold">{t.notFoundTitle}</h1>
            <p className="mt-1 text-sm text-slate-500">{t.notFoundText}</p>
          </div>
        ) : (
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <h1 className="text-xl font-semibold">{t.title}</h1>
            </div>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">{t.company}</dt>
                <dd className="text-right font-medium">{v.company_name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">{t.position}</dt>
                <dd className="text-right">{v.position}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">{t.type}</dt>
                <dd className="text-right">{employmentTypeLabel(locale, v.employment_type)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">{t.period}</dt>
                <dd className="text-right">
                  {fmt(v.start_date, t.present)} — {v.end_date ? fmt(v.end_date, t.present) : t.present}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">{t.status}</dt>
                <dd className="text-right">{verifiedStatusLabel(locale, v.status)}</dd>
              </div>
            </dl>

            <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">{t.source}</p>
            <p className="text-xs text-slate-400">{t.disclaimer}</p>
            <p className="text-xs text-slate-400">
              {t.checkedAt}: {new Date(v.verified_at).toLocaleString()}
            </p>
          </div>
        )}

        <footer className="mt-6 text-center text-xs text-slate-400">
          {t.poweredBy}{" "}
          <Link href="/" className="font-medium text-brand-600 hover:underline">
            doki.help
          </Link>
        </footer>
      </div>
    </main>
  );
}
