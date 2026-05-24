import { Eye, FileText, Search, TrendingUp } from "lucide-react";
import { styles } from "@/lib/design";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Articles generated",
    value: "24",
    change: "+12% this week",
    icon: FileText,
  },
  {
    label: "Avg. SEO score",
    value: "87",
    change: "+5 pts",
    icon: Search,
  },
  {
    label: "Est. monthly views",
    value: "18.4K",
    change: "+28%",
    icon: Eye,
  },
  {
    label: "Traffic growth",
    value: "34%",
    change: "vs last month",
    icon: TrendingUp,
  },
];

export default function AnalyticsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <article
            key={stat.label}
            className={cn(styles.glass, styles.glassHover, "p-5")}
          >
            <div className="flex items-start justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {stat.label}
              </p>
              <span className="rounded-xl bg-violet-500/10 p-2 text-violet-300">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">{stat.value}</p>
            <p className="mt-1 text-sm text-cyan-400/90">{stat.change}</p>
          </article>
        );
      })}
    </div>
  );
}
