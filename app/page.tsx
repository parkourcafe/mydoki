import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries";

const FEATURES: { icon: string; title: string; text: string }[] = [
  {
    icon: "👨‍👩‍👧",
    title: "Семья",
    text: "Профиль на каждого близкого — взрослые и дети в одном месте.",
  },
  {
    icon: "📄",
    title: "Документы",
    text: "Паспорта, дипломы, СНИЛС, договоры — с фото и сканами.",
  },
  {
    icon: "🚗",
    title: "Имущество",
    text: "Авто и недвижимость с их документами: ПТС, ОСАГО, выписки.",
  },
  {
    icon: "🩺",
    title: "Медкарта",
    text: "Анализы, прививки и назначения по каждому члену семьи.",
  },
  {
    icon: "⏰",
    title: "Сроки",
    text: "Напоминания, пока паспорт или страховка не истекли.",
  },
  {
    icon: "🔗",
    title: "Поделиться",
    text: "Защищённая ссылка с таймером — врачу или в банк, потом отозвать.",
  },
];

const SECURITY: string[] = [
  "Данные изолированы по семье на уровне базы (RLS) — чужой не увидит.",
  "Файлы в приватном хранилище, наружу только по временной ссылке.",
  "Двухфакторный вход и оповещения о входе с нового устройства.",
  "Вход через Google или почту, восстановление пароля.",
];

export default async function Home() {
  if (await getUser()) redirect("/my");

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Шапка */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
          <span>🔐</span> Семейный сейф
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost">
            Войти
          </Link>
          <Link href="/login" className="btn-primary">
            Создать сейф
          </Link>
        </div>
      </header>

      {/* Герой */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-gradient-to-b from-brand-50 to-transparent"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-12 text-center sm:pt-20">
          <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Все документы вашей семьи —{" "}
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-sky-500 bg-clip-text text-transparent">
              в одном защищённом месте
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
            Паспорта, дипломы, медкарта и имущество — под рукой и под защитой.
            Никаких папок, мессенджеров и потерянных сканов.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className="btn-primary px-6 py-3 text-base">
              Создать сейф бесплатно
            </Link>
            <Link href="/login" className="btn-ghost px-6 py-3 text-base">
              У меня уже есть аккаунт
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Бесплатно · без банковской карты · вход через Google
          </p>
        </div>
      </section>

      {/* Боль */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Знакомо?</h2>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li>📦 Перед поездкой ищешь, куда сфотографировал паспорт ребёнка.</li>
            <li>⌛ Узнаёшь, что ОСАГО или загранпаспорт истёк — постфактум.</li>
            <li>🗂️ Документы раскиданы по чатам, почте и десяти папкам.</li>
          </ul>
          <p className="mt-4 font-medium text-slate-900">
            Семейный сейф собирает всё это в одном месте — и напоминает о сроках.
          </p>
        </div>
      </section>

      {/* Возможности */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          Всё под рукой
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Безопасность */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-white sm:p-10">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Безопасность с первого дня
          </h2>
          <p className="mt-2 max-w-xl text-brand-100">
            Это сейф, а не очередная папка в облаке. Доступ — только у вашей семьи.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {SECURITY.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-brand-50">
                <span aria-hidden="true">🛡️</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Финальный призыв */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
          Соберите семейный архив за вечер
        </h2>
        <p className="mx-auto mt-4 max-w-md text-slate-600">
          Добавьте близких, загрузите первые документы — и больше не ищите их по чатам.
        </p>
        <div className="mt-8">
          <Link href="/login" className="btn-primary px-7 py-3 text-base">
            Создать сейф бесплатно
          </Link>
        </div>
      </section>

      {/* Подвал */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-slate-400 sm:flex-row">
          <span>🔐 Семейный сейф · doki.help</span>
          <span>Приватно по умолчанию · RLS · приватный storage</span>
        </div>
      </footer>
    </main>
  );
}
