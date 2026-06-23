import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries";

const HERO_DOCS: { icon: string; title: string; status?: string; warn?: boolean }[] = [
  { icon: "🩺", title: "Анализы · Аня", status: "ОАК, биохимия — 6 файлов" },
  { icon: "🛂", title: "Паспорт РФ · Миша", status: "распознано: до 2031" },
  { icon: "🚗", title: "ОСАГО · Toyota", status: "истекает через 12 дней", warn: true },
  { icon: "🎓", title: "Диплом · Аня", status: "оригинал" },
];

const STORE_CATS: { icon: string; title: string; items: string[] }[] = [
  {
    icon: "📄",
    title: "Личные документы",
    items: ["Паспорта и загранпаспорта", "СНИЛС, ИНН, военный билет", "Дипломы, аттестаты, сертификаты"],
  },
  {
    icon: "🚗",
    title: "Авто и недвижимость",
    items: ["ОСАГО и КАСКО", "ПТС и СТС", "Выписки ЕГРН"],
  },
];

const STEPS: { n: string; title: string; text: string }[] = [
  { n: "1", title: "Загрузи фото или скан документа", text: "Паспорт, анализ, ОСАГО, диплом — любой документ." },
  { n: "2", title: "ИИ распознаёт даты", text: "Система сама находит дату истечения и предлагает её сохранить." },
  { n: "3", title: "Подтверди дату и включи напоминания", text: "Особенно удобно для анализов — не нужно вводить даты вручную." },
  { n: "4", title: "Получай напоминания заранее", text: "Система предупредит, когда пора пересдать анализы или продлить документы." },
];

const SECURITY: { icon: string; text: string }[] = [
  { icon: "🔒", text: "Данные изолированы по семье (RLS) — чужой их не увидит" },
  { icon: "🗂️", text: "Приватное хранилище + временные отзываемые ссылки" },
  { icon: "🔑", text: "Двухфакторный вход и уведомления о входе с нового устройства" },
  { icon: "🎚️", text: "Вы сами управляете доступом к каждому документу" },
];

function GoogleMark() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
      <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
        <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
      </svg>
    </span>
  );
}

