const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

// Link-заголовок главной для обнаружения агентами (RFC 8288): где взять
// markdown-описание сайта (service-doc) и индекс навыков (describedby).
const agentLinkHeader = [
  {
    key: "Link",
    value:
      '</agents.md>; rel="service-doc"; type="text/markdown", </.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"',
  },
];

// Приватные/служебные маршруты: страховочный X-Robots-Tag на уровне заголовка.
// Надёжнее meta-тега (срабатывает и для клиентских страниц, и для route-
// handler'ов), и покрывает signed/invite токен-URL.
const noindexHeader = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
const NOINDEX_SOURCES = [
  "/s/:path*",
  "/invite/:path*",
  "/saved",
  "/offline",
  "/auth/:path*",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/", headers: agentLinkHeader },
      ...NOINDEX_SOURCES.map((source) => ({ source, headers: noindexHeader })),
    ];
  },
};

// T7: анализатор бандла. Включается только при ANALYZE=true (`npm run analyze`),
// в обычной сборке — no-op, без веса в проде.
const withBundleAnalyzer = (await import("@next/bundle-analyzer")).default({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

export default withBundleAnalyzer(nextConfig);
