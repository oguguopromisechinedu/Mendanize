"use client";

import { useEffect, useRef, useState } from "react";

import type { StatItem } from "../types/types";

type StatisticsApiPayload = {
  available: boolean;
  generatedAt: string;
  values: Record<string, string>;
  items: StatItem[];
};

function mergeStatValues(
  initial: StatItem[],
  values: Record<string, string>,
): StatItem[] {
  return initial.map((item) =>
    values[item.id] ? { ...item, value: values[item.id]! } : item,
  );
}

/** Keeps homepage stat cards in sync with /api/public/homepage/statistics. */
export function useHomepageStatistics(initial: StatItem[]) {
  const initialRef = useRef(initial);
  initialRef.current = initial;
  const [items, setItems] = useState(initial);
  const structureKey = initial.map((item) => `${item.id}:${item.label}`).join("|");

  useEffect(() => {
    setItems(initialRef.current);
  }, [structureKey]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const res = await fetch("/api/public/homepage/statistics", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as {
          data?: StatisticsApiPayload | null;
        };
        const payload = json.data;
        if (!payload || cancelled) return;
        const base = initialRef.current;
        setItems(
          payload.items?.length
            ? payload.items.map((item) => {
                const meta = base.find((b) => b.id === item.id);
                return meta ? { ...meta, value: item.value } : item;
              })
            : mergeStatValues(base, payload.values),
        );
      } catch {
        // Keep SSR values on failure.
      }
    }

    void refresh();
    const id = window.setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [structureKey]);

  return items;
}
