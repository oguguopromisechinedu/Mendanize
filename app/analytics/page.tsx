import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { styles } from "@/lib/design";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className={styles.eyebrow}>Analytics</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Track audience growth and content performance
          </h1>
          <p className="mt-2 text-slate-400">
            Review traffic trends, engagement signals, and SEO outcomes across your published work.
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className={`${styles.glass} p-6`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Traffic trends</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Weekly performance</h2>
              </div>
              <button className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                Refresh
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="h-72 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4 shadow-inner shadow-black/20">
                <div className="h-full rounded-3xl border border-white/10 bg-slate-950/80" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Visitors", value: "12.4K" },
                  { label: "Engagement", value: "68%" },
                  { label: "Avg. session", value: "4m 12s" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${styles.glass} p-6`}>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">SEO score</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Article breakdown</h2>

            <div className="mt-6 space-y-4">
              {[
                { label: "Keyword relevance", value: "92%" },
                { label: "Organic impressions", value: "7.8K" },
                { label: "CTR", value: "5.1%" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-slate-950/80 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                      {item.value}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
