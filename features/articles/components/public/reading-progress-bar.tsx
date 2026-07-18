"use client";

import { useEffect, useState } from "react";

import { Progress } from "@/components/ui/progress";

/** Session-only reading progress — no persistence (MES-025). */
export function ReadingProgressBar() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      setValue(height > 0 ? Math.round((scrollTop / height) * 100) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-40">
      <Progress value={value} className="h-1 rounded-none" aria-label="Reading progress" />
    </div>
  );
}
