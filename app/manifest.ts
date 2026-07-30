import type { MetadataRoute } from "next";

/**
 * Web App Manifest — MES-050.
 * Learner-focused: start_url points to /account.
 * Admin /dashboard is not the install target.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mendanize",
    short_name: "Mendanize",
    description:
      "Learn modern technology through articles, guides, and AI tools — even offline.",
    start_url: "/account",
    scope: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#4f46e5",
    orientation: "portrait-primary",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
