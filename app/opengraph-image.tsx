import { ImageResponse } from "next/og";
import { getLocale, type Locale } from "@/lib/i18n";

export const alt = "doki.help — candidate and employee documents with one link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ASCII-safe per locale (uz avoids the "ʻ"/"ʼ" modifier letters — not
// guaranteed present in the default renderer font).
const COPY: Record<Locale, { tagline: string; tags: string }> = {
  ru: {
    tagline: "Документы кандидатов и сотрудников — по одной ссылке",
    tags: "KTP  ·  CV  ·  Справки  ·  Онбординг",
  },
  en: {
    tagline: "Candidate and employee documents with one link",
    tags: "KTP  ·  CV  ·  Certificates  ·  Onboarding",
  },
  id: {
    tagline: "Dokumen kandidat dan karyawan lewat satu link",
    tags: "KTP  ·  CV  ·  Sertifikat  ·  Onboarding",
  },
  uz: {
    tagline: "Nomzod va xodim hujjatlari — bitta havola bilan",
    tags: "KTP  ·  CV  ·  Sertifikatlar  ·  Onboarding",
  },
};

/**
 * next/og's default renderer only ships Latin glyphs, so Cyrillic (ru) needs
 * an explicit font fetch. If that fetch fails for any reason (network hiccup,
 * Google Fonts unreachable), we fall back to the English copy below rather
 * than let the whole OG image request error out.
 */
async function loadCyrillicFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Inter:wght@800&text=${encodeURIComponent(text)}`,
        {
          headers: {
            // Old-browser UA — Google Fonts serves a .ttf (not .woff2) to it,
            // which the OG image renderer can load directly.
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
          },
        }
      )
    ).text();
    const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const locale = await getLocale();
  let copy = COPY[locale];
  let fonts: { name: string; data: ArrayBuffer; style: "normal" }[] | undefined;

  if (locale === "ru") {
    const fontData = await loadCyrillicFont(`doki.help ${copy.tagline} ${copy.tags}`);
    if (fontData) {
      fonts = [{ name: "Inter", data: fontData, style: "normal" }];
    } else {
      copy = COPY.en; // graceful fallback — image must never fail to render
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f9f5f0 0%, #f1e7dc 100%)",
          fontFamily: fonts ? "Inter" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 104,
            fontWeight: 800,
            color: "#b85c38",
            letterSpacing: -2,
          }}
        >
          doki.help
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 40,
            color: "#5c5248",
          }}
        >
          {copy.tagline}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 28,
            color: "#8a7d70",
            letterSpacing: 1,
          }}
        >
          {copy.tags}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
