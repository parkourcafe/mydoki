"use client";

import { Capacitor } from "@capacitor/core";

// =====================================================================
// Мост нативных возможностей iOS-обёртки (Capacitor). Всё здесь — no-op в
// вебе: функции проверяют Capacitor.isNativePlatform() и просто выходят.
// Нативные плагины подгружаются динамически, чтобы не утяжелять веб-бандл.
//
// Даёт приложению нативную ценность поверх WebView (Apple Guideline 4.2):
//  · статус-бар и сплэш под тему бренда;
//  · APNs-push (токен уходит на /api/native/push-token);
//  · Face ID / Touch ID замок хранилища (см. components/NativeGate.tsx);
//  · нативная камера/сканер документов (см. captureDocument).
// =====================================================================

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export function nativePlatform(): string {
  return Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
}

/** Инициализация нативной оболочки: статус-бар, скрытие сплэша, push. */
export async function initNativeShell(): Promise<void> {
  if (!isNativeApp()) return;

  // Помечаем корень — на случай нативно-специфичных стилей в CSS.
  document.documentElement.classList.add("capacitor-native");

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    // Верх приложения — светлый кремовый фон, поэтому тёмный текст статус-бара.
    // Не overlay: WebView отступает под статус-бар через ios.contentInset:'always'.
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {
    /* статус-бар недоступен — не критично */
  }

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* noop */
  }

  // Регистрируем push в фоне — не блокируем старт.
  void registerPush();
}

/** APNs: запрос разрешения, регистрация, отправка токена на бэкенд. */
export async function registerPush(): Promise<void> {
  // Android push is not shipped in RuStore v1: there is no configured FCM
  // sender yet, so asking for notifications would be misleading.
  if (!isNativeApp() || nativePlatform() !== "ios") return;
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    const perm = await PushNotifications.checkPermissions();
    let status = perm.receive;
    if (status === "prompt" || status === "prompt-with-rationale") {
      status = (await PushNotifications.requestPermissions()).receive;
    }
    if (status !== "granted") return;

    await PushNotifications.removeAllListeners();
    await PushNotifications.addListener("registration", (token) => {
      // Токен APNs — отправляем на сервер под текущего пользователя.
      void fetch("/api/native/push-token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token: token.value,
          platform: nativePlatform(),
        }),
        keepalive: true,
      }).catch(() => {});
    });
    await PushNotifications.addListener("registrationError", () => {
      /* тихо игнорируем — не блокирует работу приложения */
    });

    await PushNotifications.register();
  } catch {
    /* плагин недоступен — приложение работает без push */
  }
}

/**
 * Face ID / Touch ID для замка хранилища. Возвращает true, если проверка
 * пройдена ИЛИ биометрия недоступна (не запираем пользователя снаружи).
 */
export async function unlockWithBiometrics(reason: string): Promise<boolean> {
  if (!isNativeApp()) return true;
  try {
    const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth");
    const info = await BiometricAuth.checkBiometry();
    if (!info.isAvailable) return true; // нет биометрии — не блокируем
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: "Cancel",
      allowDeviceCredential: true,
      iosFallbackTitle: "Use passcode",
    });
    return true; // authenticate бросает исключение при неуспехе
  } catch {
    return false;
  }
}

/**
 * Нативный захват документа камерой (для загрузки в хранилище). Возвращает
 * dataURL или null. На вебе возвращает null — там работает обычный <input file>.
 */
export async function captureDocument(): Promise<string | null> {
  if (!isNativeApp()) return null;
  try {
    const { Camera, CameraResultType, CameraSource } = await import(
      "@capacitor/camera"
    );
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // камера или галерея на выбор
      correctOrientation: true,
    });
    return photo.dataUrl ?? null;
  } catch {
    return null;
  }
}
