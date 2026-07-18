/**
 * SEO Shared Service — MES-015 SEO Center + content metadata resolution.
 */

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { getArticleById, listArticlesAdmin } from "@/services/content/articles";
import { getGuideById, listGuidesAdmin } from "@/services/content/guides";
import {
  getCategoryById,
  getTopicById,
  listCategoriesAdmin,
  listTopicsAdmin,
} from "@/services/content/taxonomy";
import { getToolById, listToolsAdmin } from "@/services/content/tools";
import type {
  GlobalSEOSettingsRecord,
  GlobalSEOSettingsWrite,
  MetadataTemplateRecord,
  MetadataTemplateWrite,
  RedirectRecord,
  RedirectWrite,
  ResolvedMetadata,
  ResolveMetadataParams,
  RobotsRuleRecord,
  RobotsRuleWrite,
  SeoDashboardStats,
  SeoEntityTypeValue,
  SitemapConfigRecord,
  StructuredDataRecord,
} from "./types";

const SETTINGS_KEY = "main";

const nowIso = () => new Date().toISOString();

const DEFAULT_TEMPLATES: Array<Omit<MetadataTemplateRecord, "id" | "updatedAt">> =
  [
    {
      entityType: "ARTICLE",
      name: "Default article",
      titleTemplate: "{title} | {brand}",
      descriptionTemplate: "{title} — learn more on {brand}.",
      isDefault: true,
    },
    {
      entityType: "GUIDE",
      name: "Default guide",
      titleTemplate: "{title} Learning Guide | {brand}",
      descriptionTemplate: "Structured guide: {title} ({topic}).",
      isDefault: true,
    },
    {
      entityType: "AI_TOOL",
      name: "Default AI tool",
      titleTemplate: "{title} — AI Tool | {brand}",
      descriptionTemplate: "Educational profile for {title} on {brand}.",
      isDefault: true,
    },
    {
      entityType: "CATEGORY",
      name: "Default category",
      titleTemplate: "{title} | {brand}",
      descriptionTemplate: "Explore {title} on {brand}.",
      isDefault: true,
    },
    {
      entityType: "TOPIC",
      name: "Default topic",
      titleTemplate: "{title} · {category} | {brand}",
      descriptionTemplate: "{title} in {category} — {brand}.",
      isDefault: true,
    },
    {
      entityType: "HOMEPAGE",
      name: "Default homepage",
      titleTemplate: "{brand} — Learn technology with clarity",
      descriptionTemplate:
        "Educational articles, guides, and curated AI tools on {brand}.",
      isDefault: true,
    },
    {
      entityType: "PAGE",
      name: "Default page",
      titleTemplate: "{title} | {brand}",
      descriptionTemplate: "{title} — {brand} ({year}).",
      isDefault: true,
    },
  ];

const DEFAULT_SITEMAP: SeoEntityTypeValue[] = [
  "HOMEPAGE",
  "ARTICLE",
  "CATEGORY",
  "TOPIC",
  "GUIDE",
  "AI_TOOL",
  "PAGE",
];

const DEFAULT_STRUCTURED: Array<
  Omit<StructuredDataRecord, "id">
> = [
  {
    schemaType: "Organization",
    entityType: null,
    label: "Organization",
    jsonPreview: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Mendanize",
      url: "https://mendanize.com",
    },
    enabled: true,
    sortOrder: 0,
  },
  {
    schemaType: "WebSite",
    entityType: "HOMEPAGE",
    label: "Website",
    jsonPreview: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Mendanize",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://mendanize.com/search?q={search_term_string}",
      },
    },
    enabled: true,
    sortOrder: 1,
  },
  {
    schemaType: "Article",
    entityType: "ARTICLE",
    label: "Article",
    jsonPreview: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "{title}",
    },
    enabled: true,
    sortOrder: 2,
  },
  {
    schemaType: "Course",
    entityType: "GUIDE",
    label: "Guide",
    jsonPreview: {
      "@context": "https://schema.org",
      "@type": "Course",
      name: "{title}",
    },
    enabled: true,
    sortOrder: 3,
  },
  {
    schemaType: "SoftwareApplication",
    entityType: "AI_TOOL",
    label: "AI Tool",
    jsonPreview: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "{title}",
      applicationCategory: "EducationalApplication",
    },
    enabled: true,
    sortOrder: 4,
  },
  {
    schemaType: "BreadcrumbList",
    entityType: null,
    label: "Breadcrumb",
    jsonPreview: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [],
    },
    enabled: true,
    sortOrder: 5,
  },
];

