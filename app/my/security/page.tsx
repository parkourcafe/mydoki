import { getUser } from "@/lib/queries";
import MfaSetup from "./MfaSetup";

export default async function SecurityPage() {
  const user = await getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Безопасность</h1>
        <p className="mt-1 text-sm text-slate-500">
          Аккаунт: {user?.email}
        </p>
      </div>

      <section className="card">
        <h2 className="mb-3 font-medium">Двухфакторная аутентификация (2FA)</h2>
        <MfaSetup />
      </section>

      <section className="card text-sm text-slate-600">
        <h2 className="mb-2 font-medium text-slate-900">Как устроена защита</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Документы изолированы по семье на уровне БД (RLS).</li>
          <li>Файлы — в приватном bucket, наружу только по signed URL.</li>
          <li>Обмен — истекающие отзываемые ссылки на один документ.</li>
          <li>Каждый доступ по ссылке пишется в журнал (audit log).</li>
        </ul>
      </section>
    </div>
  );
}
