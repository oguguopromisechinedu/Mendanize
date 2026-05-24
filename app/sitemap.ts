import type { MetadataRoute } from "next";
import { aiTools } from "@/lib/tools/registry";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mendanize.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/pricing",
    "/tools",
    "/learn",
    "/sign-in",
    "/sign-up",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const toolRoutes = aiTools.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...toolRoutes];
}
