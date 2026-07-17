import type { CapacitorConfig } from "@capacitor/cli";

// =====================================================================
// Capacitor — нативные iOS/Android-обёртки для doki.help.
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
const APP_ID = process.env.CAP_APP_ID || "help.doki.app";
const APP_NAME = process.env.CAP_APP_NAME || "doki.help";
const USER_AGENT = process.env.CAP_USER_AGENT || "dokiNativeApp";
const RUSTORE = process.env.CAP_RUSTORE === "true";

function serverHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "www.doki.help";
  }
}

const config: CapacitorConfig = {
  appId: APP_ID,
  appName: APP_NAME,
  // Метка в User-Agent: сервер по ней узнаёт нативную обёртку и НЕ отдаёт ей
  // сторонние аналитики (Яндекс.Метрика/PostHog) — чтобы в App Privacy честно
  // отвечать «Not used to track». См. lib/isNativeRequest.ts.
  appendUserAgent: USER_AGENT,
  includePlugins: RUSTORE
    ? [
        "@aparajita/capacitor-biometric-auth",
        "@capacitor/app",
        "@capacitor/camera",
        "@capacitor/preferences",
        "@capacitor/splash-screen",
        "@capacitor/status-bar",
      ]
    : undefined,
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
  android: {
    backgroundColor: "#f9f5f0",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.CAP_ANDROID_DEBUG === "true",
  },
  server: {
    // Грузим прод-сайт. Для локальной отладки переопределяется CAP_SERVER_URL.
    url: PROD_URL,
    // RuStore-сборка использует вход по email и не разрешает навигацию WebView
    // на OAuth-домены. Сетевые API-запросы этим списком не ограничиваются.
    allowNavigation: RUSTORE
      ? [serverHost(PROD_URL)]
      : [
          "www.doki.help",
          "doki.help",
          "*.supabase.co",
          "accounts.google.com",
          "*.google.com",
          "*.gstatic.com",
        ],
    iosScheme: "https",
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, // прячем вручную после первой отрисовки (lib/native.ts)
      backgroundColor: "#f9f5f0",
      showSpinner: false,
    },
    ...(RUSTORE
      ? {}
      : {
          PushNotifications: {
            presentationOptions: ["badge", "sound", "alert"],
          },
        }),
  },
};

export default config;
