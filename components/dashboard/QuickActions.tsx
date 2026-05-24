import Link from "next/link";
import { BookOpen, PenLine, Search, Sparkles } from "lucide-react";
import { routes, styles } from "@/lib/design";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "Generate blog post",
    description: "AI writing with SEO controls",
    href: routes.blogGenerator,
    icon: PenLine,
  },
  {
    label: "SEO optimizer",
    description: "Improve rankings and metadata",
    href: routes.dashboard,
    icon: Search,
  },
  {
    label: "Browse lessons",
    description: "Learn blogging with AI",
    href: routes.learn,
    icon: BookOpen,
  },
  {
    label: "Explore templates",
    description: "Coming soon",
    href: routes.dashboard,
    icon: Sparkles,
  },
];

export default function QuickActions() {
  return (
    <section className={cn(styles.glass, "p-6")}>
      <p className={styles.eyebrow}>Quick actions</p>
      <h2 className="mt-1 text-lg font-semibold text-white">Start creating</h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                styles.glassHover,
                "group flex gap-4 rounded-2xl border border-white/10 bg-black/40 p-4"
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 transition group-hover:bg-violet-500/25">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-white">{action.label}</p>
                <p className="mt-1 text-sm text-slate-500">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
