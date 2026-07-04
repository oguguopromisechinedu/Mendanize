import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, " "),
    description: "A public article view for the Mendanize publishing platform.",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  return (
    <section className="mx-auto max-w-4xl px-6 py-24 sm:px-10">
      <p className="text-sm uppercase tracking-[0.35em] text-violet-300">Article</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{slug.replace(/-/g, " ")}</h1>
      <p className="mt-6 text-lg leading-8 text-slate-300">
        This route is ready for the full article experience, including SEO metadata, rich content, and public readers.
      </p>
    </section>
  );
}
