/**
 * Mendanize service worker — MES-050.
 * Shell caching + offline fallback + learning-path cache.
 * Admin /dashboard/* is excluded.
 */

const CACHE_VERSION = "mes050-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const LEARNING_CACHE = `${CACHE_VERSION}-learning`;

const SHELL_URLS = ["/offline", "/icons/icon-192.png", "/icons/icon-512.png"];

const EXCLUDED_PREFIXES = ["/dashboard", "/api/auth"];

const LEARNING_PATTERNS = [
  /^\/articles\/[^/]+$/,
  /^\/guides\/[^/]+\/lessons\/[^/]+$/,
  /^\/account\/articles\/[^/]+$/,
  /^\/account\/guides\/[^/]+\/lessons\/[^/]+$/,
];

function isExcluded(url) {
  const path = new URL(url).pathname;
  return EXCLUDED_PREFIXES.some((p) => path.startsWith(p));
}

function isLearningPath(pathname) {
  return LEARNING_PATTERNS.some((re) => re.test(pathname));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("mes0") && k !== SHELL_CACHE && k !== LEARNING_CACHE)
          .map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isExcluded(url.href)) return;

  // Static assets: cache-first
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(request, clone));
          }
          return res;
        });
      }),
    );
    return;
  }

  // Learning paths: network-first, cache on success
  if (request.mode === "navigate" && isLearningPath(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(LEARNING_CACHE).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/offline")),
        ),
    );
    return;
  }

  // Navigation: network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => res)
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/offline")),
        ),
    );
    return;
  }
});
