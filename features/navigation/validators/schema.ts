import { z } from "zod";

export const menuItemSchema: z.ZodType<{
  label: string;
  itemType?: string;
  href?: string | null;
  entityId?: string | null;
  icon?: string | null;
  openInNewTab?: boolean;
  visible?: boolean;
  badgeLabel?: string | null;
  sortOrder?: number;
  children?: unknown[];
}> = z.lazy(() =>
  z.object({
    label: z.string().min(1).max(120),
    itemType: z
      .enum([
        "INTERNAL_PAGE",
        "ARTICLE",
        "CATEGORY",
        "TOPIC",
        "GUIDE",
        "AI_TOOL",
        "CUSTOM_URL",
      ])
      .optional(),
    href: z.string().max(500).nullable().optional(),
    entityId: z.string().max(120).nullable().optional(),
    icon: z.string().max(80).nullable().optional(),
    openInNewTab: z.boolean().optional(),
    visible: z.boolean().optional(),
    badgeLabel: z.string().max(40).nullable().optional(),
    sortOrder: z.number().int().min(0).optional(),
    children: z.array(menuItemSchema).optional(),
  }),
);

export const menuUpdateSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().max(80).optional(),
  description: z.string().max(500).nullable().optional(),
  maxDepth: z.number().int().min(1).max(5).optional(),
  items: z.array(menuItemSchema),
});

export const settingsSchema = z.object({
  brandName: z.string().min(1).max(80),
  brandHref: z.string().min(1).max(200),
  brandTagline: z.string().max(200).nullable().optional(),
  signInHref: z.string().min(1).max(200),
  copyrightText: z.string().max(300).nullable().optional(),
  newsletterEnabled: z.boolean(),
  newsletterHeadline: z.string().max(200).nullable().optional(),
  newsletterPlaceholder: z.string().max(120).nullable().optional(),
});

export const socialLinksSchema = z.array(
  z.object({
    platform: z.string().min(1).max(40),
    label: z.string().min(1).max(80),
    href: z.string().min(1).max(500),
    icon: z.string().max(80).nullable().optional(),
    visible: z.boolean().optional(),
  }),
);

export const legalLinksSchema = z.array(
  z.object({
    label: z.string().min(1).max(80),
    href: z.string().min(1).max(500),
    visible: z.boolean().optional(),
  }),
);

export const assignLocationSchema = z.object({
  key: z.enum(["MAIN", "MOBILE", "FOOTER", "UTILITY", "QUICK_LINKS"]),
  menuId: z.string().nullable(),
});
