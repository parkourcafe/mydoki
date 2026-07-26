import { getUser, listLoginEvents } from "@/lib/queries";
import { getLocale, type Locale } from "@/lib/i18n";
import { aiConfigured, aiProviderName, userWantsAi } from "@/lib/classify";
import { signOutEverywhere } from "@/app/my/actions";
import MfaSetup from "./MfaSetup";
import AlertPhone from "./AlertPhone";
import AiRecognitionToggle from "./AiRecognitionToggle";
import DeleteAccount from "./DeleteAccount";
import SignOutButton from "@/components/SignOutButton";
import { isRuStoreRequest } from "@/lib/isRuStoreRequest";

const M = {
  ru: {
    title: "Безопасность",
    aiRecognition: "Распознавание документов (ИИ)",
    account: "Аккаунт",
    twoFa: "Двухфакторная аутентификация (2FA)",
    loginAlerts: "Оповещения о входе",
    chipEmail: "почта",
    chipSms: "SMS",
    alertsIntro:
      "При входе с нового устройства отправим уведомление. Письмо — на email аккаунта; SMS — на номер ниже (если подключён SMS-сервис).",
    recentLogins: "Недавние входы",
    noRecords: "Записей пока нет.",
    newDevice: "новое устройство",
    ipUnknown: "IP неизвестен",
    seeUnknown:
      "Видите вход, который не совершали? Выйдите везде и смените пароль.",
    signOutAll: "Выйти со всех устройств",
    howProtected: "Как устроена защита",
    p1: "Документы изолированы по семье на уровне БД (RLS).",
    p2: "Файлы — в приватном bucket, наружу только по signed URL.",
    p3: "Обмен — истекающие отзываемые ссылки на один документ.",
    p4: "Каждый доступ по ссылке пишется в журнал (audit log).",
    on: "вкл",
    off: "выкл",
    unknownDevice: "Неизвестное устройство",
    fallbackDevice: "устройство",
    fallbackBrowser: "браузер",
    dateLocale: "ru-RU",
  },
  en: {
    title: "Security",
    aiRecognition: "Document recognition (AI)",
    account: "Account",
    twoFa: "Two-factor authentication (2FA)",
    loginAlerts: "Login alerts",
    chipEmail: "email",
    chipSms: "SMS",
    alertsIntro:
      "We'll notify you when someone signs in from a new device. The email goes to your account address; the SMS to the number below (if an SMS service is connected).",
    recentLogins: "Recent logins",
    noRecords: "No records yet.",
    newDevice: "new device",
    ipUnknown: "IP unknown",
    seeUnknown:
      "See a login you didn't make? Sign out everywhere and change your password.",
    signOutAll: "Sign out of all devices",
    howProtected: "How protection works",
    p1: "Documents are isolated per family at the database level (RLS).",
    p2: "Files live in a private bucket, exposed only via signed URLs.",
    p3: "Sharing uses expiring, revocable links to a single document.",
    p4: "Every link access is written to the audit log.",
    on: "on",
    off: "off",
    unknownDevice: "Unknown device",
    fallbackDevice: "device",
    fallbackBrowser: "browser",
    dateLocale: "en-US",
  },
  id: {
    title: "Keamanan",
    aiRecognition: "Pengenalan dokumen (AI)",
    account: "Akun",
    twoFa: "Autentikasi dua faktor (2FA)",
    loginAlerts: "Peringatan masuk",
    chipEmail: "email",
    chipSms: "SMS",
    alertsIntro:
      "Kami akan memberi tahu Anda saat seseorang masuk dari perangkat baru. Email dikirim ke alamat akun Anda; SMS ke nomor di bawah (jika layanan SMS terhubung).",
    recentLogins: "Login terbaru",
    noRecords: "Belum ada catatan.",
    newDevice: "perangkat baru",
    ipUnknown: "IP tidak diketahui",
    seeUnknown:
      "Melihat login yang tidak Anda lakukan? Keluar dari semua perangkat dan ubah kata sandi Anda.",
    signOutAll: "Keluar dari semua perangkat",
    howProtected: "Cara kerja perlindungan",
    p1: "Dokumen diisolasi per keluarga di tingkat basis data (RLS).",
    p2: "File berada di bucket privat, hanya diekspos melalui signed URL.",
    p3: "Berbagi menggunakan tautan yang kedaluwarsa dan dapat dicabut ke satu dokumen.",
    p4: "Setiap akses tautan dicatat ke dalam audit log.",
    on: "aktif",
    off: "nonaktif",
    unknownDevice: "Perangkat tidak dikenal",
    fallbackDevice: "perangkat",
    fallbackBrowser: "peramban",
    dateLocale: "id-ID",
  },
  uz: {
    title: "Xavfsizlik",
    aiRecognition: "Hujjatlarni aniqlash (AI)",
    account: "Hisob",
    twoFa: "Ikki bosqichli autentifikatsiya (2FA)",
    loginAlerts: "Kirish haqida ogohlantirishlar",
    chipEmail: "email",
    chipSms: "SMS",
    alertsIntro:
      "Kimdir yangi qurilmadan kirsa, sizni xabardor qilamiz. Email hisobingiz manziliga; SMS esa quyidagi raqamga yuboriladi (agar SMS xizmati ulangan boʻlsa).",
    recentLogins: "Soʻnggi kirishlar",
    noRecords: "Hozircha yozuvlar yoʻq.",
    newDevice: "yangi qurilma",
    ipUnknown: "IP nomaʼlum",
    seeUnknown:
      "Oʻzingiz amalga oshirmagan kirishni koʻryapsizmi? Hamma joydan chiqing va parolni oʻzgartiring.",
    signOutAll: "Barcha qurilmalardan chiqish",
    howProtected: "Himoya qanday ishlaydi",
    p1: "Hujjatlar maʼlumotlar bazasi darajasida har bir oila boʻyicha izolyatsiya qilingan (RLS).",
    p2: "Fayllar shaxsiy bucketda saqlanadi, faqat imzolangan URL orqali ochiladi.",
    p3: "Ulashish bitta hujjatga muddati oʻtadigan, bekor qilinadigan havolalar orqali amalga oshiriladi.",
    p4: "Havola orqali har bir kirish audit jurnaliga yoziladi.",
    on: "yoqilgan",
    off: "oʻchirilgan",
    unknownDevice: "Nomaʼlum qurilma",
    fallbackDevice: "qurilma",
    fallbackBrowser: "brauzer",
    dateLocale: "uz-UZ",
  },
} as const;

