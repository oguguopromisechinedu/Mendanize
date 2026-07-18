/** Navigation Shared Service types (MES-016). */

export type MenuItemTypeValue =
  | "INTERNAL_PAGE"
  | "ARTICLE"
  | "CATEGORY"
  | "TOPIC"
  | "GUIDE"
  | "AI_TOOL"
  | "CUSTOM_URL";

export type MenuLocationKeyValue =
  | "MAIN"
  | "MOBILE"
  | "FOOTER"
  | "UTILITY"
  | "QUICK_LINKS";

export type MenuItemRecord = {
  id: string;
  menuId: string;
  parentId: string | null;
  label: string;
  itemType: MenuItemTypeValue;
  href: string | null;
  entityId: string | null;
  icon: string | null;
  openInNewTab: boolean;
  visible: boolean;
  badgeLabel: string | null;
  sortOrder: number;
  children: MenuItemRecord[];
};

export type NavigationMenuRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  maxDepth: number;
  items: MenuItemRecord[];
  updatedAt: string;
};

export type MenuLocationRecord = {
  id: string;
  key: MenuLocationKeyValue;
  label: string;
  menuId: string | null;
  menuName: string | null;
  columnTitle: string | null;
  sortOrder: number;
};

export type SocialLinkRecord = {
  id: string;
  platform: string;
  label: string;
  href: string;
  icon: string | null;
  visible: boolean;
  sortOrder: number;
};

export type LegalLinkRecord = {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  sortOrder: number;
};

export type NavigationSiteSettingsRecord = {
  id: string;
  brandName: string;
  brandHref: string;
  brandTagline: string | null;
  signInHref: string;
  copyrightText: string | null;
  newsletterEnabled: boolean;
  newsletterHeadline: string | null;
  newsletterPlaceholder: string | null;
  updatedAt: string;
};

export type MenuItemWrite = {
  id?: string;
  parentId?: string | null;
  label: string;
  itemType?: MenuItemTypeValue;
  href?: string | null;
  entityId?: string | null;
  icon?: string | null;
  openInNewTab?: boolean;
  visible?: boolean;
  badgeLabel?: string | null;
  sortOrder?: number;
  children?: MenuItemWrite[];
};

export type NavigationMenuWrite = {
  name: string;
  slug?: string;
  description?: string | null;
  maxDepth?: number;
  items?: MenuItemWrite[];
};

export type NavigationOverview = {
  settings: NavigationSiteSettingsRecord;
  menus: Array<Pick<NavigationMenuRecord, "id" | "name" | "slug" | "updatedAt"> & { itemCount: number }>;
  locations: MenuLocationRecord[];
  socialCount: number;
  legalCount: number;
};
