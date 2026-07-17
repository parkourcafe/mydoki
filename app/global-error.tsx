"use client";

/**
 * Последняя линия обороны: ловит исключения даже в корневом layout (когда
 * обычный error.tsx уже недоступен). Обязан рендерить собственные <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          background: "#f9f5f0",
          color: "#2c2522",
          fontFamily: "system-ui, -apple-system, sans-serif",
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
          Something went wrong
        </h1>
        <p style={{ color: "#8a7c6d", fontSize: 15, maxWidth: 360, margin: 0 }}>
          Please try again or reload the page.
        </p>
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
          Try again
        </button>
        {error.digest && (
          <p style={{ color: "#c9beb0", fontSize: 12 }}>Ref: {error.digest}</p>
        )}
      </body>
    </html>
  );
}
