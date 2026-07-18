import "server-only";

import type { MenuItemType, MenuLocationKey, Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db/prisma";
import {
  SEEDED_NAVIGATION_CONFIG,
  type NavigationConfig,
  type NavLink,
} from "@/services/settings/navigation";
import type {
  LegalLinkRecord,
  MenuItemRecord,
  MenuItemWrite,
  MenuLocationRecord,
  NavigationMenuRecord,
  NavigationMenuWrite,
  NavigationOverview,
  NavigationSiteSettingsRecord,
  SocialLinkRecord,
} from "@/services/navigation/types";

const SETTINGS_KEY = "main";

function db() {
  return getPrisma();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function mapItem(row: {
  id: string;
  menuId: string;
  parentId: string | null;
  label: string;
  itemType: MenuItemType;
  href: string | null;
  entityId: string | null;
  icon: string | null;
  openInNewTab: boolean;
  visible: boolean;
  badgeLabel: string | null;
  sortOrder: number;
  children?: Parameters<typeof mapItem>[0][];
}): MenuItemRecord {
  return {
    id: row.id,
    menuId: row.menuId,
    parentId: row.parentId,
    label: row.label,
    itemType: row.itemType,
    href: row.href,
    entityId: row.entityId,
    icon: row.icon,
    openInNewTab: row.openInNewTab,
    visible: row.visible,
    badgeLabel: row.badgeLabel,
    sortOrder: row.sortOrder,
    children: (row.children ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(mapItem),
  };
}

const itemInclude = {
  children: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      children: {
        orderBy: { sortOrder: "asc" as const },
      },
    },
  },
} satisfies Prisma.MenuItemInclude;

async function ensureSeeded(): Promise<void> {
  const existing = await db().navigationSiteSettings.findUnique({
    where: { key: SETTINGS_KEY },
  });
  if (existing) return;

  const seed = SEEDED_NAVIGATION_CONFIG;
  await db().$transaction(async (tx) => {
    await tx.navigationSiteSettings.create({
      data: {
        key: SETTINGS_KEY,
        brandName: seed.brand.name,
        brandHref: seed.brand.href,
        brandTagline: seed.brand.tagline,
        signInHref: seed.signInHref,
        copyrightText: `© ${new Date().getFullYear()} ${seed.brand.name}. All rights reserved.`,
        newsletterEnabled: seed.newsletter.enabled,
        newsletterHeadline: seed.newsletter.headline,
        newsletterPlaceholder: seed.newsletter.placeholder,
      },
    });

    const mainMenu = await tx.navigationMenu.create({
      data: {
        name: "Main menu",
        slug: "main-menu",
        description: "Primary site navigation",
        maxDepth: 3,
      },
    });

    const mobileMenu = await tx.navigationMenu.create({
      data: {
        name: "Mobile menu",
        slug: "mobile-menu",
        description: "Mobile sheet navigation (can diverge from desktop)",
        maxDepth: 3,
      },
    });

    const footerMenu = await tx.navigationMenu.create({
      data: {
        name: "Footer menu",
        slug: "footer-menu",
        description: "Footer link columns",
        maxDepth: 2,
      },
    });

    const utilityMenu = await tx.navigationMenu.create({
      data: {
        name: "Utility menu",
        slug: "utility-menu",
        description: "Header utility links",
        maxDepth: 1,
      },
    });

    const quickMenu = await tx.navigationMenu.create({
      data: {
        name: "Quick links",
        slug: "quick-links",
        description: "Quick action links",
        maxDepth: 1,
      },
    });

    async function createItems(
      menuId: string,
      links: NavLink[],
      parentId: string | null,
    ) {
      for (const [index, link] of links.entries()) {
        const created = await tx.menuItem.create({
          data: {
            menuId,
            parentId,
            label: link.label,
            itemType: "CUSTOM_URL",
            href: link.href,
            openInNewTab: link.openInNewTab ?? false,
            visible: true,
            badgeLabel: link.badgeLabel ?? null,
            sortOrder: index,
          },
        });
        if (link.children?.length) {
          await createItems(menuId, link.children, created.id);
        }
      }
    }

    await createItems(mainMenu.id, seed.primary, null);
    await createItems(mobileMenu.id, seed.primary, null);

    for (const [sectionIndex, section] of seed.footer.entries()) {
      if (section.id === "legal") continue;
      const parent = await tx.menuItem.create({
        data: {
          menuId: footerMenu.id,
          label: section.title,
          itemType: "CUSTOM_URL",
          href: "#",
          visible: true,
          sortOrder: sectionIndex,
        },
      });
      for (const [index, link] of section.links.entries()) {
        await tx.menuItem.create({
          data: {
            menuId: footerMenu.id,
            parentId: parent.id,
            label: link.label,
            itemType: "CUSTOM_URL",
            href: link.href,
            visible: true,
            sortOrder: index,
          },
        });
      }
    }

    await createItems(
      utilityMenu.id,
      [{ label: "Search", href: "/search" }],
      null,
    );
    await createItems(
      quickMenu.id,
      [{ label: "Ask Mendanize", href: "/ask" }],
      null,
    );

    await tx.menuLocation.createMany({
      data: [
        { key: "MAIN", label: "Main navigation", menuId: mainMenu.id, sortOrder: 0 },
        {
          key: "MOBILE",
          label: "Mobile navigation",
          menuId: mobileMenu.id,
          sortOrder: 1,
        },
        { key: "FOOTER", label: "Footer", menuId: footerMenu.id, sortOrder: 2 },
        {
          key: "UTILITY",
          label: "Utility",
          menuId: utilityMenu.id,
          sortOrder: 3,
        },
        {
          key: "QUICK_LINKS",
          label: "Quick links",
          menuId: quickMenu.id,
          sortOrder: 4,
        },
      ],
    });

    await tx.socialLink.createMany({
      data: seed.social.map((s, index) => ({
        platform: s.label.toLowerCase(),
        label: s.label,
        href: s.href,
        visible: true,
        sortOrder: index,
      })),
    });

    const legalSection = seed.footer.find((s) => s.id === "legal");
    await tx.legalLink.createMany({
      data: (legalSection?.links ?? [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ]).map((l, index) => ({
        label: l.label,
        href: l.href,
        visible: true,
        sortOrder: index,
      })),
    });
  });
}

function itemToNavLink(item: MenuItemRecord): NavLink | null {
  if (!item.visible) return null;
  const href = item.href?.trim() || "#";
  const children = item.children
    .map(itemToNavLink)
    .filter((c): c is NavLink => c !== null);
  if (href === "#" && !children.length) return null;
  const link: NavLink = {
    label: item.label,
    href: href === "#" && children.length ? "#" : href,
    openInNewTab: item.openInNewTab || undefined,
    badgeLabel: item.badgeLabel || undefined,
  };
  if (children.length) link.children = children;
  return link;
}

function menuItemsToNavLinks(items: MenuItemRecord[]): NavLink[] {
  return items.map(itemToNavLink).filter((l): l is NavLink => l !== null);
}

async function loadLocationMenu(
  key: MenuLocationKey,
): Promise<MenuItemRecord[]> {
  const loc = await db().menuLocation.findFirst({
    where: { key },
    orderBy: { sortOrder: "asc" },
    include: {
      menu: {
        include: {
          items: {
            where: { parentId: null },
            orderBy: { sortOrder: "asc" },
            include: itemInclude,
          },
        },
      },
    },
  });
  if (!loc?.menu) return [];
  return loc.menu.items.map(mapItem);
}

export async function getPersistedNavigationConfig(): Promise<NavigationConfig | null> {
  await ensureSeeded();

  const settings = await db().navigationSiteSettings.findUnique({
    where: { key: SETTINGS_KEY },
  });
  if (!settings) return null;

  const [primaryItems, mobileItems, footerItems] = await Promise.all([
    loadLocationMenu("MAIN"),
    loadLocationMenu("MOBILE"),
    loadLocationMenu("FOOTER"),
  ]);

  const primary = menuItemsToNavLinks(primaryItems);
  const mobile = menuItemsToNavLinks(mobileItems);

  const footerSections = footerItems
    .filter((item) => item.visible)
    .map((item) => {
      const links = menuItemsToNavLinks(item.children);
      if (!links.length && item.href && item.href !== "#") {
        return {
          id: item.id,
          title: item.label,
          links: [
            {
              label: item.label,
              href: item.href,
              openInNewTab: item.openInNewTab || undefined,
            },
          ],
        };
      }
      return { id: item.id, title: item.label, links };
    })
    .filter((s) => s.links.length > 0);

  const [social, legal] = await Promise.all([
    db().socialLink.findMany({
      where: { visible: true },
      orderBy: { sortOrder: "asc" },
    }),
    db().legalLink.findMany({
      where: { visible: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (legal.length) {
    footerSections.push({
      id: "legal",
      title: "Legal",
      links: legal.map((l) => ({ label: l.label, href: l.href })),
    });
  }

  return {
    brand: {
      name: settings.brandName,
      href: settings.brandHref,
      tagline: settings.brandTagline ?? settings.brandName,
    },
    primary,
    mobile: mobile.length ? mobile : primary,
    signInHref: settings.signInHref,
    footer: footerSections,
    social: social.map((s) => ({ label: s.label, href: s.href })),
    newsletter: {
      enabled: settings.newsletterEnabled,
      headline: settings.newsletterHeadline ?? "Get learning tips in your inbox",
      placeholder: settings.newsletterPlaceholder ?? "you@example.com",
    },
    copyrightText: settings.copyrightText,
  };
}

export async function getNavigationOverview(): Promise<NavigationOverview> {
  await ensureSeeded();
  const [settings, menus, locations, socialCount, legalCount] = await Promise.all([
    db().navigationSiteSettings.findUniqueOrThrow({ where: { key: SETTINGS_KEY } }),
    db().navigationMenu.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { items: true } } },
    }),
    db().menuLocation.findMany({
      orderBy: { sortOrder: "asc" },
      include: { menu: { select: { name: true } } },
    }),
    db().socialLink.count(),
    db().legalLink.count(),
  ]);

  return {
    settings: mapSettings(settings),
    menus: menus.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      updatedAt: m.updatedAt.toISOString(),
      itemCount: m._count.items,
    })),
    locations: locations.map(mapLocation),
    socialCount,
    legalCount,
  };
}

