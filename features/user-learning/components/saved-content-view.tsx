"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { SavedContentItem } from "@/services/learning";
import { unsaveContentAction } from "../actions/actions";
import { SAVED_TYPE_FILTERS } from "../constants/constants";
import { LearningNav } from "./learning-nav";

export function SavedContentView({ items }: { items: SavedContentItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "title">("newest");

  const filtered = useMemo(() => {
    let list = items;
    if (type !== "all") {
      list = list.filter((i) => i.entityType === type);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(q));
    }
    if (sort === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "oldest") {
      list = [...list].sort(
        (a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime(),
      );
    } else {
      list = [...list].sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
      );
    }
    return list;
  }, [items, query, type, sort]);

  function remove(savedId: string) {
    startTransition(async () => {
      const res = await unsaveContentAction({ savedId });
      if (!res.ok) toast.error(res.message);
      else {
        toast.success(res.message);
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="Saved content"
        description="Articles, guides, and AI tools you bookmarked."
      />
      <LearningNav />

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search saved…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-36"
        >
          {SAVED_TYPE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="w-36"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title</option>
        </Select>
      </div>

      <AdminPanel title={`${filtered.length} saved`}>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No saved items match.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <Link
                    href={item.href}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {item.entityType} · saved{" "}
                    {new Date(item.savedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={item.href}>Open</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => remove(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  );
}
