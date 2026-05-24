import Link from "next/link";
import type { LearnArticle } from "@/lib/learn/content";
import { routes } from "@/lib/design";
import { styles } from "@/lib/design";
import { cn } from "@/lib/utils";

type ArticleCardProps = {
  article: LearnArticle;
};

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`${routes.learn}/${article.slug}`}
      className={cn(
        styles.glass,
        styles.glassHover,
        "group block p-6"
      )}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
        {article.category}
      </p>
      <h2 className="mt-3 text-xl font-semibold text-white group-hover:text-violet-200">
        {article.title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">{article.excerpt}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>{article.readMinutes} min read</span>
        <span>·</span>
        <span>{article.author}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
