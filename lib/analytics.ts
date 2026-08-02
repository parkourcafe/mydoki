import posthog from "posthog-js";

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
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: false, // ловим переходы вручную (App Router)
    capture_pageleave: true,
    autocapture: true,
    persistence: "localStorage+cookie",
  });
}

// Жёсткое правило приватности (§2.1): в свойства событий НЕ попадают
// имя/телефон/email/токены — только ID и безопасные метки. Ключи с такими
// именами вырезаются как страховка, даже если их случайно передали.
const PII_KEY = /name|whats?app|phone|email|token|consent/i;
type Props = Record<string, string | number | boolean | null | undefined>;

export function track(event: string, props?: Props) {
  if (typeof window === "undefined" || !started) return;
  const clean: Props = {};
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (PII_KEY.test(k)) continue;
      if (v !== undefined) clean[k] = v;
    }
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
  if (typeof window === "undefined" || !started) return;
  try {
    if (enabled) posthog.opt_in_capturing();
    else posthog.opt_out_capturing();
  } catch {
    /* noop */
  }
}

export function pageview() {
  if (typeof window === "undefined" || !started) return;
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
  if (typeof window === "undefined" || !started || !userId) return;
  const clean: Props = {};
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (PII_KEY.test(k)) continue;
      if (v !== undefined) clean[k] = v;
    }
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
  if (typeof window === "undefined" || !started) return;
  try {
    posthog.reset();
  } catch {
    /* noop */
  }
}
