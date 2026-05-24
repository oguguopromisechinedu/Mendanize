"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon, XIcon, Sparkles } from "lucide-react";
import { routes } from "@/lib/design";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: routes.pricing },
  { label: "Resources", href: routes.learn },
  { label: "Login", href: routes.dashboard },
];

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href={routes.home}
          className="inline-flex items-center gap-2 text-lg font-semibold uppercase tracking-[0.2em] text-white hover:text-violet-300 transition-colors"
        >
          <Sparkles className="h-5 w-5 text-violet-300" />
          Mendanize
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors font-medium ${
                isActive(link.href)
                  ? "text-violet-300"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            asChild
            className="hidden text-slate-300 hover:text-white hover:bg-white/5 md:inline-flex transition-colors"
          >
            <Link href={routes.dashboard}>Login</Link>
          </Button>

          <Button asChild className="hidden rounded-full px-6 py-2.5 md:inline-flex font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all">
            <Link href={routes.blogGenerator}>Start Free</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-200 hover:text-white hover:bg-white/5 md:hidden transition-colors"
              >
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs border-l border-white/10 bg-slate-950/95 px-6 py-8 text-slate-100">
              <div className="flex items-center justify-between">
                <Link
                  href={routes.home}
                  className="inline-flex items-center gap-2 text-lg font-semibold uppercase tracking-[0.2em] text-white"
                >
                  <Sparkles className="h-5 w-5 text-violet-300" />
                  Mendanize
                </Link>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    <XIcon className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetClose>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                      isActive(link.href)
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "text-slate-200 hover:bg-white/5 hover:text-white border border-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-8">
                <Button asChild className="rounded-full px-6 py-3 text-sm font-semibold w-full">
                  <Link href={routes.blogGenerator}>Start Free</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="rounded-full border-white/20 px-6 py-3 text-sm text-slate-200 hover:bg-white/10"
                >
                  <Link href={routes.dashboard}>Login</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
