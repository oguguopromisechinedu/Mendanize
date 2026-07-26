import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { contentHref, type ContentScope } from "@/lib/content-paths";
import type { TopicRecord } from "@/services/content/types";

export function TopicCard({
  topic,
  categoryName,
  scope = "public",
}: {
  topic: TopicRecord;
  categoryName?: string | null;
  scope?: ContentScope;
}) {
  const meta = [
    categoryName,
    topic.articleCount ? `${topic.articleCount} articles` : null,
    topic.guideCount ? `${topic.guideCount} guides` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={contentHref("topic", topic.slug, { scope })}
      className="block h-full"
    >
      <Card className="motion-fade h-full hover:border-primary/30 hover:bg-hover/40">
        <CardHeader>
          <div className="mb-2 flex flex-wrap gap-2">
            {topic.featured ? (
              <Badge variant="secondary">Featured</Badge>
            ) : null}
            {categoryName ? (
              <Badge variant="outline">{categoryName}</Badge>
            ) : null}
          </div>
          <CardTitle>{topic.name}</CardTitle>
          {topic.description ? (
            <CardDescription>{topic.description}</CardDescription>
          ) : null}
        </CardHeader>
        {meta ? (
          <CardContent>
            <p className="text-xs text-muted-foreground">{meta}</p>
          </CardContent>
        ) : null}
      </Card>
    </Link>
  );
}
