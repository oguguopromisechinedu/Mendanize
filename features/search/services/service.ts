import {
  getSearchDiscovery,
  getSearchSettingsOverview,
  listFilterOptions,
  search,
  type SearchParams,
} from "@/services/search";

export async function loadSearchSettings() {
  return getSearchSettingsOverview();
}

export async function loadSearchDiscovery(prefix = "") {
  return getSearchDiscovery(prefix);
}

export async function loadSearchResults(params: SearchParams) {
  return search(params);
}

export async function loadFilterOptions() {
  return listFilterOptions();
}
