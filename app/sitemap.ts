import type { MetadataRoute } from "next";

import { buildSitemapEntries } from "@/services/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await buildSitemapEntries();
  return entries.map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
