import { NextResponse } from "next/server";

// T10 — Digital Asset Links для TWA (Trusted Web Activity в Google Play).
// Подтверждает, что Android-приложение и домен doki.help принадлежат одному
// владельцу → у приложения убирается адресная строка браузера.
//
// Значения приходят из env (не хардкодим — отпечаток появляется только после
// сборки/подписи в Play Console):
//   TWA_PACKAGE_NAME              — напр. help.doki.twa
//   TWA_SHA256_CERT_FINGERPRINTS  — SHA-256 отпечаток(ки) подписи, через запятую
//     (обычно два: твой upload-ключ и ключ Google Play App Signing).
//
// Пока env не заданы — отдаём пустой массив [] (валидный JSON, verification
// просто не проходит — это ок до публикации). См. twa/README.md.

export const dynamic = "force-dynamic";

export async function GET() {
  const pkg = process.env.TWA_PACKAGE_NAME?.trim();
  const fingerprints = (process.env.TWA_SHA256_CERT_FINGERPRINTS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const body =
    pkg && fingerprints.length
      ? [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
              namespace: "android_app",
              package_name: pkg,
              sha256_cert_fingerprints: fingerprints,
            },
          },
        ]
      : [];

  return NextResponse.json(body, {
    headers: { "cache-control": "public, max-age=300" },
  });
}