const memory = {
  seeded: false,
  settings: null as GlobalSEOSettingsRecord | null,
  templates: [] as MetadataTemplateRecord[],
  redirects: [] as RedirectRecord[],
  robots: [] as RobotsRuleRecord[],
  sitemap: [] as SitemapConfigRecord[],
  structured: [] as StructuredDataRecord[],
};

function defaultSettings(): GlobalSEOSettingsRecord {
  return {
    id: "seo_settings_main",
    websiteTitle: "Mendanize",
    defaultMetaTitle: "Mendanize — Learn technology with clarity",
    defaultMetaDescription:
      "Educational articles, structured guides, and curated AI tools.",
    defaultOgImageUrl: null,
    defaultTwitterImageUrl: null,
    brandName: "Mendanize",
    siteLanguage: "en",
    canonicalDomain: "https://mendanize.com",
    defaultRobotsIndex: true,
    defaultRobotsFollow: true,
    faviconUrl: null,
    appleTouchIconUrl: null,
    updatedAt: nowIso(),
  };
}

function ensureMemory() {
  if (memory.seeded) return;
  memory.seeded = true;
  memory.settings = defaultSettings();
  memory.templates = DEFAULT_TEMPLATES.map((t, i) => ({
    ...t,
    id: `tmpl_${i}`,
    updatedAt: nowIso(),
  }));
  memory.redirects = [
    {
      id: "redir_1",
      sourcePath: "/blog",
      destination: "/articles",
      type: "PERMANENT_301",
      status: "ACTIVE",
      notes: "Legacy blog path",
      hitCount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];
  memory.robots = [
    {
      id: "robot_1",
      userAgent: "*",
      allowPath: "/",
      disallowPath: "/dashboard",
      sortOrder: 0,
      enabled: true,
    },
    {
      id: "robot_2",
      userAgent: "*",
      allowPath: null,
      disallowPath: "/api",
      sortOrder: 1,
      enabled: true,
    },
  ];
  memory.sitemap = DEFAULT_SITEMAP.map((entityType, i) => ({
    id: `sm_${entityType}`,
    entityType,
    included: entityType !== "PAGE",
    changefreq: entityType === "HOMEPAGE" ? "daily" : "weekly",
    priority: entityType === "HOMEPAGE" ? 1 : 0.7,
    lastRegeneratedAt: null,
  }));
  memory.structured = DEFAULT_STRUCTURED.map((s, i) => ({
    ...s,
    id: `sd_${i}`,
  }));
}

async function ensurePrismaSeed() {
  const prisma = getPrisma();
  const settings = await prisma.globalSEOSettings.findUnique({
    where: { key: SETTINGS_KEY },
  });
  if (!settings) {
    const d = defaultSettings();
    await prisma.globalSEOSettings.create({
      data: {
        key: SETTINGS_KEY,
        websiteTitle: d.websiteTitle,
        defaultMetaTitle: d.defaultMetaTitle,
        defaultMetaDescription: d.defaultMetaDescription,
        brandName: d.brandName,
        siteLanguage: d.siteLanguage,
        canonicalDomain: d.canonicalDomain,
        defaultRobotsIndex: d.defaultRobotsIndex,
        defaultRobotsFollow: d.defaultRobotsFollow,
      },
    });
  }

  const tmplCount = await prisma.metadataTemplate.count();
  if (tmplCount === 0) {
    await prisma.metadataTemplate.createMany({
      data: DEFAULT_TEMPLATES.map((t) => ({
        entityType: t.entityType,
        name: t.name,
        titleTemplate: t.titleTemplate,
        descriptionTemplate: t.descriptionTemplate,
        isDefault: t.isDefault,
      })),
    });
  }

  const smCount = await prisma.sitemapConfiguration.count();
  if (smCount === 0) {
    await prisma.sitemapConfiguration.createMany({
      data: DEFAULT_SITEMAP.map((entityType) => ({
        entityType,
        included: entityType !== "PAGE",
        changefreq: entityType === "HOMEPAGE" ? "daily" : "weekly",
        priority: entityType === "HOMEPAGE" ? 1 : 0.7,
      })),
    });
  }

  const sdCount = await prisma.structuredData.count();
  if (sdCount === 0) {
    await prisma.structuredData.createMany({
      data: DEFAULT_STRUCTURED.map((s) => ({
        schemaType: s.schemaType,
        entityType: s.entityType,
        label: s.label,
        jsonPreview: s.jsonPreview as object,
        enabled: s.enabled,
        sortOrder: s.sortOrder,
      })),
    });
  }

  const robotCount = await prisma.robotsRule.count();
  if (robotCount === 0) {
    await prisma.robotsRule.createMany({
      data: [
        {
          userAgent: "*",
          allowPath: "/",
          disallowPath: "/dashboard",
          sortOrder: 0,
        },
        {
          userAgent: "*",
          disallowPath: "/api",
          sortOrder: 1,
        },
      ],
    });
  }

  const redirCount = await prisma.redirect.count();
  if (redirCount === 0) {
    await prisma.redirect.create({
      data: {
        sourcePath: "/blog",
        destination: "/articles",
        type: "PERMANENT_301",
        notes: "Legacy blog path",
      },
    });
  }
}

function mapSettings(row: {
  id: string;
  websiteTitle: string;
  defaultMetaTitle: string | null;
  defaultMetaDescription: string | null;
  defaultOgImageUrl: string | null;
  defaultTwitterImageUrl: string | null;
  brandName: string;
  siteLanguage: string;
  canonicalDomain: string | null;
  defaultRobotsIndex: boolean;
  defaultRobotsFollow: boolean;
  faviconUrl: string | null;
  appleTouchIconUrl: string | null;
  updatedAt: Date;
}): GlobalSEOSettingsRecord {
  return {
    id: row.id,
    websiteTitle: row.websiteTitle,
    defaultMetaTitle: row.defaultMetaTitle,
    defaultMetaDescription: row.defaultMetaDescription,
    defaultOgImageUrl: row.defaultOgImageUrl,
    defaultTwitterImageUrl: row.defaultTwitterImageUrl,
    brandName: row.brandName,
    siteLanguage: row.siteLanguage,
    canonicalDomain: row.canonicalDomain,
    defaultRobotsIndex: row.defaultRobotsIndex,
    defaultRobotsFollow: row.defaultRobotsFollow,
    faviconUrl: row.faviconUrl,
    appleTouchIconUrl: row.appleTouchIconUrl,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getGlobalSEOSettings(): Promise<GlobalSEOSettingsRecord> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    return { ...memory.settings! };
  }
  await ensurePrismaSeed();
  const row = await getPrisma().globalSEOSettings.findUniqueOrThrow({
    where: { key: SETTINGS_KEY },
  });
  return mapSettings(row);
}

export async function updateGlobalSEOSettings(
  input: GlobalSEOSettingsWrite
): Promise<GlobalSEOSettingsRecord> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    memory.settings = {
      ...memory.settings!,
      ...input,
      updatedAt: nowIso(),
    };
    return { ...memory.settings };
  }
  await ensurePrismaSeed();
  const row = await getPrisma().globalSEOSettings.update({
    where: { key: SETTINGS_KEY },
    data: input,
  });
  return mapSettings(row);
}

