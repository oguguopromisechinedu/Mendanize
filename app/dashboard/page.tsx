import AnalyticsCards from "@/components/dashboard/AnalyticsCards";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentGenerations from "@/components/dashboard/RecentGenerations";
import { styles } from "@/lib/design";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className={styles.eyebrow}>Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Welcome back
        </h1>
        <p className="mt-2 text-slate-400">
          Track content performance, recent AI generations, and quick tools.
        </p>
      </header>

      <AnalyticsCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentGenerations />
        <QuickActions />
      </div>
    </div>
  );
}
