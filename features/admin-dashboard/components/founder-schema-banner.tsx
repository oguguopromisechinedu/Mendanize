"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function FounderSchemaBanner({
  message,
}: {
  message: string;
}) {
  return (
    <div
      role="status"
      className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
    >
      <p className="font-medium">Founder dashboard data is partially unavailable</p>
      <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">{message}</p>
      <p className="mt-2 text-xs text-amber-900/80 dark:text-amber-100/80">
        Metrics below show safe defaults (zeros) until the database schema is up to date.
      </p>
      <Button asChild size="sm" variant="outline" className="mt-3 rounded-lg">
        <Link href="/dashboard/system-logs">View system logs</Link>
      </Button>
    </div>
  );
}
