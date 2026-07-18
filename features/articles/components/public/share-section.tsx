"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ShareSection({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface/40 p-4">
      <p className="text-sm font-medium text-foreground">Share</p>
      <p className="mt-1 text-xs text-muted-foreground">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={copyLink}>
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => toast.message("Share API placeholder")}
        >
          Share
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            window.print();
          }}
        >
          Print
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => toast.message("Bookmark placeholder — save from My Learning")}
        >
          Bookmark
        </Button>
      </div>
    </section>
  );
}
