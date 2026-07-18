import {
  getMenuForLocation,
  getNavigationOverview,
  getNavigationSettings,
  listLegalLinks,
  listLocations,
  listMenus,
  listSocialLinks,
} from "@/services/navigation";
import type { MenuLocationKey } from "@prisma/client";

export async function loadNavigationOverview() {
  return getNavigationOverview();
}

export async function loadNavigationSettings() {
  return getNavigationSettings();
}

export async function loadMenuForLocation(key: MenuLocationKey) {
  return getMenuForLocation(key);
}

export async function loadLocationsAndMenus() {
  const [locations, menus] = await Promise.all([listLocations(), listMenus()]);
  return { locations, menus };
}

export async function loadSocialLinks() {
  return listSocialLinks();
}

export async function loadLegalLinks() {
  return listLegalLinks();
}
