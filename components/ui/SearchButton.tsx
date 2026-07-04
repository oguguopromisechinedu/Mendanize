"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchButton() {
  return (
    <Button asChild variant="ghost" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-200 hover:text-white hover:bg-white/5 transition-colors">
      <Link href="/search" aria-label="Search">
        <Search className="h-5 w-5" />
      </Link>
    </Button>
  );
}
