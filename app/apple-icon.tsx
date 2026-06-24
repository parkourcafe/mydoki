import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#b85c38",
          color: "#ffffff",
          fontSize: 112,
          fontWeight: 800,
        }}
      >
        d
      </div>
    ),
    { ...size }
  );
}
