"use client";

import { useEffect, useState } from "react";
import { Mic, SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SearchDiscoveryPayload } from "@/services/search/types";
import { SEARCH_SHORTCUT_HINT } from "@/features/search/constants/constants";

/**
 * Client wrapper that loads discovery over the public API for the header modal.
 * Prefer passing server-loaded discovery via GlobalSearch when available.
 */
export function SearchModal({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [discovery, setDiscovery] = useState<SearchDiscoveryPayload | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open || discovery) return;
    let cancelled = false;
    fetch("/api/public/search?mode=discovery")
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json?.data) setDiscovery(json.data as SearchDiscoveryPayload);
      })
      .catch(() => {
        if (!cancelled) {
          setDiscovery({
            suggestions: [],
            recent: [],
            trending: [],
            recommended: [],
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, discovery]);

  const q = query.trim().toLowerCase();
  const suggestions = (discovery?.suggestions ?? []).filter(
    (s) => !q || s.label.toLowerCase().includes(q),
  );

  function go(term: string) {
    const next = term.trim();
    if (!next) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(next)}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={triggerClassName}
          aria-label="Open search"
        >
          <SearchIcon className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Search Mendanize</DialogTitle>
          <DialogDescription>
            Find articles, guides, topics, and AI tools. Shortcut{" "}
            {SEARCH_SHORTCUT_HINT}.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            go(query);
          }}
        >
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search learning content…"
              autoComplete="off"
              aria-label="Search query"
              className="h-11 pl-9 pr-20 text-base"
            />
            <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 gap-0.5">
              {query ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  aria-label="Clear"
                  onClick={() => setQuery("")}
                >
                  <XIcon className="size-4" />
                </Button>
              ) : null}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8"
                disabled
                aria-label="Voice search (coming soon)"
                title="Voice search placeholder"
              >
                <Mic className="size-4" />
              </Button>
            </div>
          </div>
          <Button type="submit" disabled={!query.trim()}>
            Search
          </Button>
        </form>

        {query.trim() && suggestions.length > 0 ? (
          <List
            title="Suggestions"
            items={suggestions.map((s) => s.label)}
            onPick={go}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <List
              title="Recent"
              items={(discovery?.recent ?? []).map((s) => s.label)}
              onPick={go}
            />
            <List
              title="Trending"
              items={(discovery?.trending ?? []).map((s) => s.label)}
              onPick={go}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function List({
  title,
  items,
  onPick,
}: {
  title: string;
  items: string[];
  onPick: (v: string) => void;
}) {
  return (
    <div>
      <p className="type-caption mb-2 text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={`${title}-${item}`}>
              <button
                type="button"
                className="text-left text-sm text-foreground hover:text-primary"
                onClick={() => onPick(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
