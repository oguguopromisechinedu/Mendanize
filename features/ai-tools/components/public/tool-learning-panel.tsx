import type { ToolRecord } from "@/services/content";
import { TOOL_FEATURE_KIND_LABELS } from "../../constants/constants";

/** Educational framing for a tool detail page (MES-027). */
export function ToolLearningPanel({ tool }: { tool: ToolRecord }) {
  const useCases = tool.features.filter((f) => f.kind === "USE_CASE");
  const tips = tool.features
    .filter((f) => f.kind === "FEATURE")
    .slice(0, 3)
    .map((f) => f.label);

  return (
    <section className="rounded-xl border border-border bg-surface/40 p-5">
      <h2 className="font-[family-name:var(--font-display)] text-xl text-foreground">
        Learning panel
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        How to approach this tool as a learner — not just a product listing.
      </p>

      <div className="mt-6 space-y-6">
        {tool.learningOutcomes.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              What you&apos;ll learn
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {tool.learningOutcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            When to use this tool
          </h3>
          <p className="mt-2 text-sm text-foreground">
            {tool.recommendedFor.length > 0
              ? `Best when you need support with: ${tool.recommendedFor.join(", ")}.`
              : `Reach for ${tool.name} when its strengths match your task — check use cases below.`}
          </p>
        </div>

        {useCases.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Best use cases
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {useCases.map((f) => (
                <li key={f.id}>{f.label}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {tool.learningOutcomes.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Learning outcomes
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {tool.learningOutcomes.map((o) => (
                <li key={`outcome-${o}`}>{o}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Beginner tips
          </h3>
          {tips.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Start with the official site, try one small task, then deepen with
              related articles and guides below.
            </p>
          )}
        </div>

        {tool.features.some((f) => f.kind === "ADVANTAGE") ? (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {TOOL_FEATURE_KIND_LABELS.ADVANTAGE}s vs{" "}
              {TOOL_FEATURE_KIND_LABELS.LIMITATION}s
            </h3>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {tool.features
                  .filter((f) => f.kind === "ADVANTAGE")
                  .map((f) => (
                    <li key={f.id}>{f.label}</li>
                  ))}
              </ul>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {tool.features
                  .filter((f) => f.kind === "LIMITATION")
                  .map((f) => (
                    <li key={f.id}>{f.label}</li>
                  ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