export async function listMetadataTemplates(): Promise<MetadataTemplateRecord[]> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    return memory.templates.map((t) => ({ ...t }));
  }
  await ensurePrismaSeed();
  const rows = await getPrisma().metadataTemplate.findMany({
    orderBy: [{ entityType: "asc" }, { name: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    entityType: r.entityType,
    name: r.name,
    titleTemplate: r.titleTemplate,
    descriptionTemplate: r.descriptionTemplate,
    isDefault: r.isDefault,
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function upsertMetadataTemplate(
  input: MetadataTemplateWrite,
  id?: string
): Promise<MetadataTemplateRecord> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    if (id) {
      const idx = memory.templates.findIndex((t) => t.id === id);
      if (idx >= 0) {
        memory.templates[idx] = {
          ...memory.templates[idx],
          ...input,
          updatedAt: nowIso(),
        };
        return { ...memory.templates[idx] };
      }
    }
    const row: MetadataTemplateRecord = {
      id: `tmpl_${Date.now()}`,
      ...input,
      isDefault: input.isDefault ?? true,
      updatedAt: nowIso(),
    };
    memory.templates.push(row);
    return row;
  }
  await ensurePrismaSeed();
  const prisma = getPrisma();
  const row = id
    ? await prisma.metadataTemplate.update({
        where: { id },
        data: input,
      })
    : await prisma.metadataTemplate.create({ data: input });
  return {
    id: row.id,
    entityType: row.entityType,
    name: row.name,
    titleTemplate: row.titleTemplate,
    descriptionTemplate: row.descriptionTemplate,
    isDefault: row.isDefault,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteMetadataTemplate(id: string): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    const before = memory.templates.length;
    memory.templates = memory.templates.filter((t) => t.id !== id);
    return memory.templates.length < before;
  }
  await getPrisma().metadataTemplate.delete({ where: { id } });
  return true;
}

/** Apply template placeholders: {title}, {category}, {topic}, {brand}, {year}. */
export function applyMetadataTemplate(
  template: string,
  vars: Record<string, string | undefined | null>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    if (key === "year") return String(new Date().getFullYear());
    return vars[key] ?? "";
  });
}

