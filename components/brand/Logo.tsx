import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
  href?: string;
};

export default function Logo({
  className,
  showWordmark = true,
  href = "/",
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 font-semibold tracking-tight",
        className
      )}
      aria-label="Mendanize home"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/25 transition group-hover:shadow-violet-500/40">
        <Sparkles className="h-4 w-4 text-slate-950" aria-hidden />
      </span>
      {showWordmark && (
        <span className="text-lg text-white">
          Mendan<span className="text-violet-300">ize</span>
        </span>
      )}
    </Link>
  );
}
