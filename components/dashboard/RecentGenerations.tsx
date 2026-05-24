import Link from "next/link";
import { routes, styles } from "@/lib/design";
import { cn } from "@/lib/utils";

const recent = [
  {
    title: "How AI transforms content marketing",
    status: "Published",
    date: "2 hours ago",
    seo: 92,
  },
  {
    title: "SEO checklist for startup blogs",
    status: "Draft",
    date: "Yesterday",
    seo: 88,
  },
  {
    title: "Monetizing your blog in 2026",
    status: "Draft",
    date: "3 days ago",
    seo: 85,
  },
];

export default function RecentGenerations() {
  return (
    <section className={cn(styles.glass, "p-6")}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={styles.eyebrow}>Activity</p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Recent generations
          </h2>
        </div>
        <Link
          href={routes.blogGenerator}
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          New post →
        </Link>
      </div>

      <ul className="mt-6 divide-y divide-white/10">
        {recent.map((item) => (
          <li key={item.title} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0">
            <div>
              <p className="font-medium text-white">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                SEO {item.seo}
              </span>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs",
                  item.status === "Published"
                    ? "bg-cyan-500/10 text-cyan-300"
                    : "bg-violet-500/10 text-violet-300"
                )}
              >
                {item.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
