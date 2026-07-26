import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RobotVariant =
  | "mark"
  | "hero"
  | "avatar"
  | "celebrate"
  | "tip"
  | "empty"
  | "loading";

type MendanizeRobotProps = {
  variant?: RobotVariant;
  className?: string;
  /** Optional caption for accessible empty/loading states */
  label?: string;
};

/**
 * Original Mendanize AI mascot — SVG only (no third-party art).
 * Expressions support welcome, tutoring, celebration, tips, and empty states.
 * Never receives or renders API keys; AI features call server routes only.
 */
export function MendanizeRobot({
  variant = "hero",
  className,
  label,
}: MendanizeRobotProps) {
  const mood = moodFor(variant);
  const title = label ?? mood.label;

  return (
    <svg
      viewBox="0 0 120 140"
      role="img"
      aria-label={title}
      className={cn("shrink-0 text-primary", className)}
    >
      <title>{title}</title>
      {/* Soft brand glow */}
      <ellipse
        cx="60"
        cy="118"
        rx="36"
        ry="8"
        className="fill-primary/20"
      />
      {/* Antenna */}
      <line
        x1="60"
        y1="18"
        x2="60"
        y2="28"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="60" cy="14" r="5" className="fill-primary" />
      {/* Head */}
      <rect
        x="28"
        y="28"
        width="64"
        height="52"
        rx="18"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      {/* Visor */}
      <rect
        x="36"
        y="40"
        width="48"
        height="28"
        rx="10"
        className="fill-background"
      />
      {/* Eyes */}
      {variant !== "loading" ? (
        <g className="fill-primary">
          {mood.eyes === "happy" ? (
            <>
              <path d="M44 54c3-4 9-4 12 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M64 54c3-4 9-4 12 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : mood.eyes === "wink" ? (
            <>
              <circle cx="50" cy="54" r="4" />
              <path d="M66 54c3-3 8-3 11 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : mood.eyes === "focus" ? (
            <>
              <rect x="46" y="50" width="8" height="8" rx="2" />
              <rect x="66" y="50" width="8" height="8" rx="2" />
            </>
          ) : (
            <>
              <circle cx="50" cy="54" r="4.5" />
              <circle cx="70" cy="54" r="4.5" />
            </>
          )}
        </g>
      ) : null}
      {/* Cheeks */}
      {mood.cheeks ? (
        <>
          <circle cx="40" cy="66" r="3" className="fill-primary/35" />
          <circle cx="80" cy="66" r="3" className="fill-primary/35" />
        </>
      ) : null}
      {/* Body */}
      <rect
        x="34"
        y="84"
        width="52"
        height="34"
        rx="14"
        className="fill-surface stroke-border"
        strokeWidth="2"
      />
      {/* Chest badge */}
      <circle cx="60" cy="100" r="8" className="fill-primary/20 stroke-primary" strokeWidth="2" />
      <path
        d="M56 100h8M60 96v8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-primary"
      />
      {/* Arms */}
      <rect x="18" y="88" width="14" height="10" rx="5" className="fill-card stroke-border" strokeWidth="1.5" />
      <rect x="88" y="88" width="14" height="10" rx="5" className="fill-card stroke-border" strokeWidth="1.5" />
      {variant === "celebrate" ? (
        <g className="fill-primary">
          <circle cx="22" cy="72" r="2" />
          <circle cx="98" cy="70" r="2.5" />
          <circle cx="30" cy="64" r="1.5" />
          <circle cx="90" cy="62" r="1.5" />
        </g>
      ) : null}
      {variant === "loading" ? (
        <g className="fill-primary">
          <circle cx="50" cy="54" r="2">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="60" cy="54" r="2">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="70" cy="54" r="2">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.4s" repeatCount="indefinite" />
          </circle>
        </g>
      ) : null}
    </svg>
  );
}

function moodFor(variant: RobotVariant) {
  switch (variant) {
    case "celebrate":
      return { eyes: "happy" as const, cheeks: true, label: "Mendanize AI celebrating" };
    case "tip":
      return { eyes: "wink" as const, cheeks: true, label: "Mendanize AI tip" };
    case "empty":
      return { eyes: "soft" as const, cheeks: false, label: "Mendanize AI waiting" };
    case "loading":
      return { eyes: "focus" as const, cheeks: false, label: "Mendanize AI thinking" };
    case "avatar":
    case "mark":
      return { eyes: "soft" as const, cheeks: false, label: "Mendanize AI" };
    case "hero":
    default:
      return { eyes: "happy" as const, cheeks: true, label: "Mendanize AI guide" };
  }
}

export function RobotSpeechBubble({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-card/90 px-4 py-3 text-sm text-foreground shadow-md backdrop-blur-sm",
        className,
      )}
    >
      {children}
      <span
        aria-hidden
        className="absolute -bottom-2 left-6 size-3 rotate-45 border-b border-r border-border bg-card"
      />
    </div>
  );
}
