import { styles } from "@/lib/design";

export default function DashboardContentPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className={styles.eyebrow}>Content management</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Plan your editorial pipeline
        </h1>
        <p className="mt-2 text-slate-400">
          Organize articles, review drafts, and track publishing milestones across your team.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className={`${styles.glass} p-6`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Content calendar
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">Upcoming publish dates</h2>
            </div>
            <button className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">
              Add new item
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-300">
              <thead className="bg-slate-950/95 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-900/80">
                {[
                  { title: "SEO checklist for startup blogs", status: "Draft", due: "Jun 16", owner: "Mia" },
                  { title: "How AI transforms content marketing", status: "Review", due: "Jun 18", owner: "Noah" },
                  { title: "Monetizing your blog in 2026", status: "Scheduled", due: "Jun 24", owner: "Ava" },
                ].map((item) => (
                  <tr key={item.title} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4 font-medium text-white">{item.title}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400">{item.due}</td>
                    <td className="px-4 py-4 text-slate-400">{item.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${styles.glass} p-6`}>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Draft health</p>
          <h2 className="mt-2 text-xl font-semibold text-white">At a glance</h2>
          <div className="mt-6 space-y-4">
            {[
              { label: "Drafts in review", value: "4" },
              { label: "Scheduled posts", value: "7" },
              { label: "Needs editing", value: "2" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-slate-950/80 p-4">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
