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

export function PublicLearnView({
  categories,
  featuredGuides,
  isSignedIn,
}: {
  categories: CategoryRecord[];
  featuredGuides: GuideSummary[];
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
          Start with a category, follow a guide, or dive into articles and AI
          tools — everything connects so learning does not stop at a single
          page.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {isSignedIn ? (
            <Button asChild>
              <Link href="/learning">Go to My Learning</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/sign-in?callbackUrl=/learning">Sign in to save progress</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/guides">Browse guides</Link>
          </Button>
        </div>
      </header>

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
        <h2 className="text-xl font-semibold text-foreground">
          Featured learning guides
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Structured paths with lessons you can follow at your own pace.
        </p>
        {featuredGuides.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Guides are on the way — explore{" "}
            <Link href="/articles" className="text-primary">
              articles
            </Link>{" "}
            in the meantime.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {featuredGuides.map((guide) => (
              <Card key={guide.id} className="flex h-full flex-col">
                <CardHeader>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {guide.difficulty ? (
                      <Badge variant="outline">{guide.difficulty}</Badge>
                    ) : null}
                    {guide.estimatedMinutes ? (
                      <Badge variant="secondary">
                        {guide.estimatedMinutes} min
                      </Badge>
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
                    <Link href={`/guides/${guide.slug}`}>Open guide</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
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
            <Link href="/topics" className="text-primary hover:opacity-90">
              Topics →
            </Link>
            <p className="text-sm text-muted-foreground">
              Focused subjects within each category.
            </p>
          </li>
          <li>
            <Link href="/search" className="text-primary hover:opacity-90">
              Search →
            </Link>
            <p className="text-sm text-muted-foreground">
              Find anything across the library.
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}
