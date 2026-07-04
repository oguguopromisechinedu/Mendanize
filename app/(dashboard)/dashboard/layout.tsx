<<<<<<< HEAD:app/dashboard/layout.tsx
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default DashboardLayout;
=======
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/access";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-black text-slate-100">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col lg:pl-64">
        <div className="border-b border-white/10 bg-black/80 px-6 py-4 lg:hidden">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Mendanize Dashboard</p>
        </div>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
>>>>>>> 191104ab (Complete Mendanize platform):app/(dashboard)/dashboard/layout.tsx