function mapSettings(s: {
  id: string;
  brandName: string;
  brandHref: string;
  brandTagline: string | null;
  signInHref: string;
  copyrightText: string | null;
  newsletterEnabled: boolean;
  newsletterHeadline: string | null;
  newsletterPlaceholder: string | null;
  updatedAt: Date;
}): NavigationSiteSettingsRecord {
  return {
    id: s.id,
    brandName: s.brandName,
    brandHref: s.brandHref,
    brandTagline: s.brandTagline,
    signInHref: s.signInHref,
    copyrightText: s.copyrightText,
    newsletterEnabled: s.newsletterEnabled,
    newsletterHeadline: s.newsletterHeadline,
    newsletterPlaceholder: s.newsletterPlaceholder,
    updatedAt: s.updatedAt.toISOString(),
  };
}

function mapLocation(l: {
  id: string;
  key: MenuLocationKey;
  label: string;
  menuId: string | null;
  columnTitle: string | null;
  sortOrder: number;
  menu?: { name: string } | null;
}): MenuLocationRecord {
  return {
    id: l.id,
    key: l.key,
    label: l.label,
    menuId: l.menuId,
    menuName: l.menu?.name ?? null,
    columnTitle: l.columnTitle,
    sortOrder: l.sortOrder,
  };
}

