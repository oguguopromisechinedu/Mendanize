"use client";

import { useState } from "react";
import { styles } from "@/lib/design";

const breakdown = [
  { label: "Title", score: 88, detail: "Strong heading with target keyword." },
  { label: "Meta", score: 81, detail: "Meta description is clear but slightly long." },
  { label: "Readability", score: 92, detail: "Short paragraphs and accessible language." },
  { label: "Keywords", score: 79, detail: "Keyword density can be improved." },
];

export default function SeoOptimizerPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className={styles.eyebrow}>SEO optimizer</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Improve metadata and ranking signals
        </h1>
        <p className="mt-2 text-slate-400">
          Analyze a URL or keyword phrase and get an instant SEO score breakdown.
        </p>
      </header>

      <section className={`${styles.glass} p-6`}>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <label className="block text-sm font-medium text-slate-300">URL or keyword</label>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter page URL or target keyword"
              className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
            />
          </div>
          <button
            onClick={() => setSubmitted(true)}
            className="h-fit rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            Analyze
          </button>
        </div>
      </section>

      {submitted && (
        <section className={`${styles.glass} p-6`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Mock scoring</p>
              <h2 className="mt-2 text-xl font-semibold text-white">SEO score breakdown</h2>
            </div>
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-300">
              Overall 85
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {breakdown.map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{item.detail}</p>
                  </div>
                  <span className="rounded-full bg-slate-900/90 px-3 py-1 text-sm font-semibold text-amber-300">
                    {item.score}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400" style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
