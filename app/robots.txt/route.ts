// robots.txt с явными правилами для ИИ-краулеров и сигналами об использовании
// контента (contentsignals.org). Стандартный MetadataRoute.Robots не умеет
// выводить директиву Content-Signal и группы под конкретных ИИ-ботов,
// поэтому отдаём текст вручную.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";

// Приватные и служебные маршруты — вне индекса для всех. Должны совпадать с
// реальными путями приложения: расшаренный документ — /s/ (не /share/),
// приглашение — /invite/, офлайн-копии — /saved, OAuth — /auth.
const PRIVATE = [
  "/my",
  "/api",
  "/login",
  "/reset-password",
  "/s/",
  "/invite/",
  "/saved",
  "/offline",
  "/auth",
];

// Краулеры, собирающие данные ТОЛЬКО для обучения моделей. Бренд про
// приватность семьи — обучать на нашем контенте не разрешаем.
const TRAINING_ONLY = [
  "GPTBot",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "CCBot",
  "Bytespider",
];

// ИИ-боты поиска и ассистентов: пускаем на публичные страницы, чтобы doki
// находился, когда у ассистента спрашивают про семейное хранилище документов.
const AI_SEARCH = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
];

function publicGroup(agents: string[]): string {
  return [
    ...agents.map((a) => `User-agent: ${a}`),
    "Allow: /",
    ...PRIVATE.map((p) => `Disallow: ${p}`),
  ].join("\n");
}

export function GET() {
  const body = [
    "# Семейный сейф doki.help — публичные страницы открыты, кабинет закрыт.",
    "",
    "User-agent: *",
    "Allow: /",
    ...PRIVATE.map((p) => `Disallow: ${p}`),
    "",
    "# Предпочтения по использованию контента ИИ (contentsignals.org):",
    "# индексировать в поиске — да; отвечать на вопросы (RAG) — да;",
    "# обучать модели на нашем контенте — нет.",
    "Content-Signal: search=yes, ai-input=yes, ai-train=no",
    "",
    "# Краулеры обучения моделей — полностью закрыты.",
    ...TRAINING_ONLY.map((a) => `User-agent: ${a}`),
    "Disallow: /",
    "",
    "# ИИ-боты поиска и ассистентов — как все: публичное можно, кабинет нельзя.",
    publicGroup(AI_SEARCH),
    "",
    `Sitemap: ${APP_URL}/sitemap.xml`,
    `Host: ${APP_URL}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // Кэшируем на сутки — содержимое статично.
      "cache-control": "public, max-age=86400",
    },
  });
}