export async function getNavigationSettings(): Promise<NavigationSiteSettingsRecord> {
  await ensureSeeded();
  const s = await db().navigationSiteSettings.findUniqueOrThrow({
    where: { key: SETTINGS_KEY },
  });
  return mapSettings(s);
}

export async function updateNavigationSettings(input: {
  brandName?: string;
  brandHref?: string;
  brandTagline?: string | null;
  signInHref?: string;
  copyrightText?: string | null;
  newsletterEnabled?: boolean;
  newsletterHeadline?: string | null;
  newsletterPlaceholder?: string | null;
}): Promise<NavigationSiteSettingsRecord> {
  await ensureSeeded();
  const s = await db().navigationSiteSettings.update({
    where: { key: SETTINGS_KEY },
    data: {
      ...(input.brandName !== undefined ? { brandName: input.brandName.trim() } : {}),
      ...(input.brandHref !== undefined ? { brandHref: input.brandHref.trim() } : {}),
      ...(input.brandTagline !== undefined
        ? { brandTagline: input.brandTagline?.trim() || null }
        : {}),
      ...(input.signInHref !== undefined ? { signInHref: input.signInHref.trim() } : {}),
      ...(input.copyrightText !== undefined
        ? { copyrightText: input.copyrightText?.trim() || null }
        : {}),
      ...(input.newsletterEnabled !== undefined
        ? { newsletterEnabled: input.newsletterEnabled }
        : {}),
      ...(input.newsletterHeadline !== undefined
        ? { newsletterHeadline: input.newsletterHeadline?.trim() || null }
        : {}),
      ...(input.newsletterPlaceholder !== undefined
        ? { newsletterPlaceholder: input.newsletterPlaceholder?.trim() || null }
        : {}),
    },
  });
  return mapSettings(s);
}

