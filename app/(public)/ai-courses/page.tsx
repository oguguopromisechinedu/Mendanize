import type { Metadata } from "next"
import Link from "next/link"

import { PageShell } from "@/components/layout/PageShell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSession } from "@/features/authentication/server"
import { GUIDE_DIFFICULTY_LABELS } from "@/features/learning-guides/constants/constants"
import { listGuides, listPublicCategories } from "@/services/content"
import { listContinueLearning } from "@/services/learning"

export const metadata: Metadata = {
  title: "AI Courses",
  description:
    "Browse AI courses with modules, lessons, quizzes, and certificates on Mendanize.",
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

export default async function AiCoursesPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const q = (first(raw.q) ?? "").trim()
  const category = first(raw.category)
  const difficulty = first(raw.difficulty) as
    | "BEGINNER"
    | "INTERMEDIATE"
    | "ADVANCED"
    | undefined
  const sort = first(raw.sort) ?? "recent"

  const [allGuides, categories, session] = await Promise.all([
    listGuides({ pageSize: 100 }),
    listPublicCategories(),
    getSession(),
  ])

  let continueCards: Awaited<ReturnType<typeof listContinueLearning>> = []
  if (session?.user?.id) {
    continueCards = await listContinueLearning(session.user.id).catch(() => [])
  }

  let guides = [...allGuides]
  if (category) {
    guides = guides.filter((g) => g.categorySlug === category)
  }
  if (difficulty) {
    guides = guides.filter((g) => g.difficulty === difficulty)
  }
  if (q) {
    const needle = q.toLowerCase()
    guides = guides.filter(
      (g) =>
        g.title.toLowerCase().includes(needle) ||
        (g.excerpt?.toLowerCase().includes(needle) ?? false) ||
        (g.authorName?.toLowerCase().includes(needle) ?? false)
    )
  }

  const featured = guides.filter((g) => g.featured).slice(0, 6)
  const popular = [...guides]
    .sort((a, b) => (b.lessonCount ?? 0) - (a.lessonCount ?? 0))
    .slice(0, 6)
  const recent = [...guides]
    .sort((a, b) =>
      (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")
    )
    .slice(0, 12)

  const catalog =
    sort === "popular"
      ? popular
      : sort === "featured"
        ? featured.length
          ? featured
          : recent
        : recent

  return (
    <PageShell
      title="AI Courses"
      hideHeader
      width="wide"
      crumbs={[{ label: "AI Courses" }]}
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 max-w-2xl">
          <p className="type-caption text-primary">AI Courses</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground sm:text-5xl">
            Learn AI with structured courses
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Modules, lessons, quizzes, and certificates—built on Mendanize
            learning guides.
          </p>
        </header>

        <form className="mb-8 flex flex-col gap-3 sm:flex-row" method="get">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search courses, instructors…"
            className="sm:flex-1"
            aria-label="Search courses"
          />
          <select
            name="category"
            defaultValue={category ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="difficulty"
            defaultValue={difficulty ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Skill level"
          >
            <option value="">All levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <select
            name="sort"
            defaultValue={sort}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Sort"
          >
            <option value="recent">Recently added</option>
            <option value="popular">Popular</option>
            <option value="featured">Featured</option>
          </select>
          <Button type="submit">Filter</Button>
        </form>

        {continueCards.length > 0 ? (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground">
              Continue learning
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {continueCards.slice(0, 4).map((card) => (
                <li key={card.id}>
                  <Link
                    href={card.href}
                    className="block rounded-xl border border-border bg-card/60 p-4 transition hover:border-primary/40"
                  >
                    <p className="font-medium text-foreground">{card.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {card.percentComplete}% complete
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {featured.length > 0 && sort === "recent" ? (
          <section className="mb-12">
            <h2 className="text-xl font-semibold">Featured courses</h2>
            <CourseGrid guides={featured} />
          </section>
        ) : null}

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            {sort === "popular"
              ? "Popular courses"
              : sort === "featured"
                ? "Featured courses"
                : "All courses"}
          </h2>
          {catalog.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No courses match your filters. Try clearing search or category.
            </p>
          ) : (
            <CourseGrid guides={catalog} />
          )}
        </section>
      </div>
    </PageShell>
  )
}

function CourseGrid({
  guides,
}: {
  guides: Awaited<ReturnType<typeof listGuides>>
}) {
  return (
    <ul className="mt-6 grid gap-6 sm:grid-cols-2">
      {guides.map((guide) => (
        <li key={guide.id}>
          <Link
            href={`/ai-courses/${guide.slug}`}
            className="group block overflow-hidden rounded-xl border border-border bg-card/50 transition hover:border-primary/40"
          >
            <div className="relative aspect-[16/9] bg-muted">
              {guide.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={guide.coverImageUrl}
                  alt=""
                  className="absolute inset-0 size-full object-cover transition group-hover:scale-[1.02]"
                />
              ) : null}
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {guide.categoryName ? <span>{guide.categoryName}</span> : null}
                {guide.difficulty ? (
                  <span>{GUIDE_DIFFICULTY_LABELS[guide.difficulty]}</span>
                ) : null}
                {guide.featured ? <Badge variant="secondary">Featured</Badge> : null}
              </div>
              <h3 className="mt-2 text-lg font-semibold group-hover:text-primary">
                {guide.title}
              </h3>
              {guide.excerpt ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {guide.excerpt}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-muted-foreground">
                {guide.authorName ? `Instructor: ${guide.authorName} · ` : null}
                {guide.sectionCount ?? 0} modules · {guide.lessonCount ?? 0}{" "}
                lessons
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
