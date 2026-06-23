import { getUser, listLoginEvents } from "@/lib/queries";
import MfaSetup from "./MfaSetup";

function deviceLabel(ua: string | null): string {
  if (!ua) return "Неизвестное устройство";
  const os =
    /iPhone|iPad/.test(ua) ? "iPhone/iPad" :
    /Android/.test(ua) ? "Android" :
    /Windows/.test(ua) ? "Windows" :
    /Macintosh|Mac OS/.test(ua) ? "Mac" :
    /Linux/.test(ua) ? "Linux" : "устройство";
  const br =
    /Edg\//.test(ua) ? "Edge" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) ? "Safari" : "браузер";
  return `${br} · ${os}`;
}

export default async function SecurityPage() {
  const [user, logins] = await Promise.all([getUser(), listLoginEvents(10)]);
  const alertsOn = !!process.env.RESEND_API_KEY;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Безопасность</h1>
        <p className="mt-1 text-sm text-slate-500">Аккаунт: {user?.email}</p>
      </div>

      <section className="card">
        <h2 className="mb-3 font-medium">Двухфакторная аутентификация (2FA)</h2>
        <MfaSetup />
      </section>

      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Недавние входы</h2>
          <span
            className={
              "rounded-full px-2 py-0.5 text-xs " +
              (alertsOn
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500")
            }
          >
            {alertsOn ? "письма о новом входе включены" : "письма выключены"}
          </span>
        </div>

        {logins.length === 0 ? (
          <p className="text-sm text-slate-400">Записей пока нет.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {logins.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium">
                    {deviceLabel(e.user_agent)}
                    {e.is_new_device && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        новое устройство
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {e.ip ?? "IP неизвестен"} ·{" "}
                    {new Date(e.created_at).toLocaleString("ru-RU")}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-slate-400">
          Видите вход, который не совершали? Смените пароль и включите 2FA.
        </p>
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
