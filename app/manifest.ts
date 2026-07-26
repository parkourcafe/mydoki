import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "doki.help — Dokumen Kandidat & Karyawan",
    short_name: "doki.help",
    description:
      "Kumpulkan dokumen kandidat dan karyawan lewat satu link, pantau kelengkapan, dan kurangi chat berantakan.",
    start_url: "/id",
    scope: "/",
    lang: "id",
    dir: "ltr",
    display: "standalone",
    orientation: "portrait-primary",
    categories: ["productivity", "business"],
    background_color: "#f9f5f0",
    theme_color: "#b85c38",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
