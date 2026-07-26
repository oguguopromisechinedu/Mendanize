"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { MendanizeRobot } from "@/components/brand/MendanizeRobot";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
  href?: string;
  size?: "sm" | "md";
};

export default function Logo({
  className,
  showWordmark = true,
  href = "/",
  size = "md",
}: LogoProps) {
  const mark = size === "sm" ? "h-8 w-8" : "h-9 w-9";

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 font-semibold tracking-tight",
        className,
      )}
      aria-label="Mendanize home"
    >
      <span
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-xl bg-primary/15 ring-1 ring-primary/30",
          mark,
        )}
      >
        <MendanizeRobot variant="mark" className="h-[70%] w-[70%]" />
      </span>
      {showWordmark ? (
        <span className="font-[family-name:var(--font-display)] text-lg lowercase tracking-tight text-foreground">
          mendanize
        </span>
      ) : null}
    </Link>
  );
}