export async function listMenus(): Promise<NavigationMenuRecord[]> {
  await ensureSeeded();
  const menus = await db().navigationMenu.findMany({
    orderBy: { name: "asc" },
    include: {
      items: {
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
        include: itemInclude,
      },
    },
  });
  return menus.map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    description: m.description,
    maxDepth: m.maxDepth,
    items: m.items.map(mapItem),
    updatedAt: m.updatedAt.toISOString(),
  }));
}

export async function getMenuById(id: string): Promise<NavigationMenuRecord> {
  await ensureSeeded();
  const m = await db().navigationMenu.findUnique({
    where: { id },
    include: {
      items: {
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
        include: itemInclude,
      },
    },
  });
  if (!m) throw new Error("Menu not found.");
  return {
    id: m.id,
    name: m.name,
    slug: m.slug,
    description: m.description,
    maxDepth: m.maxDepth,
    items: m.items.map(mapItem),
    updatedAt: m.updatedAt.toISOString(),
  };
}

export async function getMenuForLocation(
  key: MenuLocationKey,
): Promise<NavigationMenuRecord | null> {
  await ensureSeeded();
  const loc = await db().menuLocation.findFirst({
    where: { key },
    orderBy: { sortOrder: "asc" },
  });
  if (!loc?.menuId) return null;
  return getMenuById(loc.menuId);
}

async function replaceMenuItems(
  menuId: string,
  items: MenuItemWrite[],
  maxDepth: number,
): Promise<void> {
  await db().menuItem.deleteMany({ where: { menuId } });

  async function insert(
    writes: MenuItemWrite[],
    parentId: string | null,
    depth: number,
  ) {
    if (depth > maxDepth) {
      throw new Error(`Menu exceeds max depth of ${maxDepth}.`);
    }
    for (const [index, write] of writes.entries()) {
      const created = await db().menuItem.create({
        data: {
          menuId,
          parentId,
          label: write.label.trim(),
          itemType: (write.itemType ?? "CUSTOM_URL") as MenuItemType,
          href: write.href?.trim() || null,
          entityId: write.entityId?.trim() || null,
          icon: write.icon?.trim() || null,
          openInNewTab: write.openInNewTab ?? false,
          visible: write.visible ?? true,
          badgeLabel: write.badgeLabel?.trim() || null,
          sortOrder: write.sortOrder ?? index,
        },
      });
      if (write.children?.length) {
        await insert(write.children, created.id, depth + 1);
      }
    }
  }

  await insert(items, null, 1);
}

export async function createMenu(
  input: NavigationMenuWrite,
): Promise<NavigationMenuRecord> {
  await ensureSeeded();
  const name = input.name.trim();
  if (!name) {
    throw new Error("Menu name is required.");
  }
  let slug = (input.slug?.trim() || slugify(name)).slice(0, 80);
  if (!slug) slug = `menu-${Date.now()}`;
  const clash = await db().navigationMenu.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  const menu = await db().navigationMenu.create({
    data: {
      name,
      slug,
      description: input.description?.trim() || null,
      maxDepth: input.maxDepth ?? 3,
    },
  });

  if (input.items?.length) {
    await replaceMenuItems(menu.id, input.items, menu.maxDepth);
  }

  return getMenuById(menu.id);
}

