import Link from "next/link";
import MarketingLayout from "@/components/layout/MarketingLayout";
import { aiTools } from "@/lib/tools/registry";
import { styles } from "@/lib/design";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tools",
  description: "Specialized AI tools for content, marketing, and business.",
};

export default function ToolsPage() {
  return (
    <MarketingLayout>
      <section className={`${styles.section} bg-black text-white`}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>AI Tools</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Specialized tools for every creative workflow
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            From blog posts to YouTube scripts — modular AI tools built for
            speed, quality, and consistency.
          </p>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aiTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className={`${styles.glass} ${styles.glassHover} group p-6`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 transition group-hover:bg-violet-500/25">
                    <Icon className="h-5 w-5 text-violet-300" />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold text-white">
                    {tool.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">{tool.description}</p>
                  <span className="mt-4 inline-block text-sm text-cyan-400">
                    Open tool →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
