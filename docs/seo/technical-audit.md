# Технический SEO-аудит Doki.help

> Аудит текущего состояния (ветка `claude/doki-help-seo-strategy-zjskun`) под
> стратегию **Deadline-Led Document SEO**. Только список проблем + приоритеты.
> Внедрение — отдельным шагом после согласования.
>
> Каждая проблема: **что → где → почему важно → как чинить**.

## Что уже сделано хорошо (не трогаем)

- `metadataBase`, title-template `%s · doki.help`, OpenGraph, Twitter card,
  `verification` (Google + Yandex) — есть в `app/layout.tsx`.
- По одному `<h1>` на каждой публичной странице (page, for, vs, keep, privacy,
  terms) — проверено.
- Schema уже присутствует: `Organization`, `WebSite`, `SoftwareApplication`,
  `FAQPage`, `BreadcrumbList` (homepage + `/for` + `/vs` + `/keep`).
- Динамический OG-образ (`app/opengraph-image.tsx`), `manifest.ts`, PWA/offline.
- Security-заголовки (HSTS, X-Frame-Options, nosniff) в `next.config.mjs`.
- Canonical на подстраницах задаётся per-slug (`/for/*`, `/vs/*`, `/keep/*`).
- Самостоятельный `robots.txt` с правилами для ИИ-краулеров; `sitemap.xml`.
- `next/font` (self-hosted), растровых изображений почти нет → CWV в хорошем
  старте; `<img>` встречается только на `/s/[token]`.

---

## 🔴 Critical — чинить в первую очередь (приватность + индексация)

### C1. Signed-ссылки на документы открыты для краулеров
- **Где:** `app/s/[token]/page.tsx` (нет `robots: noindex`), `app/robots.txt/route.ts`
  (`PRIVATE` содержит `/share/`, а реальный путь — `/s/`).
- **Что:** публичная страница расшаренного документа `/s/[token]` рендерит
  реальный документ (`<img>` файла, заголовок, номер, даты). Она НЕ помечена
  `noindex`, а в robots.txt запрещён несуществующий префикс `/share/` —
  то есть `/s/` фактически разрешён к обходу.
- **Почему важно:** если токен-URL хоть раз попадёт в Referer, историю,
  мессенджер или будет угадан — поисковик может проиндексировать **приватный
  документ семьи**. Это и приватность, и репутация бренда «про безопасность».
- **Как чинить:** (1) `export const metadata = { robots: { index:false, follow:false } }`
  (или `noindex` через generateMetadata) на `/s/[token]`; (2) в robots.txt
  заменить `/share/` на `/s/`; (3) желательно отдавать HTTP-заголовок
  `X-Robots-Tag: noindex` для `/s/:path*` через `next.config.mjs` (надёжнее
  meta, т.к. срабатывает даже без рендера).

### C2. Invite-ссылки тоже индексируемы
- **Где:** `app/invite/[token]/page.tsx` — нет `noindex`, нет в robots Disallow.
- **Что:** страница принятия приглашения в семью с токеном доступна краулерам.
- **Почему важно:** утечка инвайт-токена через индекс = посторонний может войти
  в семейный доступ; плюс мусорные токен-URL в индексе.
- **Как чинить:** `noindex` на странице + `Disallow: /invite/` в robots +
  `X-Robots-Tag` на `/invite/:path*`.

### C3. Мультиязычность ломает индексацию (нет hreflang, один URL на 4 языка)
- **Где:** `lib/i18n.ts` (локаль из cookie/Accept-Language), `app/layout.tsx`
  (`alternates.canonical: "/"` без `languages`), все подстраницы — нет hreflang.
- **Что:** один и тот же URL (`/`, `/for/medical` …) отдаёт ru/en/id/uz в
  зависимости от cookie/заголовка. Googlebot ходит без cookie и обычно без
  `Accept-Language` → `getLocale()` отдаёт **только дефолт (`en`)**. Остальные
  языки (включая **ru — основной рынок**, см. `docs/launch-russia.md`)
  поисковику недоступны и в индекс не попадут.
- **Почему важно:** это «потолок» всей мультиязычной стратегии. Без path-based
  локалей и hreflang RU/ID/UZ-кластеры не существуют для Google.