export async function updateMenu(
  id: string,
  input: NavigationMenuWrite & { items?: MenuItemWrite[] },
): Promise<NavigationMenuRecord> {
  await ensureSeeded();
  const existing = await db().navigationMenu.findUnique({ where: { id } });
  if (!existing) throw new Error("Menu not found.");

  const name = input.name.trim();
  if (!name) {
    throw new Error("Menu name is required.");
  }

  let slug = existing.slug;
  if (input.slug !== undefined) {
    slug = (input.slug.trim() || slugify(name)).slice(0, 80);
    const clash = await db().navigationMenu.findFirst({
      where: { slug, NOT: { id } },
    });
    if (clash) {
      throw new Error("That menu slug is already in use.");
    }
  }

  const maxDepth = input.maxDepth ?? existing.maxDepth;
  await db().navigationMenu.update({
    where: { id },
    data: {
      name,
      slug,
      description:
        input.description !== undefined
          ? input.description?.trim() || null
          : existing.description,
      maxDepth,
    },
  });

  if (input.items !== undefined) {
    await replaceMenuItems(id, input.items, maxDepth);
  }

  return getMenuById(id);
}

export async function deleteMenu(id: string): Promise<void> {
  await ensureSeeded();
  const assigned = await db().menuLocation.count({ where: { menuId: id } });
  if (assigned > 0) {
    throw new Error("Unassign this menu from all locations before deleting.");
  }
  await db().navigationMenu.delete({ where: { id } });
}

export async function listLocations(): Promise<MenuLocationRecord[]> {
  await ensureSeeded();
  const rows = await db().menuLocation.findMany({
    orderBy: { sortOrder: "asc" },
    include: { menu: { select: { name: true } } },
  });
  return rows.map(mapLocation);
}

export async function assignLocationMenu(
  key: MenuLocationKey,
  menuId: string | null,
): Promise<MenuLocationRecord> {
  await ensureSeeded();
  if (menuId) {
    const menu = await db().navigationMenu.findUnique({ where: { id: menuId } });
    if (!menu) throw new Error("Menu not found.");
  }
  const loc = await db().menuLocation.findFirst({
    where: { key },
    orderBy: { sortOrder: "asc" },
  });
  if (!loc) {
    throw new Error("Menu location not found.");
  }
  const row = await db().menuLocation.update({
    where: { id: loc.id },
    data: { menuId },
    include: { menu: { select: { name: true } } },
  });
  return mapLocation(row);
}

export async function listSocialLinks(): Promise<SocialLinkRecord[]> {
  await ensureSeeded();
  const rows = await db().socialLink.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((s) => ({
    id: s.id,
    platform: s.platform,
    label: s.label,
    href: s.href,
    icon: s.icon,
    visible: s.visible,
    sortOrder: s.sortOrder,
  }));
}

export async function saveSocialLinks(
  links: Array<{
    platform: string;
    label: string;
    href: string;
    icon?: string | null;
    visible?: boolean;
  }>,
): Promise<SocialLinkRecord[]> {
  await ensureSeeded();
  await db().$transaction(async (tx) => {
    await tx.socialLink.deleteMany({});
    for (const [index, link] of links.entries()) {
      await tx.socialLink.create({
        data: {
          platform: link.platform.trim() || link.label.trim().toLowerCase(),
          label: link.label.trim(),
          href: link.href.trim(),
          icon: link.icon?.trim() || null,
          visible: link.visible ?? true,
          sortOrder: index,
        },
      });
    }
  });
  return listSocialLinks();
}

export async function listLegalLinks(): Promise<LegalLinkRecord[]> {
  await ensureSeeded();
  const rows = await db().legalLink.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((l) => ({
    id: l.id,
    label: l.label,
    href: l.href,
    visible: l.visible,
    sortOrder: l.sortOrder,
  }));
}

export async function saveLegalLinks(
  links: Array<{ label: string; href: string; visible?: boolean }>,
): Promise<LegalLinkRecord[]> {
  await ensureSeeded();
  await db().$transaction(async (tx) => {
    await tx.legalLink.deleteMany({});
    for (const [index, link] of links.entries()) {
      await tx.legalLink.create({
        data: {
          label: link.label.trim(),
          href: link.href.trim(),
          visible: link.visible ?? true,
          sortOrder: index,
        },
      });
    }
  });
  return listLegalLinks();
}
