import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await getUser()) redirect("/my");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-2 text-4xl">🔐</div>
          <h1 className="text-2xl font-semibold text-slate-900">Family Vault</h1>
          <p className="mt-1 text-sm text-slate-500">
            Все документы вашей семьи — в одном защищённом месте.
          </p>
        </div>
        <div className="card">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Приватно по умолчанию · RLS · приватный storage
        </p>
      </div>
    </main>
  );
}
