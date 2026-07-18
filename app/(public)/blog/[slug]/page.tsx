import { redirect } from "next/navigation"

type PageProps = { params: Promise<{ slug: string }> }

/** Legacy blog post — articles live at /articles/[slug] (MES-025). */
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  redirect(`/articles/${slug}`)
}
