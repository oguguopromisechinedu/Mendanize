"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic, SearchIcon, XIcon } from "lucide-react";

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
import { SEARCH_SHORTCUT_HINT } from "../constants/constants";
import type { SearchDiscoveryPayload, SearchSuggestionItem } from "@/services/search/types";

type GlobalSearchProps = {
  triggerClassName?: string;
  discovery: SearchDiscoveryPayload;
};

/**
 * Global search (MES-017) — header embed. Keyboard / voice are UI placeholders.
 */
export function GlobalSearch({ triggerClassName, discovery }: GlobalSearchProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const q = query.trim().toLowerCase();
  const liveSuggestions = discovery.suggestions.filter(
    (s) => !q || s.label.toLowerCase().includes(q) || s.query.toLowerCase().includes(q),
  );

  function go(term: string) {
    const next = term.trim();
    if (!next) return;
    setLoading(true);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(next)}`);
    setLoading(false);
  }

  function pick(item: SearchSuggestionItem) {
    setQuery(item.query);
    go(item.query);
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
            Articles, guides, AI tools, categories, and topics. Shortcut{" "}
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
              ref={inputRef}
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
                aria-label="Voice search (coming soon)"
                disabled
                title="Voice search placeholder"
              >
                <Mic className="size-4" />
              </Button>
            </div>
          </div>
          <Button type="submit" disabled={!query.trim() || loading}>
            {loading ? "Searching…" : "Search"}
          </Button>
        </form>

        {query.trim() && liveSuggestions.length > 0 ? (
          <SuggestionList
            title="Suggestions"
            items={liveSuggestions.slice(0, 6)}
            onPick={pick}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <SuggestionList title="Recent" items={discovery.recent} onPick={pick} />
            <SuggestionList title="Trending" items={discovery.trending} onPick={pick} />
          </div>
        )}

        {discovery.recommended.length > 0 ? (
          <SuggestionList
            title="Recommended"
            items={discovery.recommended}
            onPick={pick}
          />
        ) : null}

        <p className="text-xs text-muted-foreground">
          Or open the{" "}
          <Link href="/search" className="text-primary underline-offset-2 hover:underline">
            full search page
          </Link>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}

function SuggestionList({
  title,
  items,
  onPick,
}: {
  title: string;
  items: SearchSuggestionItem[];
  onPick: (item: SearchSuggestionItem) => void;
}) {
  if (!items.length) {
    return (
      <div>
        <p className="type-caption mb-2 text-muted-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">Nothing yet.</p>
      </div>
    );
  }
  return (
    <div>
      <p className="type-caption mb-2 text-muted-foreground">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={`${title}-${item.query}`}>
            <button
              type="button"
              className="text-left text-sm text-foreground hover:text-primary"
              onClick={() => onPick(item)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
