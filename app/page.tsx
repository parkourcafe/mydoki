import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries";

const CATS: { icon: string; title: string; items: string[] }[] = [
  {
    icon: "📄",
    title: "Личные и миграционные документы",
    items: ["Паспорта и загранпаспорта", "Визы и визовые документы", "Документы на гражданство", "СНИЛС, ИНН, военный билет", "Дипломы, аттестаты, сертификаты"],
  },
  {
    icon: "✈️",
    title: "Поездки и путешествия",
    items: ["Путёвки и ваучеры", "Билеты и бронирования", "Страховки для поездок", "Документы для въезда/выезда", "Согласия на выезд ребёнка"],
  },
  {
    icon: "🚗",
    title: "Авто и недвижимость",
    items: ["ОСАГО и КАСКО", "ПТС и СТС", "Выписки ЕГРН и договоры"],
  },
  {
    icon: "🧾",
    title: "Квитанции и справки",
    items: ["Квитанции и чеки об оплате", "Справки с работы / учёбы", "Доверенности"],
  },
];

const STEPS: { n: string; title: string; text: string }[] = [
  { n: "1", title: "Загрузи фото или скан", text: "Паспорт, виза, анализ, путёвка — любой документ." },
  { n: "2", title: "Укажи дату истечения", text: "В бесплатной версии — вручную. В премиум ИИ распознаёт дату сам." },
  { n: "3", title: "Получай напоминания", text: "Система заранее предупредит об истечении визы, анализа или ОСАГО." },
  { n: "4", title: "Управляй доступом", text: "Отправляй временные ссылки врачам, в банк или родственникам." },
];

const PLAN_ROWS: { feature: string; free: boolean; premium: boolean }[] = [
  { feature: "Загрузка документов", free: true, premium: true },
  { feature: "Ручной ввод дат и напоминания", free: true, premium: true },
  { feature: "Авто-распознавание дат (ИИ)", free: false, premium: true },
  { feature: "Умные напоминания (анализы, визы, ОСАГО)", free: false, premium: true },
  { feature: "AI-юрист (вопросы по документам и поездкам)", free: false, premium: true },
  { feature: "Безопасный шаринг по ссылке", free: true, premium: true },
  { feature: "Доступ с любого устройства", free: true, premium: true },
  { feature: "Изоляция данных по семье (RLS)", free: true, premium: true },
  { feature: "Больше места для документов", free: false, premium: true },
  { feature: "Приоритетная поддержка", free: false, premium: true },
];

const SECURITY: { icon: string; title: string; text: string }[] = [
  { icon: "👨‍👩‍👧", title: "Только ваша семья видит документы", text: "Доступ изолирован на уровне базы (RLS). Никто посторонний, включая нас, не открывает ваши файлы." },
  { icon: "🛡️", title: "Шифрование и контроль входов", text: "Файлы в приватном хранилище, двухфакторный вход и уведомления о входе с нового устройства." },
  { icon: "🎚️", title: "Вы управляете доступом", text: "Делитесь документом по временной ссылке и отзываете её в любой момент." },
  { icon: "🙅", title: "Не продаём ваши данные", text: "Мы не передаём и не продаём ваши данные третьим лицам." },
];

