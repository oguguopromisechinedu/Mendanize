import Link from "next/link";
import { routes } from "@/lib/design";

const adminNav = [
  { label: "Overview", href: routes.admin },
  { label: "Users", href: "/admin/users" },
  { label: "Usage", href: "/admin/usage" },
  { label: "Feature flags", href: "/admin/flags" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <aside className="w-56 border-r border-white/10 p-4">
        <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-violet-400">
          Admin
        </p>
        <nav className="space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
