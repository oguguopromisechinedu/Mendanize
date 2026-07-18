import Link from "next/link"

import type { CategoryDetail, TopicDetail } from "@/services/content/types"
import {
  AdminPageHeader,
  AdminPanel,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"

export function CategoryDetailView({ detail }: { detail: CategoryDetail }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title={detail.name}
        description={detail.description ?? "Category overview"}
        actions={
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/categories/${detail.id}/edit`}>Edit</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/dashboard/topics/new?categoryId=${detail.id}`}>
                Add topic
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Topics", value: detail.topicCount },
          { label: "Articles", value: detail.articleCount },
          { label: "Guides", value: detail.guideCount },
          { label: "Tools", value: detail.toolCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-surface/60 p-4"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <AdminPanel title="Status">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge status={detail.status.toLowerCase()} />
          <span className="text-muted-foreground">Slug: {detail.slug}</span>
          {detail.accentColor ? (
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              Accent
              <span
                className="size-3 rounded-full border border-border"
                style={{ backgroundColor: detail.accentColor }}
              />
            </span>
          ) : null}
        </div>
      </AdminPanel>

      <AdminPanel title="Topics in this category">
        {detail.topics.length === 0 ? (
          <p className="text-sm text-muted-foreground">No topics yet.</p>
        ) : (
          <ul className="space-y-2">
            {detail.topics.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-sm"
              >
                <Link
                  href={`/dashboard/topics/${t.id}`}
                  className="font-medium hover:text-primary"
                >
                  {t.name}
                </Link>
                <StatusBadge status={t.status.toLowerCase()} />
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <AdminPanel title="Recent articles" description="Via Content Service">
        {detail.recentArticles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No linked articles yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {detail.recentArticles.map((a) => (
              <li key={a.id} className="flex justify-between text-sm">
                <Link
                  href={`/dashboard/articles/${a.id}`}
                  className="hover:text-primary"
                >
                  {a.title}
                </Link>
                <StatusBadge status={a.status.toLowerCase()} />
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  )
}

export function TopicDetailView({ detail }: { detail: TopicDetail }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title={detail.name}
        description={detail.description ?? "Topic overview"}
        actions={
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/topics/${detail.id}/edit`}>Edit</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/categories/${detail.categoryId}`}>
                Parent category
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard/articles/new">New article</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Articles", value: detail.articleCount },
          { label: "Guides", value: detail.guideCount },
          { label: "AI Tools", value: detail.toolCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-surface/60 p-4"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <AdminPanel title="Hierarchy">
        <p className="text-sm text-muted-foreground">
          Parent:{" "}
          <Link
            href={`/dashboard/categories/${detail.categoryId}`}
            className="font-medium text-foreground hover:text-primary"
          >
            {detail.categoryName ?? detail.categoryId}
          </Link>
        </p>
        <div className="mt-2">
          <StatusBadge status={detail.status.toLowerCase()} />
        </div>
      </AdminPanel>

      <AdminPanel title="Recent articles">
        {detail.recentArticles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No linked articles yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {detail.recentArticles.map((a) => (
              <li key={a.id} className="flex justify-between text-sm">
                <Link
                  href={`/dashboard/articles/${a.id}`}
                  className="hover:text-primary"
                >
                  {a.title}
                </Link>
                <StatusBadge status={a.status.toLowerCase()} />
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  )
}
