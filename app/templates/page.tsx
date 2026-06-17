import { styles } from "@/lib/design";

const templates = [
  {
    category: "How-To",
    title: "Build a step-by-step tutorial",
    description: "Guide readers through a workflow with clear action steps.",
  },
  {
    category: "Listicle",
    title: "Top 10 content marketing tips",
    description: "Rank ideas in a shareable, scannable format.",
  },
  {
    category: "Review",
    title: "Review a product or service",
    description: "Showcase pros, cons, and a final recommendation.",
  },
  {
    category: "Case Study",
    title: "Showcase a success story",
    description: "Deliver measurable results with storytelling and metrics.",
  },
  {
    category: "Opinion",
    title: "Publish a bold take",
    description: "Make a clear argument with supporting evidence.",
  },
  {
    category: "Tutorial",
    title: "Teach a new skill quickly",
    description: "Break concepts into approachable, action-oriented lessons.",
  },
];

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className={styles.eyebrow}>Templates</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Choose a blog format and start faster
        </h1>
        <p className="mt-2 text-slate-400">
          Pick a proven structure for your next post, then customize tone, keywords, and pacing.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <article key={template.title} className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 transition hover:border-cyan-400/20 hover:bg-slate-900/95">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{template.category}</p>
            <h2 className="mt-4 text-xl font-semibold text-white">{template.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{template.description}</p>
            <button className="mt-6 inline-flex rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">
              Use template
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