function deviceLabel(ua: string | null, t: (typeof M)[Locale]): string {
  if (!ua) return t.unknownDevice;
  const os =
    /iPhone|iPad/.test(ua) ? "iPhone/iPad" :
    /Android/.test(ua) ? "Android" :
    /Windows/.test(ua) ? "Windows" :
    /Macintosh|Mac OS/.test(ua) ? "Mac" :
    /Linux/.test(ua) ? "Linux" : t.fallbackDevice;
  const br =
    /Edg\//.test(ua) ? "Edge" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) ? "Safari" : t.fallbackBrowser;
  return `${br} · ${os}`;
}

function Chip({
  on,
  label,
  t,
}: {
  on: boolean;
  label: string;
  t: (typeof M)[Locale];
}) {
  return (
    <span
      className={
        "rounded-full px-2 py-0.5 text-xs " +
        (on ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")
      }
    >
      {label}: {on ? t.on : t.off}
    </span>
  );
}

export default async function SecurityPage() {
  const [locale, ruStore] = await Promise.all([
    getLocale(),
    isRuStoreRequest(),
  ]);
  const t = M[locale];
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
  const aiOn = !ruStore && aiConfigured();
  const aiProvider = aiProviderName();
  const aiPref = userWantsAi(user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t.account}: {user?.email}
        </p>
      </div>

      <section className="card">
        <h2 className="mb-3 font-medium">{t.twoFa}</h2>
        <MfaSetup locale={locale} />
      </section>

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">{t.loginAlerts}</h2>
          <div className="flex gap-1">
            <Chip on={emailOn} label={t.chipEmail} t={t} />
            <Chip on={smsOn} label={t.chipSms} t={t} />
          </div>
        </div>
        <p className="text-sm text-slate-500">{t.alertsIntro}</p>
        <AlertPhone initial={phone} locale={locale} />
      </section>

      {!ruStore && (
        <section className="card space-y-3">
          <h2 className="font-medium">{t.aiRecognition}</h2>
          <AiRecognitionToggle
            initial={aiPref}
            configured={aiOn}
            provider={aiProvider}
            locale={locale}
          />
        </section>
      )}

      <section className="card">
        <h2 className="mb-3 font-medium">{t.recentLogins}</h2>
        {logins.length === 0 ? (
          <p className="text-sm text-slate-400">{t.noRecords}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {logins.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium">
                    {deviceLabel(e.user_agent, t)}
                    {e.is_new_device && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        {t.newDevice}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {e.ip ?? t.ipUnknown} ·{" "}
                    {new Date(e.created_at).toLocaleString(t.dateLocale)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">{t.seeUnknown}</p>
          <form action={signOutEverywhere}>
            <SignOutButton label={t.signOutAll} className="btn-danger disabled:opacity-60" />
          </form>
        </div>
      </section>

      <section className="card text-sm text-slate-600">
        <h2 className="mb-2 font-medium text-slate-900">{t.howProtected}</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t.p1}</li>
          <li>{t.p2}</li>
          <li>{t.p3}</li>
          <li>{t.p4}</li>
        </ul>
      </section>

      <DeleteAccount locale={locale} />
    </div>
  );
}
