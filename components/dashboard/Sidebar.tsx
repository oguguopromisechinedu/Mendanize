"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  FileText,
  LayoutDashboard,
  PenLine,
  Settings,
  Sparkles,
} from "lucide-react";
import { routes } from "@/lib/design";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: routes.dashboard, icon: LayoutDashboard },
  { label: "Blog Generator", href: routes.blogGenerator, icon: PenLine },
  { label: "Content", href: routes.content, icon: FileText },
  { label: "Analytics", href: routes.analytics, icon: BarChart3 },
  { label: "Learn", href: routes.learn, icon: BookOpen },
  { label: "Settings", href: routes.settings, icon: Settings },
];

const alternatePaths: Record<string, string[]> = {
  [routes.content]: [routes.content, "/content"],
  [routes.analytics]: [routes.analytics, "/analytics"],
  [routes.settings]: [routes.settings, "/settings"],
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/10 bg-black/60 p-4 backdrop-blur-xl lg:w-64">
      <Link
        href={routes.home}
        className="mb-8 inline-flex items-center gap-2 px-2 text-sm font-semibold uppercase tracking-[0.2em] text-white"
      >
        <Sparkles className="h-4 w-4 text-violet-300" />
        Mendanize
      </Link>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Dashboard">
        {navItems.map((item) => {
          const Icon = item.icon;
          const itemPaths = alternatePaths[item.href] ?? [item.href];
          const active = itemPaths.some((path) => pathname === path || pathname.startsWith(path));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-violet-500/15 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Plan</p>
        <p className="mt-1 text-sm font-medium text-white">Free tier</p>
        <Link
          href={routes.pricing}
          className="mt-3 inline-block text-xs text-cyan-400 hover:text-cyan-300"
        >
          Upgrade to Pro →
        </Link>
      </div>
    </aside>
  );
}
