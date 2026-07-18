/** SEO Shared Service types (MES-002 / MES-015). */

export type ResolveMetadataParams = {
  entityType: "article" | "guide" | "ai_tool" | "category" | "topic" | "page";
  entityId?: string;
  path?: string;
};

export type ResolvedMetadata = {
  title: string;
  description: string;
  openGraph?: Record<string, string>;
  twitter?: Record<string, string>;
  robots?: { index: boolean; follow: boolean };
  canonicalUrl?: string | null;
  structuredData?: Record<string, unknown>;
};

export type SeoEntityTypeValue =
  | "HOMEPAGE"
  | "ARTICLE"
  | "CATEGORY"
  | "TOPIC"
  | "GUIDE"
  | "AI_TOOL"
  | "PAGE";

export type RedirectTypeValue = "PERMANENT_301" | "TEMPORARY_302";
export type RedirectStatusValue = "ACTIVE" | "DISABLED";

export type GlobalSEOSettingsRecord = {
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
  updatedAt: string;
};

export type GlobalSEOSettingsWrite = Partial<
  Omit<GlobalSEOSettingsRecord, "id" | "updatedAt">
>;

export type MetadataTemplateRecord = {
  id: string;
  entityType: SeoEntityTypeValue;
  name: string;
  titleTemplate: string;
  descriptionTemplate: string;
  isDefault: boolean;
  updatedAt: string;
};

export type MetadataTemplateWrite = {
  entityType: SeoEntityTypeValue;
  name: string;
  titleTemplate: string;
  descriptionTemplate: string;
  isDefault?: boolean;
};

export type RedirectRecord = {
  id: string;
  sourcePath: string;
  destination: string;
  type: RedirectTypeValue;
  status: RedirectStatusValue;
  notes: string | null;
  hitCount: number;
  createdAt: string;
  updatedAt: string;
};

export type RedirectWrite = {
  sourcePath: string;
  destination: string;
  type?: RedirectTypeValue;
  status?: RedirectStatusValue;
  notes?: string | null;
};

export type RobotsRuleRecord = {
  id: string;
  userAgent: string;
  allowPath: string | null;
  disallowPath: string | null;
  sortOrder: number;
  enabled: boolean;
};

export type RobotsRuleWrite = {
  userAgent?: string;
  allowPath?: string | null;
  disallowPath?: string | null;
  sortOrder?: number;
  enabled?: boolean;
};

export type SitemapConfigRecord = {
  id: string;
  entityType: SeoEntityTypeValue;
  included: boolean;
  changefreq: string;
  priority: number;
  lastRegeneratedAt: string | null;
};

export type StructuredDataRecord = {
  id: string;
  schemaType: string;
  entityType: SeoEntityTypeValue | null;
  label: string;
  jsonPreview: Record<string, unknown>;
  enabled: boolean;
  sortOrder: number;
};

export type SeoDashboardStats = {
  indexedPagesEstimate: number;
  missingMetadata: number;
  duplicateTitles: number;
  missingImages: number;
  activeRedirects: number;
  disabledRedirects: number;
  sitemapIncludedTypes: number;
  structuredDataEnabled: number;
  lastSitemapHint: string | null;
};

/** Shared fields consumed by content editors via SeoFieldsPanel. */
export type SeoFieldsValue = {
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  slug?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImageUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  socialImageUrl?: string;
};