export async function listRedirects(): Promise<RedirectRecord[]> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    return memory.redirects.map((r) => ({ ...r }));
  }
  await ensurePrismaSeed();
  const rows = await getPrisma().redirect.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    sourcePath: r.sourcePath,
    destination: r.destination,
    type: r.type,
    status: r.status,
    notes: r.notes,
    hitCount: r.hitCount,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function upsertRedirect(
  input: RedirectWrite,
  id?: string
): Promise<RedirectRecord> {
  const sourcePath = input.sourcePath.startsWith("/")
    ? input.sourcePath
    : `/${input.sourcePath}`;
  if (!isDatabaseConfigured()) {
    ensureMemory();
    if (id) {
      const idx = memory.redirects.findIndex((r) => r.id === id);
      if (idx >= 0) {
        memory.redirects[idx] = {
          ...memory.redirects[idx],
          ...input,
          sourcePath,
          updatedAt: nowIso(),
        };
        return { ...memory.redirects[idx] };
      }
    }
    const row: RedirectRecord = {
      id: `redir_${Date.now()}`,
      sourcePath,
      destination: input.destination,
      type: input.type ?? "PERMANENT_301",
      status: input.status ?? "ACTIVE",
      notes: input.notes ?? null,
      hitCount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    memory.redirects.unshift(row);
    return row;
  }
  await ensurePrismaSeed();
  const prisma = getPrisma();
  const row = id
    ? await prisma.redirect.update({
        where: { id },
        data: { ...input, sourcePath },
      })
    : await prisma.redirect.create({
        data: {
          sourcePath,
          destination: input.destination,
          type: input.type ?? "PERMANENT_301",
          status: input.status ?? "ACTIVE",
          notes: input.notes ?? null,
        },
      });
  return {
    id: row.id,
    sourcePath: row.sourcePath,
    destination: row.destination,
    type: row.type,
    status: row.status,
    notes: row.notes,
    hitCount: row.hitCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteRedirect(id: string): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    const before = memory.redirects.length;
    memory.redirects = memory.redirects.filter((r) => r.id !== id);
    return memory.redirects.length < before;
  }
  await getPrisma().redirect.delete({ where: { id } });
  return true;
}

export async function listRobotsRules(): Promise<RobotsRuleRecord[]> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    return memory.robots.map((r) => ({ ...r }));
  }
  await ensurePrismaSeed();
  const rows = await getPrisma().robotsRule.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    userAgent: r.userAgent,
    allowPath: r.allowPath,
    disallowPath: r.disallowPath,
    sortOrder: r.sortOrder,
    enabled: r.enabled,
  }));
}

