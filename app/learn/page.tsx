import MarketingLayout from "@/components/layout/MarketingLayout";
import ArticleCard from "@/components/learn/ArticleCard";
import { SectionHeader } from "@/components/ui/section-header";
import { learnArticles } from "@/lib/learn/content";
import { styles } from "@/lib/design";

export default function LearnPage() {
  return (
    <MarketingLayout>
      <div className={`${styles.container} ${styles.section}`}>
        <SectionHeader
          eyebrow="Learn"
          title="Master AI blogging, SEO, and monetization"
          description="Step-by-step guides built for creators, beginners, and growth teams."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {learnArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>

        <section className="mt-20 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-8 text-center backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">
            Get lessons in your inbox
          </h2>
          <p className="mt-3 text-slate-400">
            Weekly tips on AI writing, SEO, and blog growth. No spam.
          </p>
          <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/50"
              aria-label="Email for newsletter"
            />
            <button
              type="button"
              className={`shrink-0 px-6 py-3 text-sm font-medium ${styles.primaryBtn}`}
            >
              Subscribe
            </button>
          </form>
        </section>
      </div>
    </MarketingLayout>
  );
}
