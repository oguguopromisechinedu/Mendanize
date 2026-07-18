"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  CategorySummary,
  ToolRecord,
  TopicSummary,
} from "@/services/content";
import {
  TOOL_DIFFICULTIES,
  TOOL_DIFFICULTY_LABELS,
  TOOL_PRICINGS,
  TOOL_PRICING_LABELS,
} from "../../constants/constants";
import { ToolComparisonPlaceholder } from "./tool-comparison-placeholder";

type ViewMode = "grid" | "list";
type SortMode = "recent" | "alpha" | "featured";

const PAGE_SIZE = 12;

export function ToolDirectoryView({
  tools,
  categories,
  topics,
}: {
  tools: ToolRecord[];
  categories: CategorySummary[];
  topics: TopicSummary[];
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [pricing, setPricing] = useState("");
  const [platform, setPlatform] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>("recent");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);

  const platforms = useMemo(() => {
    const set = new Set<string>();
    for (const t of tools) {
      for (const p of t.platforms) set.add(p);
    }
    return [...set].sort();
  }, [tools]);

  const filtered = useMemo(() => {
    let items = [...tools];
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.shortDescription ?? "").toLowerCase().includes(q) ||
          (t.developer ?? "").toLowerCase().includes(q)
      );
    }
    if (categoryId) {
      items = items.filter((t) => t.categoryIds.includes(categoryId));
    }
    if (topicId) {
      items = items.filter((t) => t.topicIds.includes(topicId));
    }
    if (pricing) {
      items = items.filter((t) => t.pricing === pricing);
    }
    if (platform) {
      items = items.filter((t) =>
        t.platforms.some((p) => p.toLowerCase() === platform.toLowerCase())
      );
    }
    if (difficulty) {
      items = items.filter((t) => t.difficulty === difficulty);
    }
    if (featuredOnly) {
      items = items.filter((t) => t.featured);
    }

    items.sort((a, b) => {
      if (sort === "alpha") return a.name.localeCompare(b.name);
      if (sort === "featured") {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.name.localeCompare(b.name);
      }
      const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return db - da;
    });
    return items;
  }, [
    tools,
    query,
    categoryId,
    topicId,
    pricing,
    platform,
    difficulty,
    featuredOnly,
    sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  function resetFilters() {
    setQuery("");
    setCategoryId("");
    setTopicId("");
    setPricing("");
    setPlatform("");
    setDifficulty("");
    setFeaturedOnly(false);
    setSort("recent");
    setPage(1);
  }

  const featured = tools.filter((t) => t.featured).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="max-w-2xl">
        <p className="type-caption text-primary">AI Tools</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground">
          Discover tools worth learning
        </h1>
        <p className="mt-3 text-muted-foreground">
          Educational directory of AI tools — evaluate pricing, fit, and when
          to use them alongside articles and guides.
        </p>
      </header>

      {featured.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Featured
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((tool) => (
              <li key={tool.id}>
                <ToolCard tool={tool} compact />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4 rounded-xl border border-border p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search tools…"
            className="sm:max-w-sm"
            aria-label="Search tools"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={view === "grid" ? "default" : "outline"}
              onClick={() => setView("grid")}
            >
              Grid
            </Button>
            <Button
              type="button"
              size="sm"
              variant={view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
            >
              List
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            label="Category"
            value={categoryId}
            onChange={(v) => {
              setCategoryId(v);
              setPage(1);
            }}
            options={[
              { value: "", label: "All categories" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <FilterSelect
            label="Topic"
            value={topicId}
            onChange={(v) => {
              setTopicId(v);
              setPage(1);
            }}
            options={[
              { value: "", label: "All topics" },
              ...topics.map((t) => ({ value: t.id, label: t.name })),
            ]}
          />
          <FilterSelect
            label="Pricing"
            value={pricing}
            onChange={(v) => {
              setPricing(v);
              setPage(1);
            }}
            options={[
              { value: "", label: "All pricing" },
              ...TOOL_PRICINGS.map((p) => ({
                value: p,
                label: TOOL_PRICING_LABELS[p],
              })),
            ]}
          />
          <FilterSelect
            label="Platform"
            value={platform}
            onChange={(v) => {
              setPlatform(v);
              setPage(1);
            }}
            options={[
              { value: "", label: "All platforms" },
              ...platforms.map((p) => ({ value: p, label: p })),
            ]}
          />
          <FilterSelect
            label="Difficulty"
            value={difficulty}
            onChange={(v) => {
              setDifficulty(v);
              setPage(1);
            }}
            options={[
              { value: "", label: "All difficulties" },
              ...TOOL_DIFFICULTIES.map((d) => ({
                value: d,
                label: TOOL_DIFFICULTY_LABELS[d],
              })),
            ]}
          />
          <FilterSelect
            label="Sort"
            value={sort}
            onChange={(v) => {
              setSort(v as SortMode);
              setPage(1);
            }}
            options={[
              { value: "recent", label: "Recently added" },
              { value: "alpha", label: "Alphabetical" },
              { value: "featured", label: "Featured first" },
            ]}
          />
          <label className="flex items-end gap-2 pb-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => {
                setFeaturedOnly(e.target.checked);
                setPage(1);
              }}
              className="size-4 rounded border-border"
            />
            Featured only
          </label>
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        {filtered.length} tool{filtered.length === 1 ? "" : "s"}
      </p>

      {pageItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No tools match these filters.
        </p>
      ) : view === "grid" ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((tool) => (
            <li key={tool.id}>
              <ToolCard tool={tool} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-4">
          {pageItems.map((tool) => (
            <li key={tool.id}>
              <ToolCard tool={tool} list />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {safePage} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}

      <ToolComparisonPlaceholder />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground"
      >
        {options.map((o) => (
          <option key={o.value || o.label} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToolCard({
  tool,
  compact,
  list,
}: {
  tool: ToolRecord;
  compact?: boolean;
  list?: boolean;
}) {
  return (
    <Link
      href={`/ai-tools/${tool.slug}`}
      className={cn(
        "group block rounded-xl border border-border bg-surface/40 transition-colors hover:border-primary/40",
        list
          ? "flex gap-4 p-4"
          : compact
            ? "p-3"
            : "p-4"
      )}
    >
      <div
        className={cn(
          "shrink-0 overflow-hidden rounded-lg border border-border bg-muted",
          list ? "size-16" : compact ? "mb-3 size-12" : "mb-4 size-14"
        )}
      >
        {tool.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tool.logoUrl}
            alt=""
            className="size-full object-contain p-1"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={cn(
              "font-semibold text-foreground group-hover:text-primary",
              compact ? "text-sm" : "text-base"
            )}
          >
            {tool.name}
          </h3>
          {tool.featured ? (
            <Badge variant="secondary">Featured</Badge>
          ) : null}
        </div>
        {tool.shortDescription ? (
          <p
            className={cn(
              "mt-1 text-muted-foreground",
              compact ? "line-clamp-2 text-xs" : "line-clamp-2 text-sm"
            )}
          >
            {tool.shortDescription}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{TOOL_PRICING_LABELS[tool.pricing]}</span>
          <span>· {TOOL_DIFFICULTY_LABELS[tool.difficulty]}</span>
          {tool.categoryNames[0] ? (
            <span>· {tool.categoryNames[0]}</span>
          ) : null}
          {tool.topicNames[0] ? <span>· {tool.topicNames[0]}</span> : null}
        </div>
      </div>
    </Link>
  );
}