export async function replaceRobotsRules(
  rules: RobotsRuleWrite[]
): Promise<RobotsRuleRecord[]> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    memory.robots = rules.map((r, i) => ({
      id: `robot_${i}_${Date.now()}`,
      userAgent: r.userAgent ?? "*",
      allowPath: r.allowPath ?? null,
      disallowPath: r.disallowPath ?? null,
      sortOrder: r.sortOrder ?? i,
      enabled: r.enabled ?? true,
    }));
    return memory.robots.map((x) => ({ ...x }));
  }
  await ensurePrismaSeed();
  const prisma = getPrisma();
  await prisma.robotsRule.deleteMany();
  await prisma.robotsRule.createMany({
    data: rules.map((r, i) => ({
      userAgent: r.userAgent ?? "*",
      allowPath: r.allowPath ?? null,
      disallowPath: r.disallowPath ?? null,
      sortOrder: r.sortOrder ?? i,
      enabled: r.enabled ?? true,
    })),
  });
  return listRobotsRules();
}

export function buildRobotsTxt(
  rules: RobotsRuleRecord[],
  sitemapUrl?: string | null
): string {
  const lines: string[] = [];
  const byAgent = new Map<string, RobotsRuleRecord[]>();
  for (const r of rules.filter((x) => x.enabled)) {
    const list = byAgent.get(r.userAgent) ?? [];
    list.push(r);
    byAgent.set(r.userAgent, list);
  }
  for (const [agent, list] of byAgent) {
    lines.push(`User-agent: ${agent}`);
    for (const r of list.sort((a, b) => a.sortOrder - b.sortOrder)) {
      if (r.allowPath) lines.push(`Allow: ${r.allowPath}`);
      if (r.disallowPath) lines.push(`Disallow: ${r.disallowPath}`);
    }
    lines.push("");
  }
  if (sitemapUrl) lines.push(`Sitemap: ${sitemapUrl}`);
  return lines.join("\n").trim() + "\n";
}

export async function listSitemapConfigs(): Promise<SitemapConfigRecord[]> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    return memory.sitemap.map((s) => ({ ...s }));
  }
  await ensurePrismaSeed();
  const rows = await getPrisma().sitemapConfiguration.findMany({
    orderBy: { entityType: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    entityType: r.entityType,
    included: r.included,
    changefreq: r.changefreq,
    priority: r.priority,
    lastRegeneratedAt: r.lastRegeneratedAt?.toISOString() ?? null,
  }));
}

export async function updateSitemapConfig(
  entityType: SeoEntityTypeValue,
  input: Partial<Pick<SitemapConfigRecord, "included" | "changefreq" | "priority">>
): Promise<SitemapConfigRecord> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    const row = memory.sitemap.find((s) => s.entityType === entityType);
    if (!row) throw new Error("Sitemap config not found");
    Object.assign(row, input);
    return { ...row };
  }
  await ensurePrismaSeed();
  const row = await getPrisma().sitemapConfiguration.update({
    where: { entityType },
    data: input,
  });
  return {
    id: row.id,
    entityType: row.entityType,
    included: row.included,
    changefreq: row.changefreq,
    priority: row.priority,
    lastRegeneratedAt: row.lastRegeneratedAt?.toISOString() ?? null,
  };
}

/** Placeholder regeneration — records timestamp only (real XML deferred). */
export async function regenerateSitemapPlaceholder(): Promise<{
  regeneratedAt: string;
  includedTypes: number;
}> {
  const at = new Date();
  if (!isDatabaseConfigured()) {
    ensureMemory();
    for (const s of memory.sitemap) {
      if (s.included) s.lastRegeneratedAt = at.toISOString();
    }
    return {
      regeneratedAt: at.toISOString(),
      includedTypes: memory.sitemap.filter((s) => s.included).length,
    };
  }
  await ensurePrismaSeed();
  await getPrisma().sitemapConfiguration.updateMany({
    where: { included: true },
    data: { lastRegeneratedAt: at },
  });
  const included = await getPrisma().sitemapConfiguration.count({
    where: { included: true },
  });
  return { regeneratedAt: at.toISOString(), includedTypes: included };
}

