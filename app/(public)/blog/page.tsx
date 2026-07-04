import Link from "next/link";

const samplePosts = [
  {
    title: "Designing a calm publishing workflow",
    slug: "designing-a-calm-publishing-workflow",
    excerpt: "A look at how editorial teams can move faster without losing clarity.",
  },
  {
    title: "What a modern content platform needs",
    slug: "what-a-modern-content-platform-needs",
    excerpt: "A simple foundation for growth, discovery, and long-term publishing strategy.",
  },
];

export default function BlogArchivePage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.35em] text-violet-300">Blog</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Latest stories</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">This archive is ready to host published articles for readers.</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {samplePosts.map((post) => (
          <article key={post.slug} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">{post.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex text-sm font-semibold text-violet-300 hover:text-violet-200">
              Read article →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
