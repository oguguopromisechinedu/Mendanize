"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { BookOpen, Trash2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteOfflineLearningContent,
  listOfflineLearningContent,
  type OfflineLearningEntry,
} from "@/lib/pwa/offline-storage";
import { PWA_MAX_OFFLINE_ITEMS } from "@/lib/pwa/constants";

function subscribeOnline(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getOnlineServerSnapshot() {
  return true;
}

export function OfflineLibraryView() {
  const [items, setItems] = useState<OfflineLearningEntry[]>([]);
  const [selected, setSelected] = useState<OfflineLearningEntry | null>(null);
  const online = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getOnlineServerSnapshot,
  );

  useEffect(() => {
    listOfflineLearningContent().then(setItems);
  }, []);

  async function handleRemove(key: string) {
    await deleteOfflineLearningContent(key);
    const next = await listOfflineLearningContent();
    setItems(next);
    if (selected?.key === key) setSelected(null);
  }

  if (selected) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
          ← Back to library
        </Button>
        <h2 className="text-xl font-semibold">{selected.title}</h2>
        <p className="text-xs text-muted-foreground">
          Cached {new Date(selected.cachedAt).toLocaleString()}
        </p>
        <article
          className="prose prose-invert max-w-none"
          data-offline-content
          dangerouslySetInnerHTML={{ __html: selected.html }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!online && (
        <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          <WifiOff className="h-4 w-4 shrink-0" />
          You&apos;re offline. Cached content below is available to read.
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Recently viewed articles and guide lessons are saved here for offline reading.
        Up to {PWA_MAX_OFFLINE_ITEMS} items; oldest are removed automatically.
      </p>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p>No offline content yet.</p>
          <p className="mt-1 text-xs">
            Open an article or guide lesson while online to cache it here.
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                className="min-w-0 flex-1 text-left hover:underline"
                onClick={() => setSelected(item)}
              >
                <p className="truncate font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.kind === "article" ? "Article" : "Guide lesson"} ·{" "}
                  {new Date(item.cachedAt).toLocaleDateString()}
                </p>
              </button>
              {online && (
                <Link
                  href={item.href}
                  className="shrink-0 text-xs text-primary hover:underline"
                >
                  Open live
                </Link>
              )}
              <button
                type="button"
                onClick={() => handleRemove(item.key)}
                className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                aria-label={`Remove ${item.title} from offline library`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
