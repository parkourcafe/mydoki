import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "doki.help — Brankas Dokumen Keluarga",
    short_name: "doki.help",
    description:
      "Simpan dokumen penting keluarga, kerja, perjalanan, dan tenggat dalam satu tempat aman.",
    start_url: "/id",
    scope: "/",
    lang: "id",
    dir: "ltr",
    display: "standalone",
    orientation: "portrait-primary",
    categories: ["productivity"],
    background_color: "#f9f5f0",
    theme_color: "#b85c38",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
