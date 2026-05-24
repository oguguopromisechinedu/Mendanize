import MarketingLayout from "@/components/layout/MarketingLayout";

export default function BlogPage() {
  return (
    <MarketingLayout>
      <section className="min-h-screen px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Blog</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Grow your blog with AI-powered writing and SEO guidance.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
              Explore how Mendanize helps creators, beginners, and businesses build smarter blogs, generate traffic, and monetize content with a premium AI workflow.
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
