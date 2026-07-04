import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/lib/design";

export const metadata: Metadata = {
  title: {
    default: "Mendanize Publishing",
    template: "%s | Mendanize",
  },
  description: "A modern publishing platform for readers, authors, and editorial teams.",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href={routes.home} className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
            Mendanize
          </Link>
          <nav className="flex items-center gap-5 text-sm text-slate-300">
            <Link href={routes.blog} className="hover:text-white">Blog</Link>
            <Link href="/categories" className="hover:text-white">Categories</Link>
            <Link href="/search" className="hover:text-white">Search</Link>
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href={routes.dashboard} className="rounded-full border border-violet-500/40 px-3 py-1.5 text-violet-300 hover:bg-violet-500/10">
              Admin
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
