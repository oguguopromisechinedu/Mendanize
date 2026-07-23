import type { Metadata } from "next"
import Link from "next/link"

import { requireEditor } from "@/features/authentication/server"
import { listAIKnowledgeQueue } from "@/services/ai/knowledge-pipeline"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "AI Knowledge Center",
  robots: { index: false },
}

export default async function AIKnowledgePage() {
  const session = await requireEditor()
  if (!session) return null

  const jobs = await listAIKnowledgeQueue(80)

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="type-eyebrow text-primary">MES-031</p>
        <h1 className="type-h2 text-foreground">AI Knowledge Center</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Drafts created from Ask Mendanize knowledge gaps. Never auto-published —
          review in the Article Editor, then approve.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Question / Draft</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No AI generation jobs yet. Gaps from Ask Mendanize will appear
                  here.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-b border-border/70">
                  <td className="px-4 py-3">
                    <Badge variant="outline">{job.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground line-clamp-2">
                      {job.article?.title ?? job.question}
                    </p>
                    {job.duplicates.length > 0 ? (
                      <p className="mt-1 text-xs text-amber-600">
                        Merge suggestion:{" "}
                        {job.duplicates
                          .map((d) => d.existingArticle.title)
                          .join(", ")}
                      </p>
                    ) : null}
                    {job.errorMessage ? (
                      <p className="mt-1 text-xs text-destructive">
                        {job.errorMessage}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {job.article ? (
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/dashboard/articles/${job.article.id}`}
                        >
                          Open in editor
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
