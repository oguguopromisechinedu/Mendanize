"use client"

import dynamic from "next/dynamic"

const HeroBrainCanvas = dynamic(
  () =>
    import("./hero-brain-canvas").then((m) => m.HeroBrainCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex size-full min-h-[16rem] items-center justify-center"
        aria-hidden
      >
        <div className="size-40 animate-pulse rounded-full bg-primary/20 blur-2xl" />
      </div>
    ),
  },
)

/** Hero visual entry — Three.js brain (MES-005); SVG fallback removed. */
export function HeroBrainVisual({ height }: { height?: number }) {
  return <HeroBrainCanvas height={height} />
}