- **Как чинить (большая задача):** перейти на сегмент локали в пути
  (`/en/…`, `/ru/…`, `/id/…`, `/uz/…`) либо домены/поддомены; добавить
  `alternates.languages` (hreflang) + `x-default` в metadata; canonical на
  каждую языковую версию; обновить `sitemap.ts` с per-locale alternates;
  middleware для редиректа `/` → локаль по `Accept-Language`. Это меняет
  структуру URL — планировать аккуратно (редиректы со старых URL).

---

## 🟠 High — заметно влияет на индексацию/трафик

### H1. Приватные/служебные страницы без `noindex`
- **Где:** `/saved` (`app/saved/page.tsx`), `/offline` (`app/offline/page.tsx`),
  `/reset-password`, `/auth/callback`.
- **Что:** `/saved` (офлайн-копии устройства) и `/offline` имеют `<title>`,
  индексируемы; в robots закрыт только `/login`, `/reset-password`. `/saved`,
  `/offline`, `/auth` — не закрыты.
- **Почему важно:** тонкие/служебные страницы в индексе размывают краулинг-бюджет
  и могут ранжироваться вместо нужных.
- **Как чинить:** `noindex` на `/saved`, `/offline`, `/auth/*`; добавить их в
  robots Disallow (`/saved`, `/offline`, `/auth`). `/reset-password` уже в robots,
  но добавить и meta `noindex` для надёжности.

### H2. robots.txt: Disallow указывает на несуществующие/неполные пути
- **Где:** `app/robots.txt/route.ts`, массив `PRIVATE`.
- **Что:** `PRIVATE = ["/my", "/api", "/login", "/reset-password", "/share/"]`.
  `/share/` не существует (нужен `/s/`), а `/s/`, `/invite/`, `/saved`,
  `/offline`, `/auth` отсутствуют.
- **Почему важно:** реальные приватные зоны открыты обходу (см. C1/C2/H1).
- **Как чинить:** привести список к реальным маршрутам:
  `["/my", "/api", "/login", "/reset-password", "/s/", "/invite/", "/saved", "/offline", "/auth"]`.

### H3. Sitemap без hreflang-alternates и lastModified; новые разделы отсутствуют
- **Где:** `app/sitemap.ts`.
- **Что:** перечислены только `/`, `/privacy`, `/terms`, `/for/*`, `/vs/*`,
  `/keep/*`. Нет `alternates.languages` (hreflang в sitemap), нет
  `lastModified`. Новые кластеры (`/reminders/*`, `/documents/*`, `/checklists/*`,
  money-страницы из брифов) ещё не созданы → в карте их нет.
- **Почему важно:** sitemap — основной способ заявить о языковых версиях и новых
  страницах. Без него рост кластера не «виден» Google.
- **Как чинить:** добавить `lastModified`; после внедрения i18n — per-locale
  alternates; по мере появления новых страниц — включать в sitemap.

### H4. `/keep/*` индексируется как RU без языкового сигнала
- **Где:** `lib/usecases.ts` (контент только ru), `app/sitemap.ts`.
- **Что:** use-case страницы (`/keep/taxes` …) только на русском, но в общей карте
  без hreflang/`lang`. На фоне дефолтной `en`-выдачи Google получает рассинхрон
  «язык страницы vs язык сайта».
- **Почему важно:** смешанные языковые сигналы вредят и RU-, и EN-ранжированию.
- **Как чинить:** в рамках i18n развести `/keep/*` под `/ru/keep/*`; до тех пор —
  явно проставлять `lang="ru"` и не смешивать с EN-canonical.

---

## 🟡 Medium — гигиена и упущенные возможности

### M1. Нет канонизации хоста (www / без слеша / http)
- **Где:** `next.config.mjs` (нет redirects), отсутствует нормализация trailing slash.
- **Что:** не настроены 301-редиректы `www → apex` (или наоборот) и единый
  trailing-slash. Брифы используют слеш в конце (`/passport-expiry-reminder/`),
  а Next по умолчанию — без слеша.
- **Почему важно:** дубли URL дробят сигналы и краулинг-бюджет.
- **Как чинить:** выбрать единый хост и формат слеша; настроить `redirects()` в
  `next.config.mjs` (+ `trailingSlash` при необходимости — согласовать со
  слешами в брифах/внутренних ссылках).

