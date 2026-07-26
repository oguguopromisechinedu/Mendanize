"use client";

import Link from "next/link";
import { useState } from "react";

import {
  contentLessonHref,
  type ContentScope,
} from "@/lib/content-paths";
import { cn } from "@/lib/utils";
import type { GuideRecord } from "@/services/content";

export function GuideLessonNav({
  guide,
  currentLessonSlug,
  scope = "public",
}: {
  guide: GuideRecord;
  currentLessonSlug: string;
  scope?: ContentScope;
}) {
  const currentSectionId = guide.sections.find((s) =>
    s.lessons.some((l) => l.slug === currentLessonSlug),
  )?.id;

  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const s of guide.sections) {
      initial[s.id] = s.id === currentSectionId;
    }
    return initial;
  });

  return (
    <nav aria-label="Guide lessons" className="space-y-2 text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Contents
      </p>
      {guide.sections.map((section, si) => {
        const isOpen = open[section.id] ?? false;
        return (
          <div key={section.id} className="rounded-lg border border-border">
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2 text-left font-medium text-foreground hover:bg-muted/40"
              aria-expanded={isOpen}
              onClick={() =>
                setOpen((prev) => ({
                  ...prev,
                  [section.id]: !prev[section.id],
                }))
              }
            >
              <span>
                {si + 1}. {section.title}
              </span>
              <span className="text-muted-foreground" aria-hidden>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen ? (
              <ul className="border-t border-border px-2 py-2">
                {section.lessons.map((lesson, li) => {
                  const active = lesson.slug === currentLessonSlug;
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={contentLessonHref(guide.slug, lesson.slug, {
                          scope,
                        })}
                        className={cn(
                          "block rounded-md px-2 py-1.5",
                          active
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        {si + 1}.{li + 1} {lesson.title}
                        <span className="mt-0.5 block text-xs opacity-70">
                          Completion placeholder
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
