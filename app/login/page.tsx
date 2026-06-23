import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await getUser()) redirect("/my");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
            <span>🔐</span> Семейный сейф
          </div>
          <h1 className="text-balance text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-[2.6rem]">
            Все документы вашей семьи —{" "}
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-[#d4a373] bg-clip-text text-transparent">
              в одном защищённом месте
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xs text-sm text-slate-500">
            Паспорта, дипломы, медкарта и имущество — под рукой и под защитой.
          </p>
        </div>

        <div className="card shadow-md">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Приватно по умолчанию · RLS · приватный storage
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          <a href="/privacy" className="hover:underline">Конфиденциальность</a>
          {" · "}
          <a href="/terms" className="hover:underline">Условия</a>
        </p>
      </div>
    </main>
  );
}
