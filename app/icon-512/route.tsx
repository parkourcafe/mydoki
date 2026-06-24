import { ImageResponse } from "next/og";

export function GET() {
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
          fontSize: 320,
          fontWeight: 800,
        }}
      >
        d
      </div>
    ),
    { width: 512, height: 512 }
  );
}
