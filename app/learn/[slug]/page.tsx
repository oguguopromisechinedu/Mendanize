import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingLayout from "@/components/layout/MarketingLayout";
import ReadingProgress from "@/components/learn/ReadingProgress";
import { getArticleBySlug, learnArticles } from "@/lib/learn/content";
import { routes, styles } from "@/lib/design";

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return learnArticles.map((article) => ({ slug: article.slug }));
}

export default async function LearnArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <MarketingLayout>
      <ReadingProgress />
      <article className={`${styles.container} ${styles.section} max-w-3xl`}>
        <Link
          href={routes.learn}
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Back to Learn
        </Link>

        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-violet-300">
          {article.category}
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {article.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span>{article.author}</span>
          <span>·</span>
          <span>{article.readMinutes} min read</span>
          <span>·</span>
          <time dateTime={article.publishedAt}>{article.publishedAt}</time>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="prose prose-invert mt-12 max-w-none prose-p:text-slate-300 prose-headings:text-white">
          <p className="lead text-lg text-slate-300">{article.excerpt}</p>
          <p>
            This lesson is part of the Mendanize learning platform. Full article
            content will expand as you connect a CMS or markdown source. Use the
            blog generator to apply these concepts immediately.
          </p>
          <h2>What you will learn</h2>
          <ul>
            <li>Practical workflows for AI-assisted blogging</li>
            <li>SEO fundamentals tailored to your audience</li>
            <li>Growth and monetization strategies that scale</li>
          </ul>
          <h2>Next steps</h2>
          <p>
            Open the AI Blog Generator and create your first optimized article
            using the techniques from this guide.
          </p>
        </div>
      </article>
    </MarketingLayout>
  );
}
