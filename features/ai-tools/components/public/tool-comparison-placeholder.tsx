/** Comparison UI placeholder — no comparison logic yet (MES-027). */
export function ToolComparisonPlaceholder() {
  return (
    <section className="rounded-xl border border-dashed border-border p-5">
      <h2 className="font-[family-name:var(--font-display)] text-xl text-foreground">
        Compare tools
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Comparison engine arrives later — use this placeholder to explore what
        you&apos;ll be able to contrast.
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {["Features", "Pricing", "Difficulty", "Use cases"].map((dim) => (
          <li
            key={dim}
            className="rounded-lg border border-border bg-muted/30 px-3 py-4 text-center text-sm font-medium text-muted-foreground"
          >
            Compare {dim}
          </li>
        ))}
      </ul>
    </section>
  );
}
