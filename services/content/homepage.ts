/**
 * Homepage Content Service — MES-013 admin CMS + public payload.
 */

import {
  getPrisma,
  isDatabaseConfigured,
  isTransientConnectionError,
  resetPrismaClient,
} from "@/lib/db/prisma";
import { SEEDED_HOMEPAGE_CONTENT } from "@/features/homepage-public/constants/seed";
import type { HomepageContent } from "@/features/homepage-public/types/types";
import type {
  HomepageAdminRecord,
  HomepageAskRecord,
  HomepageCtaRecord,
  HomepageFeaturedKindValue,
  HomepageFeaturedRecord,
  HomepageHeroRecord,
  HomepageLatestArticlesRecord,
  HomepageNewsletterRecord,
  HomepageSectionRecord,
  HomepageStatusValue,
  HomepageWhyItemRecord,
  HomepageWriteInput,
} from "./types";
import { getArticleById, listPublishedArticleSummaries } from "./articles";
import { getGuideById } from "./guides";
import { getCategoryById } from "./taxonomy";
import { getToolById } from "./tools";
import { applyLiveHomepageStatistics } from "@/services/homepage";

const HOMEPAGE_KEY = "main";

/** Keep "Create account" CTAs pointed at public registration. */
function publicCtaLink(label: string, href: string): { label: string; href: string } {
  if (/^create\s+account$/i.test(label.trim())) {
    return { label: label.trim(), href: "/sign-up" };
  }
  return { label, href };
}

const nowIso = () => new Date().toISOString();

function defaultAsk(): HomepageAskRecord {
  return { ...SEEDED_HOMEPAGE_CONTENT.ask };
}

function defaultWhy(): HomepageWhyItemRecord[] {
  return SEEDED_HOMEPAGE_CONTENT.why.map((w) => ({ ...w }));
}

function defaultNewsletter(): HomepageNewsletterRecord {
  return { ...SEEDED_HOMEPAGE_CONTENT.newsletter };
}

function defaultLatestArticles(): HomepageLatestArticlesRecord {
  return {
    mode: "MANUAL",
    articleIds: SEEDED_HOMEPAGE_CONTENT.latestArticles.map((a) => a.id),
    limit: 5,
  };
}

