"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CONTENT_TYPE_OPTIONS, DIFFICULTY_OPTIONS } from "../constants/constants";

export type SearchFiltersState = {
  q: string;
  types: string[];
  category: string;
  topic: string;
  difficulty: string;
  featured: boolean;
  recentlyUpdated: boolean;
  from: string;
  to: string;
};

export function SearchFilters({
  state,
  categories,
  topics,
}: {
  state: SearchFiltersState;
  categories: Array<{ slug: string; name: string }>;
  topics: Array<{ slug: string; name: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function apply(next: Partial<SearchFiltersState>) {
    const merged = { ...state, ...next };
    const params = new URLSearchParams();
    if (merged.q.trim()) params.set("q", merged.q.trim());
    if (merged.types.length) params.set("types", merged.types.join(","));
    if (merged.category) params.set("category", merged.category);
    if (merged.topic) params.set("topic", merged.topic);
    if (merged.difficulty) params.set("difficulty", merged.difficulty);
    if (merged.featured) params.set("featured", "1");
    if (merged.recentlyUpdated) params.set("recentlyUpdated", "1");
    if (merged.from) params.set("from", merged.from);
    if (merged.to) params.set("to", merged.to);
    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  }

  function toggleType(value: string) {
    const types = state.types.includes(value)
      ? state.types.filter((t) => t !== value)
      : [...state.types, value];
    apply({ types });
  }

  function clear() {
    const q = searchParams.get("q") ?? state.q;
    startTransition(() => {
      router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    });
  }

  return (
    <aside className="space-y-5 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        <Button type="button" size="sm" variant="ghost" onClick={clear} disabled={pending}>
          Clear
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Content type</Label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPE_OPTIONS.map((opt) => {
            const active = state.types.includes(opt.value);
            return (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant={active ? "secondary" : "outline"}
                onClick={() => toggleType(opt.value)}
                disabled={pending}
              >
                {opt.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-category">Category</Label>
        <Select
          id="filter-category"
          value={state.category}
          onChange={(e) => apply({ category: e.target.value })}
          disabled={pending}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-topic">Topic</Label>
        <Select
          id="filter-topic"
          value={state.topic}
          onChange={(e) => apply({ topic: e.target.value })}
          disabled={pending}
        >
          <option value="">All topics</option>
          {topics.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-difficulty">Difficulty</Label>
        <Select
          id="filter-difficulty"
          value={state.difficulty}
          onChange={(e) => apply({ difficulty: e.target.value })}
          disabled={pending}
        >
          <option value="">Any</option>
          {DIFFICULTY_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="filter-from">Published after</Label>
          <Input
            id="filter-from"
            type="date"
            value={state.from}
            onChange={(e) => apply({ from: e.target.value })}
            disabled={pending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-to">Published before</Label>
          <Input
            id="filter-to"
            type="date"
            value={state.to}
            onChange={(e) => apply({ to: e.target.value })}
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="filter-featured">Featured only</Label>
        <Switch
          id="filter-featured"
          checked={state.featured}
          onCheckedChange={(v) => apply({ featured: Boolean(v) })}
          disabled={pending}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="filter-recent">Recently updated</Label>
        <Switch
          id="filter-recent"
          checked={state.recentlyUpdated}
          onCheckedChange={(v) => apply({ recentlyUpdated: Boolean(v) })}
          disabled={pending}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Need curated paths? Try{" "}
        <Link href="/ask" className="text-primary hover:underline">
          Ask Mendanize
        </Link>
        .
      </p>
    </aside>
  );
}
