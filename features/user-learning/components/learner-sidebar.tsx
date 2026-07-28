"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, Crown, ExternalLink, Folder, Settings2 } from "lucide-react";

import Logo from "@/components/brand/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LearnerNavGroup } from "../constants/constants";
import { LEARNER_ICON_MAP } from "../constants/constants";
import type { LearnerSpaceLink } from "../services/learner-shell-config";

export function LearnerSidebar({
  collapsed = false,
  onNavigate,
  planName,
  navGroups,
  spaces,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  planName?: string;
  /** Admin-flag-filtered nav from loadLearnerShellConfig */
  navGroups: LearnerNavGroup[];
  /** Real projects / Admin templates the learner started */
  spaces: LearnerSpaceLink[];
}) {
  const pathname = usePathname();
  const normalizedPlan = (planName ?? "Free").toLowerCase();
  const isFree = normalizedPlan === "free" || normalizedPlan === "starter";

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex items-center px-4 py-5",
          collapsed && "justify-center px-2",
        )}
      >
        <Logo
          href="/account"
          showWordmark={!collapsed}
          size="sm"
          className={collapsed ? "gap-0" : undefined}
        />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => (
          <div key={group.id}>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/account"
                    ? pathname === "/account"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                const Icon = LEARNER_ICON_MAP[item.icon];
                const inner = (
                  <>
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {!collapsed ? (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge ? (
                          <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            {item.badge}
                          </span>
                        ) : null}
                      </>
                    ) : null}
                  </>
                );

                if (item.soon) {
                  return (
                    <li key={item.href}>
                      <span
                        className={cn(
                          "flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground/60",
                          collapsed && "justify-center px-2",
                        )}
                        title="Coming soon"
                      >
                        {inner}
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition duration-[var(--motion-base)]",
                        collapsed && "justify-center px-2",
                        active
                          ? "bg-primary text-primary-foreground shadow-glow"
                          : "text-muted-foreground hover:bg-hover hover:text-foreground",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {inner}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {!collapsed ? (
          <div>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              My Spaces
            </p>
            <ul className="space-y-0.5">
              {spaces.map((space) => (
                <li key={space.href + space.label}>
                  <Link
                    href={space.href}
                    onClick={onNavigate}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-hover hover:text-foreground"
                  >
                    <Folder className="size-4 shrink-0 text-primary/80" aria-hidden />
                    <span className="truncate">{space.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </nav>

      <div className="space-y-3 border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/25 via-card to-card p-4 shadow-md">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Crown className="size-4 text-primary" aria-hidden />
              {isFree ? "Upgrade to Pro" : "You're on Pro"}
            </div>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              {isFree
                ? "Plans and limits are managed by administrators via Billing."
                : "Your plan is managed from Admin billing configuration."}
            </p>
            <Button asChild size="sm" className="w-full rounded-xl">
              <Link href="/account/billing" onClick={onNavigate}>
                {isFree ? "Upgrade Now" : "Manage plan"}
              </Link>
            </Button>
          </div>
        ) : (
          <Button asChild size="icon" variant="outline" className="w-full">
            <Link
              href="/account/billing"
              onClick={onNavigate}
              aria-label="Billing"
            >
              <Crown className="size-4" />
            </Link>
          </Button>
        )}

        <div
          className={cn(
            "flex items-center gap-1",
            collapsed ? "flex-col" : "justify-between px-1",
          )}
        >
          <ThemeToggle />
          <Link
            href="/account/preferences"
            onClick={onNavigate}
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-hover hover:text-foreground"
            aria-label="Settings"
            title="Settings"
          >
            <Settings2 className="size-4" />
          </Link>
          <Link
            href="/contact"
            onClick={onNavigate}
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-hover hover:text-foreground"
            aria-label="Help and support"
            title="Help & Support"
          >
            <CircleHelp className="size-4" />
          </Link>
          <Link
            href="/"
            onClick={onNavigate}
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-hover hover:text-foreground"
            aria-label="Visit public homepage"
            title="Go to public homepage"
          >
            <ExternalLink className="size-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
