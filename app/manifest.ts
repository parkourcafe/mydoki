import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "DOKI HELP: Employee Documents",
    short_name: "DOKI HELP",
    description:
      "Store and manage employee and candidate documents, expiry dates, requests, and controlled access.",
    start_url: "/my",
    scope: "/",
    lang: "en",
    dir: "ltr",
    display: "standalone",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    background_color: "#f9f5f0",
    theme_color: "#b85c38",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
