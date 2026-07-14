import type { CapacitorConfig } from "@capacitor/cli";

// =====================================================================
// Capacitor — нативная iOS-обёртка для doki.help.
//
// Приложение серверное (Next.js SSR + Supabase-auth), поэтому статический
// экспорт невозможно — WebView грузит ЖИВОЙ сайт (server.url). Нативную
// ценность (Apple 4.2) даёт не сам WebView, а плагины: Face ID-замок,
// APNs-push, нативная камера/сканер, статус-бар/сплэш. Их мост инициализирует
// lib/native.ts, срабатывая только внутри нативного рантайма.
//
// appId должен совпадать с Bundle ID в App Store Connect. Меняется здесь и в
// Xcode (target → Signing). appId/appName см. docs/app-store/RUNBOOK.md.
// =====================================================================

const PROD_URL = process.env.CAP_SERVER_URL || "https://www.doki.help";

const config: CapacitorConfig = {
  appId: "help.doki.app",
  appName: "doki.help",
  // Метка в User-Agent: сервер по ней узнаёт нативную обёртку и НЕ отдаёт ей
  // сторонние аналитики (Яндекс.Метрика/PostHog) — чтобы в App Privacy честно
  // отвечать «Not used to track». См. lib/isNativeRequest.ts.
  appendUserAgent: "dokiNativeApp",
  // Оффлайн-fallback (native/www/index.html). Живой контент грузится с server.url.
  webDir: "native/www",
  ios: {
    // Ссылки внутри WebView открываются по https-схеме.
    scheme: "doki.help",
    contentInset: "always",
    backgroundColor: "#f9f5f0",
    // Разрешаем свайп-назад/вперёд как в Safari.
    allowsLinkPreview: false,
  },
  server: {
    // Грузим прод-сайт. Для локальной отладки переопределяется CAP_SERVER_URL.
    url: PROD_URL,
    // Домены, на которые WebView может уходить, оставаясь в приложении
    // (OAuth Google, Supabase). Остальные внешние ссылки — в системный браузер.
    allowNavigation: [
      "www.doki.help",
      "doki.help",
      "*.supabase.co",
      "accounts.google.com",
      "*.google.com",
      "*.gstatic.com",
    ],
    iosScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, // прячем вручную после первой отрисовки (lib/native.ts)
      backgroundColor: "#f9f5f0",
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
