"use client";

import Link from "next/link";
import { Bell, Menu, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type LearnerTopBarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function LearnerTopBar({
  user,
  unreadCount = 0,
  planName = "Free",
  onOpenMobileNav,
}: {
  user: LearnerTopBarUser;
  unreadCount?: number;
  planName?: string;
  onOpenMobileNav?: () => void;
}) {
  const displayName =
    user.name?.trim() || user.email?.split("@")[0] || "Learner";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const isFree =
    planName.toLowerCase() === "free" || planName.toLowerCase() === "starter";

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-xl lg:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      <form
        action="/account/search"
        method="get"
        className="relative mx-auto hidden w-full max-w-xl flex-1 md:block"
      >
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          name="q"
          placeholder="Search for courses, tools, topics…"
          className="h-10 rounded-full border-border bg-surface/80 pl-10 pr-16"
          aria-label="Search"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </form>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Button
          asChild
          size="sm"
          className={cn(
            "hidden rounded-full sm:inline-flex",
            isFree &&
              "bg-gradient-to-r from-primary to-amber-500 text-primary-foreground shadow-glow hover:opacity-95",
          )}
          variant={isFree ? "default" : "outline"}
        >
          <Link href="/account/billing">
            <Sparkles className="size-3.5" aria-hidden />
            {isFree ? "Go Premium" : planName}
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
        >
          <Link href="/account/notifications">
            <Bell className="size-4" />
            {unreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </Link>
        </Button>

        <Link
          href="/account/preferences"
          className="flex items-center gap-2.5 rounded-full border border-border bg-card/70 py-1 pl-1 pr-3 transition hover:border-primary/35 hover:bg-hover"
        >
          <span className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-primary/20 text-xs font-semibold text-primary">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt=""
                className="size-8 rounded-full object-cover"
              />
            ) : (
              initials || "M"
            )}
          </span>
          <span className="hidden min-w-0 text-left sm:block">
            <span className="block truncate text-sm font-semibold leading-tight text-foreground">
              {displayName}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Learner
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}