export async function listStructuredData(): Promise<StructuredDataRecord[]> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    return memory.structured.map((s) => ({ ...s }));
  }
  await ensurePrismaSeed();
  const rows = await getPrisma().structuredData.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    schemaType: r.schemaType,
    entityType: r.entityType,
    label: r.label,
    jsonPreview: r.jsonPreview as Record<string, unknown>,
    enabled: r.enabled,
    sortOrder: r.sortOrder,
  }));
}

export async function setStructuredDataEnabled(
  id: string,
  enabled: boolean
): Promise<StructuredDataRecord | null> {
  if (!isDatabaseConfigured()) {
    ensureMemory();
    const row = memory.structured.find((s) => s.id === id);
    if (!row) return null;
    row.enabled = enabled;
    return { ...row };
  }
  const row = await getPrisma().structuredData.update({
    where: { id },
    data: { enabled },
  });
  return {
    id: row.id,
    schemaType: row.schemaType,
    entityType: row.entityType,
    label: row.label,
    jsonPreview: row.jsonPreview as Record<string, unknown>,
    enabled: row.enabled,
    sortOrder: row.sortOrder,
  };
}

export async function getSeoDashboardStats(): Promise<SeoDashboardStats> {
  const [redirects, sitemap, structured] = await Promise.all([
    listRedirects(),
    listSitemapConfigs(),
    listStructuredData(),
  ]);

  let missingMetadata = 0;
  let duplicateTitles = 0;
  let missingImages = 0;
  let indexedPagesEstimate = 0;

  try {
    const [articles, guides, tools, categories, topics] = await Promise.all([
      listArticlesAdmin({ status: "PUBLISHED", pageSize: 100 }),
      listGuidesAdmin({ status: "PUBLISHED", pageSize: 100 }),
      listToolsAdmin({ status: "PUBLISHED", pageSize: 100 }),
      listCategoriesAdmin({ status: "ACTIVE", pageSize: 100 }),
      listTopicsAdmin({ status: "ACTIVE", pageSize: 100 }),
    ]);

    indexedPagesEstimate =
      1 +
      articles.total +
      guides.total +
      tools.total +
      categories.total +
      topics.total;

    const titles: string[] = [];
    for (const a of articles.items) {
      const t = (a.seoTitle || a.title).trim().toLowerCase();
      titles.push(t);
      if (!a.seoTitle || !a.seoDescription) missingMetadata += 1;
      if (!a.featuredImageUrl && !a.socialImageUrl) missingImages += 1;
    }
    for (const g of guides.items) {
      if (!g.seoTitle || !g.seoDescription) missingMetadata += 1;
      if (!g.coverImageUrl) missingImages += 1;
      titles.push((g.seoTitle || g.title).trim().toLowerCase());
    }
    for (const tool of tools.items) {
      if (!tool.seoTitle || !tool.seoDescription) missingMetadata += 1;
      if (!tool.coverUrl && !tool.logoUrl) missingImages += 1;
      titles.push((tool.seoTitle || tool.name).trim().toLowerCase());
    }

    const seen = new Set<string>();
    for (const t of titles) {
      if (seen.has(t)) duplicateTitles += 1;
      else seen.add(t);
    }
  } catch {
    indexedPagesEstimate = 0;
  }

  const lastSitemap =
    sitemap
      .map((s) => s.lastRegeneratedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;

  return {
    indexedPagesEstimate,
    missingMetadata,
    duplicateTitles,
    missingImages,
    activeRedirects: redirects.filter((r) => r.status === "ACTIVE").length,
    disabledRedirects: redirects.filter((r) => r.status === "DISABLED").length,
    sitemapIncludedTypes: sitemap.filter((s) => s.included).length,
    structuredDataEnabled: structured.filter((s) => s.enabled).length,
    lastSitemapHint: lastSitemap,
  };
}

export async function resolveMetadata(
  params: ResolveMetadataParams
): Promise<ResolvedMetadata> {
  const global = await getGlobalSEOSettings();

  if (params.entityType === "page") {
    const title =
      params.path === "/" || !params.path
        ? global.defaultMetaTitle || global.websiteTitle
        : `${params.path} | ${global.brandName}`;
    return {
      title: title || global.websiteTitle,
      description: global.defaultMetaDescription || "",
      openGraph: {
        title: title || global.websiteTitle,
        description: global.defaultMetaDescription || "",
        ...(global.defaultOgImageUrl
          ? { image: global.defaultOgImageUrl }
          : {}),
      },
      twitter: {
        ...(global.defaultTwitterImageUrl
          ? { image: global.defaultTwitterImageUrl }
          : {}),
      },
      robots: {
        index: global.defaultRobotsIndex,
        follow: global.defaultRobotsFollow,
      },
      canonicalUrl: global.canonicalDomain
        ? `${global.canonicalDomain.replace(/\/$/, "")}${params.path || "/"}`
        : null,
      structuredData: {
        "@type": "WebPage",
        name: title,
      },
    };
  }

  if (params.entityType === "article" && params.entityId) {
    const article = await getArticleById(params.entityId);
    if (!article) return { title: "Article not found", description: "" };
    const title = article.seoTitle || article.title;
    const description = article.seoDescription || article.excerpt || "";
    const image = article.socialImageUrl || article.featuredImageUrl || "";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        ...(image ? { image } : {}),
      },
      twitter: {
        title,
        description,
        ...(image ? { image } : {}),
      },
      robots: { index: true, follow: true },
      canonicalUrl: article.canonicalUrl,
      structuredData: {
        "@type": "Article",
        headline: article.title,
        keywords: article.focusKeyword ?? undefined,
        datePublished: article.publishedAt ?? undefined,
      },
    };
  }

  if (params.entityType === "guide" && params.entityId) {
    const guide = await getGuideById(params.entityId);
    if (!guide) return { title: "Guide not found", description: "" };
    const title = guide.seoTitle || guide.title;
    const description = guide.seoDescription || guide.shortDescription || "";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        ...(guide.coverImageUrl ? { image: guide.coverImageUrl } : {}),
      },
      structuredData: {
        "@type": "Course",
        name: guide.title,
        timeRequired: `PT${guide.estimatedMinutes}M`,
      },
    };
  }

  if (params.entityType === "ai_tool" && params.entityId) {
    const tool = await getToolById(params.entityId);
    if (!tool) return { title: "AI tool not found", description: "" };
    const title = tool.seoTitle || tool.name;
    const description = tool.seoDescription || tool.shortDescription || "";
    const image = tool.coverUrl || tool.logoUrl || "";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        ...(image ? { image } : {}),
      },
      structuredData: {
        "@type": "SoftwareApplication",
        name: tool.name,
        applicationCategory: "EducationalApplication",
        offers: { price: tool.pricing },
      },
    };
  }

  if (params.entityType === "category" && params.entityId) {
    const category = await getCategoryById(params.entityId);
    if (!category) return { title: "Category not found", description: "" };
    const title = category.seoTitle || category.name;
    const description = category.seoDescription || category.description || "";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        ...(category.imageUrl ? { image: category.imageUrl } : {}),
      },
    };
  }

  if (params.entityType === "topic" && params.entityId) {
    const topic = await getTopicById(params.entityId);
    if (!topic) return { title: "Topic not found", description: "" };
    const title = topic.seoTitle || topic.name;
    const description = topic.seoDescription || topic.description || "";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        ...(topic.imageUrl ? { image: topic.imageUrl } : {}),
      },
    };
  }

  return {
    title: global.websiteTitle,
    description: global.defaultMetaDescription || "",
  };
}

export function suggestArticleSeo(input: {
  title: string;
  excerpt?: string | null;
}) {
  return {
    seoTitle: input.title.slice(0, 60),
    seoDescription: (input.excerpt ?? "").slice(0, 160),
  };
}

export function suggestSeoFromTemplate(input: {
  entityType: SeoEntityTypeValue;
  title: string;
  category?: string | null;
  topic?: string | null;
  brand?: string | null;
  titleTemplate: string;
  descriptionTemplate: string;
}) {
  const vars = {
    title: input.title,
    category: input.category,
    topic: input.topic,
    brand: input.brand ?? "Mendanize",
  };
  return {
    seoTitle: applyMetadataTemplate(input.titleTemplate, vars).slice(0, 70),
    seoDescription: applyMetadataTemplate(
      input.descriptionTemplate,
      vars
    ).slice(0, 160),
  };
}
