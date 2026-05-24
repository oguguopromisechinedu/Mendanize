import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

const stats = [
  { label: "Total users", value: "—", hint: "Connect database" },
  { label: "Generations (30d)", value: "—", hint: "Connect database" },
  { label: "Active subscriptions", value: "—", hint: "Stripe ready" },
  { label: "API errors (24h)", value: "0", hint: "Monitoring ready" },
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Admin overview</h1>
        <p className="mt-2 text-slate-400">
          Platform analytics, moderation, and feature management.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-500">{stat.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
