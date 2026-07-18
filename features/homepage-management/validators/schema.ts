import { z } from "zod"

export const homepageStatusSchema = z.enum(["DRAFT", "PUBLISHED"])

export const sectionWriteSchema = z.object({
  sectionKey: z.string().min(1),
  enabled: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  visibilityRules: z.string().nullable().optional(),
  backgroundStyle: z.string().nullable().optional(),
  animationEnabled: z.boolean().optional(),
  spacing: z.string().optional(),
  title: z.string().nullable().optional(),
  displayLimit: z.number().int().min(1).max(24).nullable().optional(),
})

export const heroWriteSchema = z.object({
  brand: z.string().min(1).max(80).optional(),
  headline: z.string().min(1).max(200).optional(),
  supportingText: z.string().min(1).max(1000).optional(),
  primaryCtaLabel: z.string().min(1).max(80).optional(),
  primaryCtaHref: z.string().min(1).max(300).optional(),
  secondaryCtaLabel: z.string().min(1).max(80).optional(),
  secondaryCtaHref: z.string().min(1).max(300).optional(),
  trustLine: z.string().max(300).nullable().optional(),
  heroImageUrl: z.string().nullable().optional(),
  backgroundGradient: z.string().nullable().optional(),
  askPlaceholder: z.string().max(200).nullable().optional(),
  eyebrow: z.string().max(120).nullable().optional(),
  headlineAccent: z.string().max(120).nullable().optional(),
  showAskInHero: z.boolean().optional(),
})

export const statisticSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  sortOrder: z.number().int().optional(),
  icon: z.string().max(40).nullable().optional(),
})

export const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1),
  answer: z.string().min(1),
  sortOrder: z.number().int().optional(),
})

export const ctaWriteSchema = z.object({
  headline: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  primaryCtaLabel: z.string().min(1).max(80).optional(),
  primaryCtaHref: z.string().min(1).max(300).optional(),
  secondaryCtaLabel: z.string().min(1).max(80).optional(),
  secondaryCtaHref: z.string().min(1).max(300).optional(),
})

export const featuredSchema = z.object({
  id: z.string().optional(),
  kind: z.enum(["CATEGORY", "ARTICLE", "GUIDE", "TOOL"]),
  entityId: z.string().min(1),
  sortOrder: z.number().int().optional(),
  selectionMode: z.enum(["MANUAL", "AUTOMATIC"]).optional(),
  titleOverride: z.string().nullable().optional(),
  icon: z.string().max(40).nullable().optional(),
  iconColor: z.string().max(20).nullable().optional(),
})

export const testimonialSchema = z.object({
  id: z.string().optional(),
  quote: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  sortOrder: z.number().int().optional(),
})

export const askWriteSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  placeholder: z.string().min(1).optional(),
  suggestions: z.array(z.string()).optional(),
})

export const whyItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().max(40).nullable().optional(),
})

export const newsletterWriteSchema = z.object({
  headline: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  privacy: z.string().optional(),
  placeholder: z.string().optional(),
  ctaLabel: z.string().optional(),
  socialProof: z.string().max(200).nullable().optional(),
})

export const latestArticlesWriteSchema = z.object({
  mode: z.enum(["AUTOMATIC", "MANUAL"]).optional(),
  articleIds: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(12).optional(),
})

export const homepageWriteSchema = z.object({
  status: homepageStatusSchema.optional(),
  sections: z.array(sectionWriteSchema).optional(),
  hero: heroWriteSchema.optional(),
  statistics: z.array(statisticSchema).optional(),
  faqs: z.array(faqSchema).optional(),
  cta: ctaWriteSchema.optional(),
  featured: z.array(featuredSchema).optional(),
  testimonials: z.array(testimonialSchema).optional(),
  ask: askWriteSchema.optional(),
  why: z.array(whyItemSchema).optional(),
  newsletter: newsletterWriteSchema.optional(),
  latestArticles: latestArticlesWriteSchema.optional(),
})
