// robots.txt с явными правилами для ИИ-краулеров и сигналами об использовании
// контента (contentsignals.org). Чистая функция — рендерит app/robots.txt/route.ts
// и проверяют юнит-тесты.

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

// Исключения из PRIVATE: публичный markdown-обзор для ИИ-агентов, на который
// ведёт /llms.txt. Более длинное правило Allow побеждает Disallow: /api
// (RFC 9309, longest match). Краулеров обучения это не касается — они
// закрыты полностью (Content-Signal ai-train=no).
const PUBLIC_EXCEPTIONS = ["/api/md"];

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
    ...PUBLIC_EXCEPTIONS.map((p) => `Allow: ${p}`),
    ...PRIVATE.map((p) => `Disallow: ${p}`),
  ].join("\n");
}

export function buildRobotsTxt(appUrl: string): string {
  return [
    "# Семейный сейф doki.help — публичные страницы открыты, кабинет закрыт.",
    "",
    publicGroup(["*"]),
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
    `Sitemap: ${appUrl}/sitemap.xml`,
    `Host: ${appUrl}`,
    "",
  ].join("\n");
}
