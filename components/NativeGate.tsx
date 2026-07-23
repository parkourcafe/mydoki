"use client";

import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { isNativeApp, initNativeShell, unlockWithBiometrics } from "@/lib/native";

// Порог, после которого повторно запрашиваем биометрию при возврате из фона.
const RELOCK_AFTER_MS = 60_000;
const REASON = "Unlock doki.help to see your documents";

/**
 * Инициализирует нативную оболочку на iOS и Android. Биометрический замок
 * пока включён только на iOS: RuStore v1 должен открывать форму входа даже
 * на устройствах без доступной или настроенной биометрии.
 */
export default function NativeGate() {
  const native = isNativeApp();
  const biometricGateEnabled = native && Capacitor.getPlatform() === "ios";
  const [locked, setLocked] = useState(biometricGateEnabled);
  const [checking, setChecking] = useState(false);
  const backgroundedAt = useRef<number | null>(null);

  async function tryUnlock() {
    if (checking) return;
    setChecking(true);
    const ok = await unlockWithBiometrics(REASON);
    if (ok) setLocked(false);
    setChecking(false);
  }

  useEffect(() => {
    if (!native) return;
    void initNativeShell();

    if (!biometricGateEnabled) {
      setLocked(false);
      return;
    }

    void tryUnlock();

    let remove: (() => void) | undefined;
    (async () => {
      try {
        const { App } = await import("@capacitor/app");
        const handle = await App.addListener("appStateChange", ({ isActive }) => {
          if (!isActive) {
            backgroundedAt.current = Date.now();
            return;
          }
          const since = backgroundedAt.current;
          if (since !== null && Date.now() - since > RELOCK_AFTER_MS) {
            setLocked(true);
            void tryUnlock();
          }
        });
        remove = () => void handle.remove();
      } catch {
        /* @capacitor/app недоступен — пропускаем relock-на-resume */
      }
    })();

    return () => remove?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [native, biometricGateEnabled]);

  if (!biometricGateEnabled || !locked) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-[#f9f5f0] px-6 text-center"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#b85c38] text-white">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-semibold text-[#2c2522]">doki.help</p>
        <p className="mt-1 text-sm text-[#8a7c6d]">Locked for your privacy</p>
      </div>
      <button
        type="button"
        onClick={tryUnlock}
        disabled={checking}
        className="rounded-full bg-[#b85c38] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {checking ? "Unlocking…" : "Unlock"}
      </button>
    </div>
  );
}
