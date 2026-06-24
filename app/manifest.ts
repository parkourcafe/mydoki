import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "doki.help — семейный архив документов",
    short_name: "doki.help",
    description:
      "Все важные документы вашей семьи — в одном защищённом месте.",
    start_url: "/my",
    scope: "/",
    display: "standalone",
    background_color: "#f9f5f0",
    theme_color: "#b85c38",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
