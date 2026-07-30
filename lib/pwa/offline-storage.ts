/**
 * IndexedDB storage for offline learning content — MES-050.
 * Stores metadata + HTML snapshot of recently viewed articles/lessons.
 * Quota: PWA_MAX_OFFLINE_ITEMS entries; oldest evicted first.
 */

import {
  PWA_MAX_OFFLINE_ITEMS,
  PWA_OFFLINE_DB_NAME,
  PWA_OFFLINE_DB_VERSION,
  PWA_OFFLINE_STORE,
} from "./constants";

export type OfflineLearningKind = "article" | "guide_lesson";

export type OfflineLearningEntry = {
  key: string;
  kind: OfflineLearningKind;
  title: string;
  slug: string;
  lessonSlug?: string;
  href: string;
  html: string;
  cachedAt: string;
};

function entryKey(kind: OfflineLearningKind, slug: string, lessonSlug?: string) {
  return lessonSlug ? `${kind}:${slug}:${lessonSlug}` : `${kind}:${slug}`;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PWA_OFFLINE_DB_NAME, PWA_OFFLINE_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PWA_OFFLINE_STORE)) {
        const store = db.createObjectStore(PWA_OFFLINE_STORE, { keyPath: "key" });
        store.createIndex("cachedAt", "cachedAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveOfflineLearningContent(input: {
  kind: OfflineLearningKind;
  title: string;
  slug: string;
  lessonSlug?: string;
  href: string;
  html: string;
}): Promise<void> {
  if (typeof indexedDB === "undefined") return;

  const db = await openDb();
  const key = entryKey(input.kind, input.slug, input.lessonSlug);
  const entry: OfflineLearningEntry = {
    key,
    kind: input.kind,
    title: input.title,
    slug: input.slug,
    lessonSlug: input.lessonSlug,
    href: input.href,
    html: input.html,
    cachedAt: new Date().toISOString(),
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PWA_OFFLINE_STORE, "readwrite");
    tx.objectStore(PWA_OFFLINE_STORE).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  // Evict oldest if over quota
  const all = await listOfflineLearningContent();
  if (all.length > PWA_MAX_OFFLINE_ITEMS) {
    const toRemove = all
      .sort((a, b) => a.cachedAt.localeCompare(b.cachedAt))
      .slice(0, all.length - PWA_MAX_OFFLINE_ITEMS);
    for (const item of toRemove) {
      await deleteOfflineLearningContent(item.key);
    }
  }

  db.close();
}

export async function listOfflineLearningContent(): Promise<OfflineLearningEntry[]> {
  if (typeof indexedDB === "undefined") return [];

  const db = await openDb();
  const entries = await new Promise<OfflineLearningEntry[]>((resolve, reject) => {
    const tx = db.transaction(PWA_OFFLINE_STORE, "readonly");
    const req = tx.objectStore(PWA_OFFLINE_STORE).getAll();
    req.onsuccess = () => resolve(req.result as OfflineLearningEntry[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return entries.sort((a, b) => b.cachedAt.localeCompare(a.cachedAt));
}

export async function getOfflineLearningContent(
  key: string,
): Promise<OfflineLearningEntry | null> {
  if (typeof indexedDB === "undefined") return null;

  const db = await openDb();
  const entry = await new Promise<OfflineLearningEntry | null>((resolve, reject) => {
    const tx = db.transaction(PWA_OFFLINE_STORE, "readonly");
    const req = tx.objectStore(PWA_OFFLINE_STORE).get(key);
    req.onsuccess = () => resolve((req.result as OfflineLearningEntry) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return entry;
}

export async function deleteOfflineLearningContent(key: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PWA_OFFLINE_STORE, "readwrite");
    tx.objectStore(PWA_OFFLINE_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function isLearningPath(pathname: string): boolean {
  return (
    /^\/articles\/[^/]+$/.test(pathname) ||
    /^\/guides\/[^/]+\/lessons\/[^/]+$/.test(pathname) ||
    /^\/account\/articles\/[^/]+$/.test(pathname) ||
    /^\/account\/guides\/[^/]+\/lessons\/[^/]+$/.test(pathname)
  );
}
