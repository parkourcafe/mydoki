import { ImageResponse } from "next/og";

export const alt = "doki.help — candidate and employee documents with one link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Latin-only text so the default renderer needs no extra font bundle.
export default function Image() {
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
          fontFamily: "sans-serif",
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
          Candidate and employee documents with one link
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
          KTP  ·  CV  ·  Certificates  ·  Onboarding
        </div>
      </div>
    ),
    { ...size }
  );
}