function seedToAdmin(): HomepageAdminRecord {
  const t = nowIso();
  const sections: HomepageSectionRecord[] =
    SEEDED_HOMEPAGE_CONTENT.sections.map((s, i) => ({
      id: `sec_${s.id}`,
      sectionKey: s.id,
      enabled: s.visible,
      sortOrder: s.order ?? i + 1,
      visibilityRules: null,
      backgroundStyle: null,
      animationEnabled: true,
      spacing: "default",
      title: null,
      displayLimit: null,
    }));

  return {
    id: "hp_seed_main",
    key: HOMEPAGE_KEY,
    status: "DRAFT",
    publishedAt: null,
    updatedAt: t,
    createdAt: t,
    sections,
    hero: {
      brand: SEEDED_HOMEPAGE_CONTENT.hero.brand,
      headline: SEEDED_HOMEPAGE_CONTENT.hero.headline,
      supportingText: SEEDED_HOMEPAGE_CONTENT.hero.description,
      primaryCtaLabel: SEEDED_HOMEPAGE_CONTENT.hero.primaryCta.label,
      primaryCtaHref: SEEDED_HOMEPAGE_CONTENT.hero.primaryCta.href,
      secondaryCtaLabel: SEEDED_HOMEPAGE_CONTENT.hero.secondaryCta.label,
      secondaryCtaHref: SEEDED_HOMEPAGE_CONTENT.hero.secondaryCta.href,
      trustLine: SEEDED_HOMEPAGE_CONTENT.hero.trustLine,
      heroImageUrl: null,
      backgroundGradient: null,
      askPlaceholder: SEEDED_HOMEPAGE_CONTENT.ask.placeholder,
      eyebrow: SEEDED_HOMEPAGE_CONTENT.hero.eyebrow ?? null,
      headlineAccent: SEEDED_HOMEPAGE_CONTENT.hero.headlineAccent ?? null,
      showAskInHero: true,
    },
    statistics: SEEDED_HOMEPAGE_CONTENT.stats.map((s, i) => ({
      id: s.id,
      key: s.id,
      label: s.label,
      value: s.value,
      sortOrder: i,
      icon: s.icon ?? null,
    })),
    faqs: SEEDED_HOMEPAGE_CONTENT.faq.map((f, i) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      sortOrder: i,
    })),
    cta: {
      headline: SEEDED_HOMEPAGE_CONTENT.finalCta.headline,
      description: SEEDED_HOMEPAGE_CONTENT.finalCta.description,
      primaryCtaLabel: SEEDED_HOMEPAGE_CONTENT.finalCta.primaryCta.label,
      primaryCtaHref: SEEDED_HOMEPAGE_CONTENT.finalCta.primaryCta.href,
      secondaryCtaLabel: SEEDED_HOMEPAGE_CONTENT.finalCta.secondaryCta.label,
      secondaryCtaHref: SEEDED_HOMEPAGE_CONTENT.finalCta.secondaryCta.href,
    },
    featured: [
      ...SEEDED_HOMEPAGE_CONTENT.categories.map((c, i) => ({
        id: `feat_cat_${c.id}`,
        kind: "CATEGORY" as const,
        entityId: c.id,
        sortOrder: i,
        selectionMode: "MANUAL" as const,
        titleOverride: c.title,
        icon: c.icon ?? null,
        iconColor: c.iconColor ?? null,
      })),
      ...SEEDED_HOMEPAGE_CONTENT.paths.map((p, i) => ({
        id: `feat_guide_${p.id}`,
        kind: "GUIDE" as const,
        entityId: p.id,
        sortOrder: i,
        selectionMode: "MANUAL" as const,
        titleOverride: p.title,
        icon: null,
        iconColor: null,
      })),
      ...SEEDED_HOMEPAGE_CONTENT.articles.map((a, i) => ({
        id: `feat_art_${a.id}`,
        kind: "ARTICLE" as const,
        entityId: a.id,
        sortOrder: i,
        selectionMode: "MANUAL" as const,
        titleOverride: a.title,
        icon: null,
        iconColor: null,
      })),
      ...SEEDED_HOMEPAGE_CONTENT.tools.map((tool, i) => ({
        id: `feat_tool_${tool.id}`,
        kind: "TOOL" as const,
        entityId: tool.id,
        sortOrder: i,
        selectionMode: "MANUAL" as const,
        titleOverride: tool.name,
        icon: null,
        iconColor: null,
      })),
    ],
    testimonials: SEEDED_HOMEPAGE_CONTENT.testimonials.map((tm, i) => ({
      id: tm.id,
      quote: tm.quote,
      name: tm.name,
      role: tm.role,
      sortOrder: i,
    })),
    ask: defaultAsk(),
    why: defaultWhy(),
    newsletter: defaultNewsletter(),
    latestArticles: defaultLatestArticles(),
    activeSectionCount: sections.filter((s) => s.enabled).length,
    hiddenSectionCount: sections.filter((s) => !s.enabled).length,
  };
}

const memory = {
  record: null as HomepageAdminRecord | null,
};

function ensureMemory(): HomepageAdminRecord {
  if (!memory.record) memory.record = seedToAdmin();
  return memory.record;
}

function withCounts(record: HomepageAdminRecord): HomepageAdminRecord {
  return {
    ...record,
    activeSectionCount: record.sections.filter((s) => s.enabled).length,
    hiddenSectionCount: record.sections.filter((s) => !s.enabled).length,
  };
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  return value as T;
}

type PrismaHomepageRow = {
  id: string;
  key: string;
  status: HomepageStatusValue;
  publishedAt: Date | null;
  askJson: unknown;
  whyJson: unknown;
  newsletterJson: unknown;
  latestArticlesJson: unknown;
  createdAt: Date;
  updatedAt: Date;
  sections: Array<{
    id: string;
    sectionKey: string;
    enabled: boolean;
    sortOrder: number;
    visibilityRules: string | null;
    backgroundStyle: string | null;
    animationEnabled: boolean;
    spacing: string;
    title: string | null;
    displayLimit: number | null;
  }>;
  hero: {
    brand: string;
    headline: string;
    supportingText: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    trustLine: string | null;
    heroImageUrl: string | null;
    backgroundGradient: string | null;
    askPlaceholder: string | null;
    eyebrow: string | null;
    headlineAccent: string | null;
    showAskInHero: boolean;
  } | null;
  statistics: Array<{
    id: string;
    key: string;
    label: string;
    value: string;
    sortOrder: number;
    icon: string | null;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    sortOrder: number;
  }>;
  cta: HomepageCtaRecord | null;
  featured: Array<{
    id: string;
    kind: HomepageFeaturedKindValue;
    entityId: string;
    sortOrder: number;
    selectionMode: "MANUAL" | "AUTOMATIC";
    titleOverride: string | null;
    icon: string | null;
    iconColor: string | null;
  }>;
  testimonials: Array<{
    id: string;
    quote: string;
    name: string;
    role: string;
    sortOrder: number;
  }>;
};