function Check() {
  return <span className="font-semibold text-[#b85c38]">✓</span>;
}
function Dash() {
  return <span className="text-[#b9ac9b]">—</span>;
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
            <div className="flex items-center gap-x-3">
              <Link href="/login" className="hidden rounded-3xl border border-[#d4c9b8] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white md:block">
                Войти
              </Link>
              <Link href="/login" className="accent-btn rounded-3xl px-6 py-2.5 text-sm font-semibold">
                Начать бесплатно
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-screen-xl px-5 pb-8 pt-10">
        <div className="grid items-center gap-x-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-x-2 rounded-full border border-[#e8e0d5] bg-white px-4 py-1.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-[#b85c38]" />
              <span className="font-medium text-[#5c5248]">Личный сейф для документов всей семьи</span>
            </div>

            <h1 className="heading-font mb-5 text-[2.65rem] leading-[1.05] tracking-[-1.4px] text-[#2c2522] lg:text-[3.5rem]">
              Все важные документы<br />
              вашей семьи —<br />
              всегда под рукой
            </h1>

            <p className="mb-8 max-w-md text-[19px] leading-snug text-[#5c5248]">
              Паспорта, анализы, визы, дипломы, справки и путёвки.
              Доступ с любого устройства. Напоминания работают сами.
            </p>

            <div className="mb-8 flex max-w-lg flex-col gap-3 sm:flex-row">
              <Link href="/login" className="accent-btn flex flex-1 items-center justify-center rounded-3xl px-8 py-[17px] text-[17px] font-semibold active:scale-[0.985]">
                Начать бесплатно
              </Link>
              <a href="#how" className="flex flex-1 items-center justify-center rounded-3xl border border-[#d4c9b8] px-8 py-[17px] text-[17px] font-semibold transition-colors hover:bg-white">
                Как это работает
              </a>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5c5248]">
              <span className="flex items-center gap-x-2"><Check /> С любого устройства</span>
              <span className="flex items-center gap-x-2"><Check /> Бесплатный тариф</span>
              <span className="flex items-center gap-x-2"><Check /> Вход через Google</span>
            </div>
          </div>

          {/* Визуал вместо фото */}
          <div className="mt-8 lg:col-span-5 lg:mt-0">
            <div className="rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-[#8a7c6d]">Семейный архив</span>
                <span className="text-xs text-[#b9ac9b]">4 документа</span>
              </div>
              <div className="space-y-3">
                {[
                  { icon: "🩺", title: "Анализы · Аня", status: "ОАК, биохимия — 6 файлов" },
                  { icon: "🛂", title: "Виза · Миша", status: "истекает через 30 дней", warn: true },
                  { icon: "🚗", title: "ОСАГО · Toyota", status: "действует до 2027" },
                  { icon: "✈️", title: "Путёвка · Турция", status: "вылет 14 июля" },
                ].map((d) => (
                  <div key={d.title} className="flex items-center gap-x-3 rounded-2xl border border-[#eee4d6] bg-white px-4 py-3">
                    <div className="text-2xl">{d.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{d.title}</div>
                      <div className={"text-xs " + (d.warn ? "font-medium text-[#b85c38]" : "text-[#8a7c6d]")}>
                        {d.warn ? "⏰ " : ""}{d.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ЧТО МОЖНО ХРАНИТЬ */}
      <section id="what-to-store" className="mx-auto max-w-screen-xl px-5 py-12">
        <div className="mb-8">
          <h2 className="section-header mb-2">Что можно хранить в архиве</h2>
          <p className="text-xl text-[#5c5248]">Всё самое важное для семьи — в одном защищённом месте.</p>
        </div>

        <div className="grid gap-4">
          {/* Анализы — акцент */}
          <div className="warm-card rounded-3xl border border-[#e8e0d5] p-7">
            <div className="flex items-start gap-x-5">
              <div className="mt-1 text-5xl">🩺</div>
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="text-2xl font-semibold">Анализы и медицинские исследования</div>
                  <span className="rounded-full bg-gradient-to-r from-[#b85c38] to-[#d4a373] px-3 py-0.5 text-xs font-semibold text-white">
                    ИИ в премиум
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-x-8 text-[#5c5248] md:grid-cols-2">
                  <ul className="space-y-1.5 text-[15px]">
                    <li>• Результаты лабораторных анализов</li>
                    <li>• Биохимия, ОАК, гормоны, ОАМ</li>
                    <li>• УЗИ, МРТ, КТ, рентген</li>
                  </ul>
                  <ul className="mt-3 space-y-1.5 text-[15px] md:mt-0">
                    <li>• Заключения врачей</li>
                    <li>• Прививочные сертификаты</li>
                    <li>• Медицинские справки</li>
                  </ul>
                </div>
                <div className="mt-4 text-sm font-medium text-[#b85c38]">
                  В премиум: автоматическое распознавание дат + умные напоминания
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {CATS.map((c) => (
              <div key={c.title} className="warm-card rounded-3xl border border-[#e8e0d5] p-6">
                <div className="mb-3 flex items-center gap-x-2 text-xl font-semibold">
                  <span>{c.icon}</span>
                  <span>{c.title}</span>
                </div>
                <ul className="space-y-1.5 text-[15px] text-[#5c5248]">
                  {c.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* КАК ЭТО РАБОТАЕТ */}
      <section id="how" className="mx-auto max-w-screen-xl rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] px-5 py-12">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="section-header mb-3">Как это работает</h2>
          <p className="text-xl text-[#5c5248]">Загрузи документ — остальное система сделает сама</p>
        </div>
        <div className="mx-auto grid max-w-3xl gap-x-8 gap-y-8 md:grid-cols-2">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e8e0d5] bg-white text-2xl font-semibold text-[#b85c38]">
                {s.n}
              </div>
              <div>
                <div className="mb-1.5 text-xl font-semibold">{s.title}</div>
                <p className="text-[#5c5248]">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ТАРИФЫ */}
      <section id="pricing" className="mx-auto max-w-screen-xl px-5 py-14">
        <div className="mx-auto mb-8 max-w-4xl text-center">
          <h2 className="section-header mb-3">Тарифы</h2>
          <p className="text-xl text-[#5c5248]">Базовое — бесплатно. ИИ-функции — в премиуме.</p>
        </div>

        <div className="mx-auto max-w-4xl overflow-x-auto">
          <table className="w-full border-collapse overflow-hidden rounded-3xl border border-[#e8e0d5] bg-white">
            <thead>
              <tr className="bg-[#fdfaf5]">
                <th className="p-5 text-left text-lg font-semibold">Функция</th>
                <th className="p-5 text-center text-lg font-semibold">Бесплатно</th>
                <th className="bg-[#f0e6d9] p-5 text-center text-lg font-semibold">
                  <span className="inline-flex items-center gap-x-2">
                    Премиум
                    <span className="rounded-full bg-[#b85c38] px-3 py-0.5 text-xs text-white">скоро</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="text-[#5c5248]">
              {PLAN_ROWS.map((r) => (
                <tr key={r.feature} className="border-t border-[#e8e0d5]">
                  <td className="p-5 font-medium">{r.feature}</td>
                  <td className="p-5 text-center">{r.free ? <Check /> : <Dash />}</td>
                  <td className="bg-[#fdfaf5] p-5 text-center">{r.premium ? <Check /> : <Dash />}</td>
                </tr>
              ))}
              <tr className="border-t border-[#e8e0d5] font-semibold">
                <td className="p-5">Цена</td>
                <td className="p-5 text-center text-xl">0 ₽</td>
                <td className="bg-[#fdfaf5] p-5 text-center">
                  <div className="text-xl">99 ₽/мес</div>
                  <div className="text-xs font-normal text-[#8a7c6d]">или 990 ₽ в год</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mx-auto mt-5 max-w-4xl text-center text-sm text-[#8a7c6d]">
          На время теста премиум-функции открыты бесплатно — оплата появится позже.
        </p>

        <div className="mx-auto mt-6 flex max-w-4xl flex-col justify-center gap-4 sm:flex-row">
          <Link href="/login" className="rounded-3xl border border-[#d4c9b8] px-8 py-3.5 text-center font-semibold transition-colors hover:bg-white">
            Начать бесплатно
          </Link>
        </div>
      </section>

      {/* БЕЗОПАСНОСТЬ */}
      <section id="security" className="mx-auto max-w-screen-xl px-5 py-14">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="section-header mb-3">Ваши документы в безопасности</h2>
          <p className="text-xl text-[#5c5248]">Мы понимаем, насколько важны эти документы — и сделали всё, чтобы вы были спокойны.</p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          {SECURITY.map((s) => (
            <div key={s.title} className="warm-card rounded-3xl border border-[#e8e0d5] p-7">
              <div className="flex gap-x-4">
                <div className="text-3xl">{s.icon}</div>
                <div>
                  <div className="mb-2 text-xl font-semibold">{s.title}</div>
                  <p className="text-[#5c5248]">{s.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ФИНАЛЬНЫЙ CTA */}
      <section className="mx-auto max-w-screen-xl px-5 py-10">
        <div className="rounded-3xl bg-[#2c2522] px-8 py-10 text-center text-[#f9f5f0]">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight">Готовы собрать все документы семьи?</h2>
          <p className="mx-auto mb-7 max-w-sm text-[#d4c9b8]">Меньше 15 минут — и порядок надолго.</p>
          <Link href="/login" className="inline-flex items-center justify-center rounded-3xl bg-[#b85c38] px-10 py-4 text-lg font-semibold transition-all hover:bg-[#9f4a2e] active:scale-[0.985]">
            Начать пользоваться бесплатно
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e8e0d5] bg-[#fdfaf5] px-5 py-8 text-sm text-[#8a7c6d]">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-y-3 text-center md:flex-row md:text-left">
          <div>© 2026 doki.help — Семейный архив документов</div>
          <div className="flex gap-x-6">
            <a href="#security" className="hover:text-[#2c2522]">Безопасность</a>
            <a href="#pricing" className="hover:text-[#2c2522]">Тарифы</a>
            <Link href="/login" className="hover:text-[#2c2522]">Войти</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
