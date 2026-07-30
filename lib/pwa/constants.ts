/** PWA constants — MES-050 */

export const PWA_CACHE_VERSION = "mes050-v1";

export const PWA_SHELL_CACHE = `${PWA_CACHE_VERSION}-shell`;
export const PWA_LEARNING_CACHE = `${PWA_CACHE_VERSION}-learning`;

/** Max recently-viewed learning items stored offline (IndexedDB quota guard). */
export const PWA_MAX_OFFLINE_ITEMS = 25;

/** URL prefixes excluded from service-worker caching (Admin dashboard). */
export const PWA_EXCLUDED_PREFIXES = ["/dashboard", "/api/auth"];

/** Learning paths eligible for offline cache. */
export const PWA_LEARNING_PATH_PATTERNS = [
  /^\/articles\/[^/]+$/,
  /^\/guides\/[^/]+\/lessons\/[^/]+$/,
  /^\/account\/articles\/[^/]+$/,
  /^\/account\/guides\/[^/]+\/lessons\/[^/]+$/,
];

export const PWA_INSTALL_DISMISS_KEY = "mendanize.pwa.install.dismissed";
export const PWA_INSTALL_DISMISS_DAYS = 14;

export const PWA_OFFLINE_DB_NAME = "mendanize-offline";
export const PWA_OFFLINE_DB_VERSION = 1;
export const PWA_OFFLINE_STORE = "learning";
