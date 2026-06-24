"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";

type Factor = { id: string; friendly_name?: string | null; status: string };

const M = {
  ru: {
    loading: "Загрузка…",
    enabled: "✓ Двухфакторная защита включена.",
    authenticatorApp: "Приложение-аутентификатор (TOTP)",
    remove: "Удалить",
    notConfigured:
      "2FA пока не настроена. Добавьте приложение-аутентификатор (Google Authenticator, 1Password, Authy и т.п.).",
    setup: "Настроить 2FA",
    scanQr: "Отсканируйте QR в приложении-аутентификаторе:",
    qrAlt: "QR для настройки 2FA",
    enterKey: "Или введите ключ вручную:",
    codeLabel: "Код из приложения",
    confirm: "Подтвердить",
  },
  en: {
    loading: "Loading…",
    enabled: "✓ Two-factor protection enabled.",
    authenticatorApp: "Authenticator app (TOTP)",
    remove: "Remove",
    notConfigured:
      "2FA isn't set up yet. Add an authenticator app (Google Authenticator, 1Password, Authy, etc.).",
    setup: "Set up 2FA",
    scanQr: "Scan the QR code in your authenticator app:",
    qrAlt: "QR code for 2FA setup",
    enterKey: "Or enter the key manually:",
    codeLabel: "Code from the app",
    confirm: "Confirm",
  },
} as const;

export default function MfaSetup({ locale }: { locale: Locale }) {
  const t = M[locale];
  const supabase = getSupabaseBrowser();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enroll, setEnroll] = useState<{
    factorId: string;
    qr: string;
    secret: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []) as Factor[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function startEnroll() {
    setError(null);
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `totp-${Date.now()}`,
    });
    setBusy(false);
    if (error) return setError(error.message);
    setEnroll({
      factorId: data.id,
      qr: data.totp.qr_code,
      secret: data.totp.secret,
    });
  }

  async function verify() {
    if (!enroll) return;
    setError(null);
    setBusy(true);
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({
      factorId: enroll.factorId,
    });
    if (chErr) {
      setBusy(false);
      return setError(chErr.message);
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: enroll.factorId,
      challengeId: ch.id,
      code: code.trim(),
    });
    setBusy(false);
    if (error) return setError(error.message);
    setEnroll(null);
    setCode("");
    await refresh();
  }

  async function remove(factorId: string) {
    setBusy(true);
    await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    await refresh();
  }

  const verified = factors.filter((f) => f.status === "verified");

  return (
    <div className="space-y-5">
      {loading ? (
        <p className="text-sm text-slate-400">{t.loading}</p>
      ) : verified.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-emerald-600">{t.enabled}</p>
          {verified.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <span>{t.authenticatorApp}</span>
              <button
                className="btn-danger"
                disabled={busy}
                onClick={() => remove(f.id)}
              >
                {t.remove}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{t.notConfigured}</p>
      )}

      {!enroll && verified.length === 0 && (
        <button className="btn-primary" disabled={busy} onClick={startEnroll}>
          {t.setup}
        </button>
      )}

      {enroll && (
        <div className="space-y-3 rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">{t.scanQr}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enroll.qr}
            alt={t.qrAlt}
            className="h-44 w-44"
          />
          <p className="text-xs text-slate-400">
            {t.enterKey}{" "}
            <code className="rounded bg-slate-100 px-1">{enroll.secret}</code>
          </p>
          <div className="flex items-end gap-2">
            <div>
              <label className="label">{t.codeLabel}</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                className="input"
                placeholder="123456"
              />
            </div>
            <button className="btn-primary" disabled={busy} onClick={verify}>
              {t.confirm}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
