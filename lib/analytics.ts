// PostHog грузится ленивым импортом: библиотека большая, а на публичных
// страницах (например, отклик на вакансию) она не нужна для первого экрана.
// Статический импорт затаскивал её в First Load JS всем, кто просто зовёт
// track() — теперь она приезжает после initPostHog(), уже после гидрации.
type PostHog = typeof import("posthog-js").default;
let posthog: PostHog | null = null;

// То, что случилось до приезда библиотеки, не теряем и не выполняем «мимо»
// настроек приватности: желаемое состояние держим здесь и применяем сразу
// после init — иначе автозахват успел бы поработать на приватном маршруте.
const queue: { event: string; props: Props }[] = [];
const QUEUE_LIMIT = 20;
let captureEnabled = true;
let pendingPageview = false;
let pendingIdentify: { userId: string; props: Props } | null = null;

// Ключ проекта — только из окружения. Без него аналитика просто не
// инициализируется (initPostHog() ниже это учитывает), никакого дефолтного
// проекта в исходнике не зашито.
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let started = false;

export function initPostHog() {
  if (started || typeof window === "undefined" || !KEY) return;
  started = true;
  void import("posthog-js")
    .then((mod) => {
      posthog = mod.default;
      posthog.init(KEY, {
        api_host: HOST,
        capture_pageview: false, // ловим переходы вручную (App Router)
        capture_pageleave: true,
        autocapture: true,
        persistence: "localStorage+cookie",
      });
      // Приватность — первым делом, до любого захвата.
      if (!captureEnabled) posthog.opt_out_capturing();
      if (pendingIdentify) {
        posthog.identify(pendingIdentify.userId, pendingIdentify.props);
        pendingIdentify = null;
      }
      if (pendingPageview) {
        pendingPageview = false;
        if (captureEnabled) posthog.capture("$pageview");
      }
      for (const item of queue.splice(0)) {
        try {
          posthog.capture(item.event, item.props);
        } catch {
          /* noop */
        }
      }
    })
    .catch(() => {
      // Не доехала — аналитики просто нет, продукт работает как обычно.
      started = false;
      queue.length = 0;
    });
}

// Жёсткое правило приватности (§2.1): в свойства событий НЕ попадают
// имя/телефон/email/токены — только ID и безопасные метки. Ключи с такими
// именами вырезаются как страховка, даже если их случайно передали.
const PII_KEY = /name|whats?app|phone|email|token|consent/i;
type Props = Record<string, string | number | boolean | null | undefined>;

export function track(event: string, props?: Props) {
  if (typeof window === "undefined" || !started) return; // аналитика выключена
  const clean: Props = {};
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (PII_KEY.test(k)) continue;
      if (v !== undefined) clean[k] = v;
    }
  }
  if (!posthog) {
    if (queue.length < QUEUE_LIMIT) queue.push({ event, props: clean });
    return;
  }
  try {
    posthog.capture(event, clean);
  } catch {
    /* аналитика не должна ломать основной поток */
  }
}

// Toggle PostHog capture (including autocapture) for the current path — the
// SDK's global click/pageview listeners keep running across SPA navigation,
// so entering a private route (real document/candidate data in the DOM) must
// explicitly opt out, not just skip calling track()/pageview() there.
export function setCaptureEnabled(enabled: boolean) {
  captureEnabled = enabled;
  if (typeof window === "undefined" || !posthog) return;
  try {
    if (enabled) posthog.opt_in_capturing();
    else posthog.opt_out_capturing();
  } catch {
    /* noop */
  }
}

export function pageview() {
  if (typeof window === "undefined") return;
  if (!posthog) {
    pendingPageview = started;
    return;
  }
  try {
    posthog.capture("$pageview");
  } catch {
    /* noop */
  }
}

// Связываем анонимную сессию со стабильным ID пользователя (auth.users.id).
// Это разблокирует ретеншн/воронки/когорты «по пользователю» в PostHog.
// В свойства персоны НЕ кладём PII — только безопасные метки (та же страховка,
// что и в track): ключи вроде name/email/phone/token вырезаются.
export function identify(userId: string, props?: Props) {
  if (typeof window === "undefined" || !userId) return;
  const clean: Props = {};
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (PII_KEY.test(k)) continue;
      if (v !== undefined) clean[k] = v;
    }
  }
  if (!posthog) {
    if (started) pendingIdentify = { userId, props: clean };
    return;
  }
  try {
    posthog.identify(userId, clean);
  } catch {
    /* аналитика не должна ломать основной поток */
  }
}

// Сброс идентификации при выходе — следующая сессия снова анонимна и не
// «склеивается» с предыдущим пользователем на общем устройстве.
export function resetIdentity() {
  if (typeof window === "undefined" || !posthog) return;
  try {
    posthog.reset();
  } catch {
    /* noop */
  }
}