### M2. `/for/*` и `/vs/*` без `SoftwareApplication`-schema
- **Где:** `app/for/[segment]/page.tsx`, `app/vs/[slug]/page.tsx` (только
  `BreadcrumbList`).
- **Что:** на продуктовых лендингах нет `SoftwareApplication`/`FAQPage` (FAQ на
  `/for/*` вообще не выводится в UI).
- **Почему важно:** упущенная структурированная разметка на ключевых страницах.
- **Как чинить:** добавить `SoftwareApplication` на лендинги; на `/for/*`
  добавить видимый FAQ-блок + `FAQPage` (schema — только если FAQ виден).

### M3. `verification.yandex` не совпадает с public/
- **Где:** `app/layout.tsx` (3 yandex-кода) vs `public/` (2 yandex html).
- **Что:** в metadata перечислены 3 кода верификации Яндекса, в `public/` — два
  файла. Рассинхрон, один код «висит».
- **Почему важно:** низкий риск, но лишний неподтверждённый verification-тег.
- **Как чинить:** свериться с Я.Вебмастером, оставить актуальные коды.

### M4. Twitter-карточка без явного изображения
- **Где:** `app/layout.tsx` (`twitter.card: summary_large_image`, без `images`).
- **Что:** Next подставит `opengraph-image` и для Twitter, поэтому скорее всего
  ок, но явного `twitter-image`/`images` нет — стоит проверить рендер карточки.
- **Почему важно:** social CTR при шеринге.
- **Как чинить:** проверить карточку валидатором; при необходимости задать
  `twitter.images` явно.

### M5. Нет публичных trust-страниц `/security/`, `/ai-processing/`, `/data-deletion/`
- **Где:** есть только `/privacy`, `/terms`.
- **Что:** стратегия и брифы ссылаются на `/security/`, `/ai-processing/`,
  `/data-deletion/`, `/how-secure-sharing-works/` — их нет.
- **Почему важно:** для продукта с паспортами/медкартами trust-контент — часть
  E-E-A-T и конверсии; на него ссылаются почти все брифы.
- **Как чинить:** создать эти страницы (индексируемые), внести в sitemap, честно
  описать хранение/RLS/signed-links/AI-обработку/удаление (см. ограничения в
  `docs/seo/page-briefs.md`).

---

## 🟢 Low — мелочи / на потом

- **L1.** `sitemap.ts`: `changeFrequency`/`priority` Google почти игнорирует —
  можно оставить, но не закладываться на них.
- **L2.** Нет CSP-заголовка (`Content-Security-Policy`) — это безопасность, не SEO,
  но усиливает trust-нарратив.
- **L3.** `manifest.start_url: "/my"` ведёт в приватный кабинет — для PWA норм,
  но это не публичная посадочная; на индексацию не влияет.
- **L4.** Нет `app/not-found.tsx`/`error.tsx` кастомных (проверить 404/500 UX) —
  битые ссылки кластера должны отдавать корректный 404.

---

## Рекомендованный порядок внедрения

**Спринт 0 (срочно, приватность):** C1, C2, H1, H2 — закрыть утечку приватных
страниц из индекса. Маленький диф, высокий риск-эффект. Можно сделать сразу.

**Спринт 1 (фундамент новых страниц):** M1 (канонизация хоста/слешей), M5
(trust-страницы), H3 (sitemap: lastModified + готовность к новым URL), M2/M4
(schema/og на лендингах). Это подготавливает почву под money-страницы из брифов.

**Спринт 2 (мультиязычность, крупная задача):** C3 + H4 + H3(hreflang) —
path-based локали `/en /ru /id /uz`, hreflang + x-default, редиректы со старых
URL, per-locale sitemap. Делать отдельно и аккуратно.

**Спринт 3 (контент):** создание 15 money/compare/checklist-страниц по
`docs/seo/page-briefs.md` (после ответов бизнеса на 7 открытых вопросов).

> Примечание: пункты C1, C2, H1, H2 безопасно реализовать немедленно и без
> изменения визуального стиля — это metadata/robots/headers.