export default async function Home() {
  if (await getUser()) redirect("/my");

  return (
    <div className="min-h-screen bg-[#f9f5f0] text-[#2c2522]">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[#e8e0d5] bg-[#fdfaf5]">
        <div className="mx-auto max-w-screen-xl px-5">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#b85c38] text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-semibold tracking-tighter">doki</span>
                <span className="text-2xl font-semibold tracking-tighter text-[#c17a5e]">.help</span>
              </div>
            </div>

            <div className="hidden items-center gap-x-8 text-sm font-medium md:flex">
              <a href="#what-to-store" className="nav-link">Что хранить</a>
              <a href="#how" className="nav-link">Как это работает</a>
              <a href="#security" className="nav-link">Безопасность</a>
            </div>

            <Link href="/login" className="accent-btn rounded-3xl px-5 py-2.5 text-sm font-semibold">
              Войти
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-screen-xl px-5 pb-10 pt-10">
        <div className="grid items-center gap-x-12 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-x-2 rounded-full border border-[#e8e0d5] bg-white px-4 py-1.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-[#b85c38]" />
              <span className="font-medium text-[#5c5248]">Личный сейф для документов всей семьи</span>
            </div>

            <h1 className="heading-font mb-5 text-[2.65rem] leading-[1.08] tracking-[-1.3px] text-[#2c2522] sm:text-6xl">
              Все важные документы<br />
              вашей семьи —<br />
              в одном месте
            </h1>

            <p className="mb-7 max-w-md text-[19px] leading-snug text-[#5c5248]">
              Паспорта, анализы, дипломы, справки и квитанции.
              Даты распознаются автоматически. Напоминания — тоже.
            </p>

            <div className="mb-6 flex max-w-md flex-col gap-3">
              <Link href="/login" className="accent-btn flex items-center justify-center gap-x-3 rounded-3xl px-8 py-[17px] text-[17px] font-semibold active:scale-[0.985]">
                <GoogleMark />
                <span>Войти через Google — сразу начать</span>
              </Link>
              <a href="#how" className="flex items-center justify-center rounded-3xl border border-[#d4c9b8] px-8 py-[17px] text-[17px] font-semibold transition-colors hover:bg-white">
                Как это работает
              </a>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#5c5248]">
              <span className="flex items-center gap-x-1.5"><span className="text-[#b85c38]">✓</span> Распознавание дат</span>
              <span className="flex items-center gap-x-1.5"><span className="text-[#b85c38]">✓</span> Бесплатно</span>
              <span className="flex items-center gap-x-1.5"><span className="text-[#b85c38]">✓</span> Без карты</span>
            </div>
          </div>

          {/* Визуал вместо фото */}
          <div className="mt-9 lg:mt-0">
            <div className="rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-[#8a7c6d]">Семейный архив</span>
                <span className="text-xs text-[#b9ac9b]">4 документа</span>
              </div>
              <div className="space-y-3">
                {HERO_DOCS.map((d) => (
                  <div key={d.title} className="flex items-center gap-x-3 rounded-2xl border border-[#eee4d6] bg-white px-4 py-3">
                    <div className="text-2xl">{d.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{d.title}</div>
                      {d.status && (
                        <div className={"text-xs " + (d.warn ? "font-medium text-[#b85c38]" : "text-[#8a7c6d]")}>
                          {d.warn ? "⏰ " : ""}{d.status}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ЧТО МОЖНО ХРАНИТЬ */}
      <section id="what-to-store" className="mx-auto max-w-screen-xl px-5 py-10">
        <div className="mb-7">
          <h2 className="section-header mb-2">Что можно хранить в архиве</h2>
          <p className="text-lg text-[#5c5248]">Всё важное — по людям и категориям, в одном месте.</p>
        </div>

        <div className="grid gap-4">
          {/* Анализы — акцент */}
          <div className="warm-card rounded-3xl border border-[#e8e0d5] p-6 ring-2 ring-[#b85c38]/20">
            <div className="flex items-start gap-x-4">
              <div className="mt-1 text-4xl">🩺</div>
              <div className="flex-1">
                <div className="mb-2 text-xl font-semibold">Анализы и медицинские исследования</div>
                <div className="grid grid-cols-1 gap-x-6 text-sm text-[#5c5248] sm:grid-cols-2">
                  <ul className="space-y-1">
                    <li>• Результаты лабораторных анализов</li>
                    <li>• Биохимия, ОАК, ОАМ, гормоны</li>
                    <li>• УЗИ, МРТ, КТ, рентген</li>
                  </ul>
                  <ul className="mt-2 space-y-1 sm:mt-0">
                    <li>• Заключения врачей</li>
                    <li>• Прививочные сертификаты</li>
                    <li>• Медицинские справки</li>
                  </ul>
                </div>
                <div className="mt-3 text-sm font-medium text-[#b85c38]">
                  + Распознавание дат и напоминания о пересдаче
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {STORE_CATS.map((c) => (
              <div key={c.title} className="warm-card rounded-3xl border border-[#e8e0d5] p-5">
                <div className="mb-3 flex items-center gap-x-2 font-semibold">
                  <span className="text-xl">{c.icon}</span>
                  <span>{c.title}</span>
                </div>
                <ul className="space-y-1 pl-1 text-sm text-[#5c5248]">
                  {c.items.map((it) => (
                    <li key={it}>• {it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* КАК ЭТО РАБОТАЕТ */}
      <section id="how" className="mx-auto max-w-screen-xl px-5 py-12">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <h2 className="section-header mb-2">Как это работает</h2>
          <p className="text-lg text-[#5c5248]">Загрузи документ — остальное система сделает сама</p>
        </div>
        <div className="mx-auto grid max-w-2xl gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0e6d9] text-2xl font-semibold text-[#b85c38]">
                {s.n}
              </div>
              <div>
                <div className="mb-1 text-xl font-semibold">{s.title}</div>
                <p className="text-[#5c5248]">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* БЕЗОПАСНОСТЬ */}
      <section id="security" className="mx-auto max-w-screen-xl px-5 py-10">
        <div className="rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] p-6 sm:p-8">
          <h2 className="section-header mb-5 leading-tight">Надёжное хранение семейных документов</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {SECURITY.map((s) => (
              <div key={s.text} className="flex gap-x-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#f0e6d9] text-lg">
                  {s.icon}
                </div>
                <span className="text-sm text-[#5c5248]">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ФИНАЛЬНЫЙ CTA */}
      <section className="mx-auto max-w-screen-xl px-5 py-10">
        <div className="rounded-3xl bg-[#2c2522] px-6 py-10 text-center text-[#f9f5f0] sm:px-10">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight">Готовы собрать все документы семьи?</h2>
          <p className="mb-6 text-sm text-[#d4c9b8]">Меньше 15 минут — и порядок надолго.</p>
          <Link href="/login" className="mx-auto flex w-full max-w-sm items-center justify-center gap-x-3 rounded-3xl bg-[#b85c38] px-7 py-3.5 text-base font-semibold transition-all hover:bg-[#9f4a2e] active:scale-[0.985]">
            <GoogleMark />
            <span>Войти через Google — сразу начать</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e8e0d5] bg-[#fdfaf5] px-5 py-7 text-xs text-[#8a7c6d]">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-y-2 text-center">
          <div>© 2026 doki.help — Семейный архив документов</div>
          <div className="flex gap-x-4">
            <a href="#security" className="hover:text-[#2c2522]">Безопасность</a>
            <Link href="/login" className="hover:text-[#2c2522]">Войти</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
