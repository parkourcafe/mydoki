"use client";

import { useEffect } from "react";

/**
 * Границы ошибок сегмента: любое исключение при рендере страницы (в т.ч. в
 * серверных компонентах) показывает дружелюбный экран с кнопкой «повторить»
 * вместо сырого «Application error … Digest». Важно для App Store-ревью и для
 * доверия пользователя. Digest выводим мелко — по нему находим стек в логах.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Отправляем в консоль (и в PostHog, если инициализирован) для диагностики.
    // eslint-disable-next-line no-console
    console.error("Route error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "24px",
        textAlign: "center",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        color: "#2c2522",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "#b85c38",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 30,
        }}
        aria-hidden="true"
      >
        ⚠️
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
        Something went wrong / Что-то пошло не так
      </h1>
      <p style={{ color: "#8a7c6d", fontSize: 15, maxWidth: 360, margin: 0 }}>
        Please try again. If it keeps happening, reload the page.
        <br />
        Попробуйте ещё раз. Если повторяется — перезагрузите страницу.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => reset()}
          style={{
            border: 0,
            borderRadius: 999,
            padding: "12px 24px",
            background: "#b85c38",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again / Повторить
        </button>
        <a
          href="/"
          style={{
            borderRadius: 999,
            padding: "12px 24px",
            border: "1px solid #d4c9b8",
            color: "#2c2522",
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Home / На главную
        </a>
      </div>
      {error.digest && (
        <p style={{ color: "#c9beb0", fontSize: 12, marginTop: 8 }}>
          Ref: {error.digest}
        </p>
      )}
    </div>
  );
}
