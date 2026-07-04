import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default function DashboardOverviewPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-violet-300">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Editorial overview</h1>
        <p className="mt-2 text-slate-400">The private workspace for managing publishing operations.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Published articles", value: "0" },
          { label: "Drafts", value: "0" },
          { label: "Categories", value: "0" },
          { label: "Subscribers", value: "0" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