function mapPrisma(row: PrismaHomepageRow): HomepageAdminRecord {
  const seed = seedToAdmin();
  return withCounts({
    id: row.id,
    key: row.key,
    status: row.status,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    sections: row.sections
      .map((s) => ({
        id: s.id,
        sectionKey: s.sectionKey,
        enabled: s.enabled,
        sortOrder: s.sortOrder,
        visibilityRules: s.visibilityRules,
        backgroundStyle: s.backgroundStyle,
        animationEnabled: s.animationEnabled,
        spacing: s.spacing,
        title: s.title,
        displayLimit: s.displayLimit,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    hero: row.hero
      ? {
          brand: row.hero.brand,
          headline: row.hero.headline,
          supportingText: row.hero.supportingText,
          primaryCtaLabel: row.hero.primaryCtaLabel,
          primaryCtaHref: row.hero.primaryCtaHref,
          secondaryCtaLabel: row.hero.secondaryCtaLabel,
          secondaryCtaHref: row.hero.secondaryCtaHref,
          trustLine: row.hero.trustLine,
          heroImageUrl: row.hero.heroImageUrl,
          backgroundGradient: row.hero.backgroundGradient,
          askPlaceholder: row.hero.askPlaceholder,
          eyebrow: row.hero.eyebrow,
          headlineAccent: row.hero.headlineAccent,
          showAskInHero: row.hero.showAskInHero ?? true,
        }
      : seed.hero,
    statistics: [...row.statistics].sort((a, b) => a.sortOrder - b.sortOrder),
    faqs: [...row.faqs].sort((a, b) => a.sortOrder - b.sortOrder),
    cta: row.cta
      ? {
          headline: row.cta.headline,
          description: row.cta.description,
          primaryCtaLabel: row.cta.primaryCtaLabel,
          primaryCtaHref: row.cta.primaryCtaHref,
          secondaryCtaLabel: row.cta.secondaryCtaLabel,
          secondaryCtaHref: row.cta.secondaryCtaHref,
        }
      : seed.cta,
    featured: [...row.featured].sort((a, b) => a.sortOrder - b.sortOrder),
    testimonials: [...row.testimonials].sort(
      (a, b) => a.sortOrder - b.sortOrder
    ),
    ask: parseJson(row.askJson, defaultAsk()),
    why: parseJson(row.whyJson, defaultWhy()),
    newsletter: parseJson(row.newsletterJson, defaultNewsletter()),
    latestArticles: parseJson(
      row.latestArticlesJson,
      defaultLatestArticles(),
    ),
    activeSectionCount: 0,
    hiddenSectionCount: 0,
  });
}

const includeAll = {
  sections: true,
  hero: true,
  statistics: true,
  faqs: true,
  cta: true,
  featured: true,
  testimonials: true,
} as const;

async function ensurePrismaHomepage(): Promise<HomepageAdminRecord> {
  const prisma = getPrisma();
  const existing = await prisma.homepage.findUnique({
    where: { key: HOMEPAGE_KEY },
    include: includeAll,
  });
  if (existing) return mapPrisma(existing as unknown as PrismaHomepageRow);

  const seed = seedToAdmin();
  const created = await prisma.homepage.create({
    data: {
      key: HOMEPAGE_KEY,
      status: "DRAFT",
      askJson: seed.ask,
      whyJson: seed.why,
      newsletterJson: seed.newsletter,
      latestArticlesJson: seed.latestArticles,
      sections: {
        create: seed.sections.map((s) => ({
          sectionKey: s.sectionKey,
          enabled: s.enabled,
          sortOrder: s.sortOrder,
          visibilityRules: s.visibilityRules,
          backgroundStyle: s.backgroundStyle,
          animationEnabled: s.animationEnabled,
          spacing: s.spacing,
          title: s.title,
          displayLimit: s.displayLimit,
        })),
      },
      hero: {
        create: {
          brand: seed.hero.brand,
          headline: seed.hero.headline,
          supportingText: seed.hero.supportingText,
          primaryCtaLabel: seed.hero.primaryCtaLabel,
          primaryCtaHref: seed.hero.primaryCtaHref,
          secondaryCtaLabel: seed.hero.secondaryCtaLabel,
          secondaryCtaHref: seed.hero.secondaryCtaHref,
          trustLine: seed.hero.trustLine,
          heroImageUrl: seed.hero.heroImageUrl,
          backgroundGradient: seed.hero.backgroundGradient,
          askPlaceholder: seed.hero.askPlaceholder,
          eyebrow: seed.hero.eyebrow,
          headlineAccent: seed.hero.headlineAccent,
          showAskInHero: seed.hero.showAskInHero,
        },
      },
      statistics: {
        create: seed.statistics.map((s) => ({
          key: s.key,
          label: s.label,
          value: s.value,
          sortOrder: s.sortOrder,
          icon: s.icon,
        })),
      },
      faqs: {
        create: seed.faqs.map((f) => ({
          question: f.question,
          answer: f.answer,
          sortOrder: f.sortOrder,
        })),
      },
      cta: {
        create: { ...seed.cta },
      },
      featured: {
        create: seed.featured.map((f) => ({
          kind: f.kind,
          entityId: f.entityId,
          sortOrder: f.sortOrder,
          selectionMode: f.selectionMode,
          titleOverride: f.titleOverride,
          icon: f.icon,
          iconColor: f.iconColor,
        })),
      },
      testimonials: {
        create: seed.testimonials.map((t) => ({
          quote: t.quote,
          name: t.name,
          role: t.role,
          sortOrder: t.sortOrder,
        })),
      },
    },
    include: includeAll,
  });
  return mapPrisma(created as unknown as PrismaHomepageRow);
}

export async function getHomepageAdmin(): Promise<HomepageAdminRecord> {
  if (!isDatabaseConfigured()) return withCounts(ensureMemory());

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await ensurePrismaHomepage();
    } catch (error) {
      lastError = error;
      if (!isTransientConnectionError(error) || attempt === 2) {
        throw error;
      }
      await resetPrismaClient();
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  throw lastError;
}

export async function updateHomepage(
  input: HomepageWriteInput
): Promise<HomepageAdminRecord> {
  if (!isDatabaseConfigured()) {
    const current = ensureMemory();
    const next: HomepageAdminRecord = {
      ...current,
      status: input.status ?? current.status,
      updatedAt: nowIso(),
      sections: input.sections
        ? input.sections.map((s, i) => {
            const prev = current.sections.find(
              (x) => x.sectionKey === s.sectionKey
            );
            return {
              id: prev?.id ?? `sec_${s.sectionKey}`,
              sectionKey: s.sectionKey,
              enabled: s.enabled ?? prev?.enabled ?? true,
              sortOrder: s.sortOrder ?? prev?.sortOrder ?? i,
              visibilityRules:
                s.visibilityRules !== undefined
                  ? s.visibilityRules
                  : (prev?.visibilityRules ?? null),
              backgroundStyle:
                s.backgroundStyle !== undefined
                  ? s.backgroundStyle
                  : (prev?.backgroundStyle ?? null),
              animationEnabled:
                s.animationEnabled ?? prev?.animationEnabled ?? true,
              spacing: s.spacing ?? prev?.spacing ?? "default",
              title: s.title !== undefined ? s.title : (prev?.title ?? null),
              displayLimit:
                s.displayLimit !== undefined
                  ? s.displayLimit
                  : (prev?.displayLimit ?? null),
            };
          })
        : current.sections,
      hero: input.hero ? { ...current.hero, ...input.hero } : current.hero,
      statistics: input.statistics
        ? input.statistics.map((s, i) => ({
            id: s.id || `stat_${i}`,
            key: s.key,
            label: s.label,
            value: s.value,
            sortOrder: s.sortOrder ?? i,
            icon: s.icon ?? null,
          }))
        : current.statistics,
      faqs: input.faqs
        ? input.faqs.map((f, i) => ({
            id: f.id || `faq_${i}`,
            question: f.question,
            answer: f.answer,
            sortOrder: f.sortOrder ?? i,
          }))
        : current.faqs,
      cta: input.cta ? { ...current.cta, ...input.cta } : current.cta,
      featured: input.featured
        ? input.featured.map((f, i) => ({
            id: f.id || `feat_${i}`,
            kind: f.kind,
            entityId: f.entityId,
            sortOrder: f.sortOrder ?? i,
            selectionMode: f.selectionMode ?? "MANUAL",
            titleOverride: f.titleOverride ?? null,
            icon: f.icon ?? null,
            iconColor: f.iconColor ?? null,
          }))
        : current.featured,
      testimonials: input.testimonials
        ? input.testimonials.map((t, i) => ({
            id: t.id || `tm_${i}`,
            quote: t.quote,
            name: t.name,
            role: t.role,
            sortOrder: t.sortOrder ?? i,
          }))
        : current.testimonials,
      ask: input.ask ? { ...current.ask, ...input.ask } : current.ask,
      why: input.why
        ? input.why.map((w, i) => ({
            id: w.id || `why_${i}`,
            title: w.title,
            description: w.description,
            icon: w.icon ?? null,
          }))
        : current.why,
      newsletter: input.newsletter
        ? { ...current.newsletter, ...input.newsletter }
        : current.newsletter,
      latestArticles: input.latestArticles
        ? { ...current.latestArticles, ...input.latestArticles }
        : current.latestArticles,
      activeSectionCount: 0,
      hiddenSectionCount: 0,
    };
    if (input.status === "PUBLISHED") {
      next.publishedAt = nowIso();
    }
    memory.record = withCounts(next);
    return memory.record;
  }

  const prisma = getPrisma();
  const current = await ensurePrismaHomepage();

  await prisma.$transaction(
    async (tx) => {
    await tx.homepage.update({
      where: { id: current.id },
      data: {
        status: input.status ?? current.status,
        publishedAt:
          input.status === "PUBLISHED"
            ? new Date()
            : current.publishedAt
              ? new Date(current.publishedAt)
              : null,
        askJson: input.ask ? { ...current.ask, ...input.ask } : undefined,
        whyJson: input.why
          ? input.why.map((w, i) => ({
              id: w.id || `why_${i}`,
              title: w.title,
              description: w.description,
              icon: w.icon ?? null,
            }))
          : undefined,
        newsletterJson: input.newsletter
          ? { ...current.newsletter, ...input.newsletter }
          : undefined,
        latestArticlesJson: input.latestArticles
          ? { ...current.latestArticles, ...input.latestArticles }
          : undefined,
      },
    });

    if (input.sections) {
      for (const s of input.sections) {
        await tx.homepageSection.upsert({
          where: {
            homepageId_sectionKey: {
              homepageId: current.id,
              sectionKey: s.sectionKey,
            },
          },
          create: {
            homepageId: current.id,
            sectionKey: s.sectionKey,
            enabled: s.enabled ?? true,
            sortOrder: s.sortOrder ?? 0,
            visibilityRules: s.visibilityRules ?? null,
            backgroundStyle: s.backgroundStyle ?? null,
            animationEnabled: s.animationEnabled ?? true,
            spacing: s.spacing ?? "default",
            title: s.title ?? null,
            displayLimit: s.displayLimit ?? null,
          },
          update: {
            enabled: s.enabled,
            sortOrder: s.sortOrder,
            visibilityRules: s.visibilityRules,
            backgroundStyle: s.backgroundStyle,
            animationEnabled: s.animationEnabled,
            spacing: s.spacing,
            title: s.title,
            displayLimit: s.displayLimit,
          },
        });
      }
    }

    if (input.hero) {
      const h = { ...current.hero, ...input.hero };
      await tx.homepageHero.upsert({
        where: { homepageId: current.id },
        create: { homepageId: current.id, ...h },
        update: h,
      });
    }

    if (input.cta) {
      const c = { ...current.cta, ...input.cta };
      await tx.homepageCTA.upsert({
        where: { homepageId: current.id },
        create: { homepageId: current.id, ...c },
        update: c,
      });
    }

    if (input.statistics) {
      await tx.homepageStatistic.deleteMany({
        where: { homepageId: current.id },
      });
      await tx.homepageStatistic.createMany({
        data: input.statistics.map((s, i) => ({
          homepageId: current.id,
          key: s.key,
          label: s.label,
          value: s.value,
          sortOrder: s.sortOrder ?? i,
          icon: s.icon ?? null,
        })),
      });
    }

    if (input.faqs) {
      await tx.homepageFAQ.deleteMany({ where: { homepageId: current.id } });
      await tx.homepageFAQ.createMany({
        data: input.faqs.map((f, i) => ({
          homepageId: current.id,
          question: f.question,
          answer: f.answer,
          sortOrder: f.sortOrder ?? i,
        })),
      });
    }

    if (input.testimonials) {
      await tx.homepageTestimonial.deleteMany({
        where: { homepageId: current.id },
      });
      await tx.homepageTestimonial.createMany({
        data: input.testimonials.map((t, i) => ({
          homepageId: current.id,
          quote: t.quote,
          name: t.name,
          role: t.role,
          sortOrder: t.sortOrder ?? i,
        })),
      });
    }

    if (input.featured) {
      await tx.homepageFeaturedContent.deleteMany({
        where: { homepageId: current.id },
      });
      await tx.homepageFeaturedContent.createMany({
        data: input.featured.map((f, i) => ({
          homepageId: current.id,
          kind: f.kind,
          entityId: f.entityId,
          sortOrder: f.sortOrder ?? i,
          selectionMode: f.selectionMode ?? "MANUAL",
          titleOverride: f.titleOverride ?? null,
          icon: f.icon ?? null,
          iconColor: f.iconColor ?? null,
        })),
      });
    }
  },
    { maxWait: 15_000, timeout: 60_000 },
  );

  return getHomepageAdmin();
}

export async function publishHomepage(): Promise<HomepageAdminRecord> {
  return updateHomepage({ status: "PUBLISHED" });
}

/**
 * Overwrite the CMS Homepage (`key: main`) with SEEDED_HOMEPAGE_CONTENT as DRAFT.
 * Does not publish — use publishHomepage() or the dashboard Publish action for go-live.
 */
export async function syncHomepageFromSeed(): Promise<HomepageAdminRecord> {
  const seed = seedToAdmin();
  return updateHomepage({
    status: "DRAFT",
    sections: seed.sections,
    hero: seed.hero,
    statistics: seed.statistics,
    faqs: seed.faqs,
    cta: seed.cta,
    featured: seed.featured,
    testimonials: seed.testimonials,
    ask: seed.ask,
    why: seed.why,
    newsletter: seed.newsletter,
    latestArticles: seed.latestArticles,
  });
}

async function resolveFeaturedCards(
  featured: HomepageFeaturedRecord[],
  kind: HomepageFeaturedKindValue,
  limit: number | null | undefined
) {
  const items = featured
    .filter((f) => f.kind === kind)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const capped = typeof limit === "number" ? items.slice(0, limit) : items;
  return capped;
}

async function resolveLatestArticles(
  config: HomepageLatestArticlesRecord,
  limitOverride?: number | null,
) {
  const limit = limitOverride ?? config.limit ?? 5;

  if (config.mode === "AUTOMATIC") {
    const published = await listPublishedArticleSummaries({
      page: 1,
      pageSize: limit,
    });
    return published.map((art) => ({
      id: art.id,
      title: art.title,
      description: art.excerpt ?? "",
      href: `/articles/${art.slug}`,
      category: art.categoryName ?? "",
      readingTime: `${art.readingTimeMin} min`,
      author: "Editorial",
      date: art.publishedAt?.slice(0, 10) ?? "",
      imageUrl: art.featuredImageUrl,
    }));
  }

  const ids = config.articleIds.slice(0, limit);
  return Promise.all(
    ids.map(async (id, i) => {
      const art = await getArticleById(id).catch(() => null);
      const seed = SEEDED_HOMEPAGE_CONTENT.latestArticles[i];
      return {
        id,
        title: art?.title || seed?.title || id,
        description: art?.excerpt || seed?.description || "",
        href: art ? `/articles/${art.slug}` : seed?.href || "/articles",
        category: art?.categoryName || seed?.category || "",
        readingTime: art ? `${art.readingTimeMin} min` : seed?.readingTime || "",
        author: art?.authorName || seed?.author || "Editorial",
        date: art?.publishedAt?.slice(0, 10) || seed?.date || "",
        imageUrl: art?.featuredImageUrl ?? seed?.imageUrl ?? null,
      };
    }),
  );
}

/**
 * Public homepage payload — published CMS (or preview draft); otherwise seed.
 */
async function withLiveStatistics(
  content: HomepageContent,
): Promise<HomepageContent> {
  try {
    const stats = await applyLiveHomepageStatistics(content.stats);
    return { ...content, stats };
  } catch {
    return content;
  }
}

export async function getHomepageContent(options?: {
  preview?: boolean;
}): Promise<HomepageContent> {
  try {
    return await loadHomepageContent(options);
  } catch (error) {
    // Never let a dead database take down the public homepage — serve seed.
    if (isTransientConnectionError(error)) {
      console.error(
        "[homepage] Database unreachable, serving seeded content:",
        error instanceof Error ? error.message : error,
      );
      return withLiveStatistics(structuredClone(SEEDED_HOMEPAGE_CONTENT));
    }
    throw error;
  }
}

async function loadHomepageContent(options?: {
  preview?: boolean;
}): Promise<HomepageContent> {
  const admin = await getHomepageAdmin();
  const useRecord = Boolean(options?.preview) || admin.status === "PUBLISHED";
  if (!useRecord) {
    return withLiveStatistics(structuredClone(SEEDED_HOMEPAGE_CONTENT));
  }

  const record = admin;
  const sectionMeta = (key: string) =>
    record.sections.find((s) => s.sectionKey === key);

  const catFeat = await resolveFeaturedCards(
    record.featured,
    "CATEGORY",
    sectionMeta("categories")?.displayLimit
  );
  const artFeat = await resolveFeaturedCards(
    record.featured,
    "ARTICLE",
    sectionMeta("articles")?.displayLimit
  );
  const guideFeat = await resolveFeaturedCards(
    record.featured,
    "GUIDE",
    sectionMeta("paths")?.displayLimit
  );
  const toolFeat = await resolveFeaturedCards(
    record.featured,
    "TOOL",
    sectionMeta("tools")?.displayLimit
  );

  const categories = await Promise.all(
    catFeat.map(async (f, i) => {
      const cat = await getCategoryById(f.entityId).catch(() => null);
      const seed = SEEDED_HOMEPAGE_CONTENT.categories[i];
      return {
        id: f.entityId,
        title: f.titleOverride || cat?.name || seed?.title || f.entityId,
        description: cat?.description || seed?.description || "",
        href: cat ? `/categories/${cat.slug}` : seed?.href || "/categories",
        articleCount: cat?.articleCount ?? seed?.articleCount ?? 0,
        icon: f.icon || cat?.icon || seed?.icon || "sparkles",
        iconColor: f.iconColor || cat?.accentColor || seed?.iconColor,
      };
    })
  );

  const articles = await Promise.all(
    artFeat.map(async (f, i) => {
      const art = await getArticleById(f.entityId).catch(() => null);
      const seed = SEEDED_HOMEPAGE_CONTENT.articles[i];
      return {
        id: f.entityId,
        title: f.titleOverride || art?.title || seed?.title || f.entityId,
        description: art?.excerpt || seed?.description || "",
        href: art ? `/articles/${art.slug}` : seed?.href || "/articles",
        category: art?.categoryName || seed?.category || "",
        readingTime: art ? `${art.readingTimeMin} min` : seed?.readingTime || "",
        author: art?.authorName || seed?.author || "Editorial",
        date: art?.publishedAt?.slice(0, 10) || seed?.date || "",
        imageUrl: art?.featuredImageUrl ?? seed?.imageUrl ?? null,
      };
    })
  );

  const paths = await Promise.all(
    guideFeat.map(async (f, i) => {
      const guide = await getGuideById(f.entityId).catch(() => null);
      const seed = SEEDED_HOMEPAGE_CONTENT.paths[i];
      return {
        id: f.entityId,
        title: f.titleOverride || guide?.title || seed?.title || f.entityId,
        description: guide?.shortDescription || seed?.description || "",
        href: guide ? `/guides/${guide.slug}` : seed?.href || "/guides",
        difficulty: guide?.difficulty
          ? guide.difficulty.charAt(0) +
            guide.difficulty.slice(1).toLowerCase()
          : seed?.difficulty || "Beginner",
        duration: guide
          ? `${guide.estimatedMinutes} min`
          : seed?.duration || "",
        lessons: guide?.lessonCount ?? seed?.lessons ?? 0,
      };
    })
  );

  const tools = await Promise.all(
    toolFeat.map(async (f, i) => {
      const tool = await getToolById(f.entityId).catch(() => null);
      const seed = SEEDED_HOMEPAGE_CONTENT.tools[i];
      return {
        id: f.entityId,
        name: f.titleOverride || tool?.name || seed?.name || f.entityId,
        description: tool?.shortDescription || seed?.description || "",
        href: tool ? `/ai-tools/${tool.slug}` : seed?.href || "/ai-tools",
        category: tool?.categoryNames[0] || seed?.category || "",
        rating: seed?.rating || "—",
      };
    })
  );

  const stats = await applyLiveHomepageStatistics(
    record.statistics.map((s) => ({
      id: s.key,
      label: s.label,
      value: s.value,
      icon: s.icon ?? undefined,
    })),
  );

  const latestArticles = await resolveLatestArticles(
    record.latestArticles,
    sectionMeta("newsletter")?.displayLimit,
  );

  const seedHero = SEEDED_HOMEPAGE_CONTENT.hero;
  const seedSectionOrder = new Map(
    SEEDED_HOMEPAGE_CONTENT.sections.map((s) => [s.id, s.order]),
  );

  return {
    sections: record.sections
      .slice()
      .map((s) => {
        const id = s.sectionKey as HomepageContent["sections"][number]["id"];
        return {
          id,
          visible: s.enabled,
          order: seedSectionOrder.get(id) ?? s.sortOrder,
          title: s.title,
          spacing: s.spacing,
        };
      })
      .sort((a, b) => a.order - b.order),
    hero: {
      brand: record.hero.brand,
      eyebrow: record.hero.eyebrow ?? seedHero.eyebrow,
      headline: record.hero.headline.includes("Master")
        ? seedHero.headline
        : record.hero.headline,
      headlineLead: seedHero.headlineLead,
      headlineAccent: record.hero.headlineAccent ?? seedHero.headlineAccent,
      description: record.hero.supportingText,
      primaryCta: {
        label: record.hero.primaryCtaLabel,
        href: record.hero.primaryCtaHref,
      },
      secondaryCta: {
        label: record.hero.secondaryCtaLabel,
        href: record.hero.secondaryCtaHref,
      },
      trustLine: record.hero.trustLine || "",
      showAskInHero: record.hero.showAskInHero,
      imageUrl: record.hero.heroImageUrl,
      backgroundGradient: record.hero.backgroundGradient,
    },
    ask: {
      ...record.ask,
      placeholder: record.hero.askPlaceholder || record.ask.placeholder,
    },
    stats,
    categories:
      categories.length > 0 ? categories : SEEDED_HOMEPAGE_CONTENT.categories,
    paths: paths.length > 0 ? paths : SEEDED_HOMEPAGE_CONTENT.paths,
    articles:
      articles.length > 0 ? articles : SEEDED_HOMEPAGE_CONTENT.articles,
    latestArticles:
      latestArticles.length > 0
        ? latestArticles
        : SEEDED_HOMEPAGE_CONTENT.latestArticles,
    tools: tools.length > 0 ? tools : SEEDED_HOMEPAGE_CONTENT.tools,
    why:
      record.why.length >= SEEDED_HOMEPAGE_CONTENT.why.length
        ? record.why.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            icon: item.icon ?? undefined,
          }))
        : SEEDED_HOMEPAGE_CONTENT.why,
    testimonials: record.testimonials.map((t) => ({
      id: t.id,
      quote: t.quote,
      name: t.name,
      role: t.role,
    })),
    newsletter: {
      headline: record.newsletter.headline,
      description: record.newsletter.description,
      privacy: record.newsletter.privacy,
      placeholder: record.newsletter.placeholder,
      ctaLabel: record.newsletter.ctaLabel,
      socialProof: record.newsletter.socialProof ?? undefined,
    },
    faq: record.faqs.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
    })),
    finalCta: {
      headline: record.cta.headline,
      description: record.cta.description,
      primaryCta: publicCtaLink(
        record.cta.primaryCtaLabel,
        record.cta.primaryCtaHref,
      ),
      secondaryCta: publicCtaLink(
        record.cta.secondaryCtaLabel,
        record.cta.secondaryCtaHref,
      ),
    },
  };
}

export type { HomepageHeroRecord };
