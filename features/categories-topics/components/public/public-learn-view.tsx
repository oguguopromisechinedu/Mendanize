import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryCard } from "@/components/shared/content-cards";
import type {
  CategoryRecord,
  GuideSummary,
} from "@/services/content/types";
import type { ContinueLearningCard } from "@/services/learning";

export function PublicLearnView({
  categories,
  featuredGuides,
  popularGuides = [],
  recentGuides = [],
  continueLearning = [],
  isSignedIn,
}: {
  categories: CategoryRecord[];
  featuredGuides: GuideSummary[];
  popularGuides?: GuideSummary[];
  recentGuides?: GuideSummary[];
  continueLearning?: ContinueLearningCard[];
  isSignedIn: boolean;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-12 max-w-2xl">
        <p className="type-caption text-primary">Learn</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground sm:text-5xl">
          Your structured entry into modern technology
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start with a category, follow a course, or dive into articles and AI
          tools — everything connects so learning does not stop at a single
          page.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {isSignedIn ? (
            <Button asChild>
              <Link href="/my-learning">Go to My Learning</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/sign-in?callbackUrl=/my-learning">
                Sign in to save progress
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/ai-courses">Browse AI Courses</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/search">Search</Link>
          </Button>
        </div>
      </header>

      {continueLearning.length > 0 ? (
        <section className="mb-14">
          <h2 className="text-xl font-semibold text-foreground">
            Continue learning
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {continueLearning.slice(0, 4).map((card) => (
              <li key={card.id}>
                <Link
                  href={card.href}
                  className="block rounded-xl border border-border bg-card/50 p-4 transition hover:border-primary/40"
                >
                  <p className="font-medium">{card.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {card.percentComplete}% · {card.lastLessonTitle}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-14">
        <h2 className="text-xl font-semibold text-foreground">
          Start by category
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Broad disciplines that organize topics, articles, and tools.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {categories.slice(0, 6).map((category) => (
            <li key={category.id}>
              <CategoryCard
                href={`/categories/${category.slug}`}
                title={category.name}
                description={category.description ?? undefined}
                meta={[
                  category.topicCount
                    ? `${category.topicCount} topics`
                    : null,
                  category.guideCount
                    ? `${category.guideCount} guides`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            </li>
          ))}
        </ul>
        {categories.length > 6 ? (
          <Button asChild variant="link" className="mt-4 px-0">
            <Link href="/categories">View all categories</Link>
          </Button>
        ) : null}
      </section>

      <section className="mb-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Featured courses
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Structured paths with modules, lessons, and skill levels.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/ai-courses?sort=featured">View all</Link>
          </Button>
        </div>
        <GuideCards guides={featuredGuides} emptyHint="articles" />
      </section>

      {popularGuides.length > 0 ? (
        <section className="mb-14">
          <h2 className="text-xl font-semibold text-foreground">
            Popular courses
          </h2>
          <GuideCards guides={popularGuides} />
        </section>
      ) : null}

      {recentGuides.length > 0 ? (
        <section className="mb-14">
          <h2 className="text-xl font-semibold text-foreground">
            Recently added
          </h2>
          <GuideCards guides={recentGuides} />
        </section>
      ) : null}

      <section className="mb-14 rounded-xl border border-border bg-surface/50 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-foreground">
          Filter by skill level
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((level) => (
            <Link
              key={level}
              href={`/ai-courses?difficulty=${level}`}
              className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              {level.charAt(0) + level.slice(1).toLowerCase()}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface/50 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-foreground">More ways to learn</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li>
            <Link href="/articles" className="text-primary hover:opacity-90">
              Articles →
            </Link>
            <p className="text-sm text-muted-foreground">
              Deep reads on concepts and practice.
            </p>
          </li>
          <li>
            <Link href="/ai-tools" className="text-primary hover:opacity-90">
              AI Tools →
            </Link>
            <p className="text-sm text-muted-foreground">
              Curated tools with learning context.
            </p>
          </li>
          <li>
            <Link href="/prompt-library" className="text-primary hover:opacity-90">
              Prompt Library →
            </Link>
            <p className="text-sm text-muted-foreground">
              Copy-ready prompts for real workflows.
            </p>
          </li>
          <li>
            <Link href="/glossary" className="text-primary hover:opacity-90">
              Glossary →
            </Link>
            <p className="text-sm text-muted-foreground">
              Clear definitions for AI terms.
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}

function GuideCards({
  guides,
  emptyHint,
}: {
  guides: GuideSummary[];
  emptyHint?: string;
}) {
  if (guides.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Guides are on the way
        {emptyHint ? (
          <>
            {" "}
            — explore{" "}
            <Link href={`/${emptyHint}`} className="text-primary">
              {emptyHint}
            </Link>{" "}
            in the meantime.
          </>
        ) : (
          "."
        )}
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      {guides.map((guide) => (
        <Card key={guide.id} className="flex h-full flex-col">
          <CardHeader>
            <div className="mb-2 flex flex-wrap gap-2">
              {guide.difficulty ? (
                <Badge variant="outline">{guide.difficulty}</Badge>
              ) : null}
              {guide.estimatedMinutes ? (
                <Badge variant="secondary">{guide.estimatedMinutes} min</Badge>
              ) : null}
              {guide.authorName ? (
                <span className="text-xs text-muted-foreground">
                  {guide.authorName}
                </span>
              ) : null}
            </div>
            <CardTitle>{guide.title}</CardTitle>
            {guide.excerpt ? (
              <CardDescription>{guide.excerpt}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="mt-auto">
            {guide.lessonCount ? (
              <p className="text-sm text-muted-foreground">
                {guide.lessonCount} lessons
              </p>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/ai-courses/${guide.slug}`}>Open course</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
