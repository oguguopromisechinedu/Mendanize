"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight text-white">
          Mendanize
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#" className="text-sm text-gray-300 transition hover:text-white">
            Features
          </Link>

          <Link href="#" className="text-sm text-gray-300 transition hover:text-white">
            Learn
          </Link>

          <Link href="#" className="text-sm text-gray-300 transition hover:text-white">
            Tools
          </Link>

          <Link href="#" className="text-sm text-gray-300 transition hover:text-white">
            Pricing
          </Link>
        </nav>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="hidden text-gray-300 hover:text-white md:flex"
          >
            Login
          </Button>

          <Button className="rounded-full px-6">
            Start Free
          </Button>
        </div>
      </div>
    </header>
  );
}