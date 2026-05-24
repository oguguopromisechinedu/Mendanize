import MarketingLayout from "@/components/layout/MarketingLayout";
import BlogGenerator from "@/components/blog/BlogGenerator";

export default function BlogGeneratorPage() {
  return (
    <MarketingLayout>
      <section className="min-h-screen px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl space-y-5">
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">AI writing studio</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Build high-performing blog posts with AI guidance.
            </h1>
            <p className="text-base leading-7 text-slate-400">
              Configure tone, audience, SEO keywords, and article length. Mendanize delivers polished markdown so you can publish faster.
            </p>
          </div>

          <BlogGenerator />
        </div>
      </section>
    </MarketingLayout>
  );
}
