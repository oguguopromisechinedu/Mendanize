"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Input } from "@/components/ui/input";
import type { HistoryItem } from "@/services/learning";
import { LearningNav } from "./learning-nav";

export function HistoryView({ items }: { items: HistoryItem[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="Learning history"
        description="Recently viewed content. Search history and Ask Mendanize history are placeholders."
      />
      <LearningNav />

      <Input
        placeholder="Filter history…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-xs"
      />

      <AdminPanel title="Recently viewed">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No history yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((item) => (
              <li key={item.id} className="flex justify-between gap-2 py-3 text-sm">
                <Link href={item.href} className="text-primary hover:underline">
                  {item.title}
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.entityType} ·{" "}
                  {new Date(item.viewedAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <AdminPanel title="Search history">
        <p className="text-sm text-muted-foreground">
          Placeholder — search history surfaces when Discovery analytics mature.
        </p>
      </AdminPanel>

      <AdminPanel title="Ask Mendanize history">
        <p className="text-sm text-muted-foreground">
          Use{" "}
          <Link href="/ask" className="text-primary underline">
            Ask Mendanize
          </Link>{" "}
          for Tier 2 conversation history.
        </p>
      </AdminPanel>
    </div>
  );
}
