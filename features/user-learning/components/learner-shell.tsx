"use client";

import { useState, type ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { LearnerNavGroup } from "../constants/constants";
import type { LearnerSpaceLink } from "../services/learner-shell-config";
import { LearnerSidebar } from "./learner-sidebar";
import { LearnerTopBar, type LearnerTopBarUser } from "./learner-topbar";

export function LearnerShell({
  user,
  planName = "Free",
  unreadCount = 0,
  navGroups,
  spaces,
  children,
}: {
  user: LearnerTopBarUser;
  planName?: string;
  unreadCount?: number;
  navGroups: LearnerNavGroup[];
  spaces: LearnerSpaceLink[];
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex">
        <div
          className="relative"
          onDoubleClick={() => setCollapsed((v) => !v)}
          title="Double-click to collapse"
        >
          <LearnerSidebar
            collapsed={collapsed}
            planName={planName}
            navGroups={navGroups}
            spaces={spaces}
          />
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0" showCloseButton>
          <SheetTitle className="sr-only">Learner navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate your Mendanize learning space. Availability is controlled by
            administrators.
          </SheetDescription>
          <LearnerSidebar
            collapsed={false}
            planName={planName}
            navGroups={navGroups}
            spaces={spaces}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-[padding] duration-[var(--motion-base)]",
          collapsed ? "lg:pl-[4.5rem]" : "lg:pl-64",
        )}
      >
        <LearnerTopBar
          user={user}
          unreadCount={unreadCount}
          planName={planName}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <main className="flex-1 bg-[radial-gradient(ellipse_at_top,rgba(232,148,12,0.06),transparent_45%)] px-4 py-6 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
