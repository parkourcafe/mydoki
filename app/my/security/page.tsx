import { getUser, listLoginEvents } from "@/lib/queries";
import { signOutEverywhere } from "@/app/my/actions";
import MfaSetup from "./MfaSetup";
import AlertPhone from "./AlertPhone";

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

function Chip({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={
        "rounded-full px-2 py-0.5 text-xs " +
        (on ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")
      }
    >
      {label}: {on ? "вкл" : "выкл"}
    </span>
  );
}

export default async function SecurityPage() {
  const [user, logins] = await Promise.all([getUser(), listLoginEvents(10)]);
  const emailOn = !!process.env.RESEND_API_KEY;
  const smsOn =
    !!process.env.SMSRU_API_ID ||
    !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM
    );
  const phone = (user?.user_metadata?.alert_phone as string | undefined) ?? "";

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

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">Оповещения о входе</h2>
          <div className="flex gap-1">
            <Chip on={emailOn} label="почта" />
            <Chip on={smsOn} label="SMS" />
          </div>
        </div>
        <p className="text-sm text-slate-500">
          При входе с нового устройства отправим уведомление. Письмо — на email
          аккаунта; SMS — на номер ниже (если подключён SMS-сервис).
        </p>
        <AlertPhone initial={phone} />
      </section>

      <section className="card">
        <h2 className="mb-3 font-medium">Недавние входы</h2>
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
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">
            Видите вход, который не совершали? Выйдите везде и смените пароль.
          </p>
          <form action={signOutEverywhere}>
            <button className="btn-danger">Выйти со всех устройств</button>
          </form>
        </div>
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
