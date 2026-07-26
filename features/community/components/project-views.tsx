"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type {
  ShowcaseProjectDetail,
  ShowcaseProjectSummary,
} from "@/services/community"
import {
  bookmarkProjectAction,
  commentOnProjectAction,
  createProjectAction,
  likeProjectAction,
} from "../actions/actions"
import { CommunityNav } from "./community-nav"

export function ProjectListView({
  items,
  signedIn,
}: {
  items: ShowcaseProjectSummary[]
  signedIn: boolean
}) {
  return (
    <div>
      <CommunityNav currentPath="/community/projects" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Project showcase</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Optional Learning Guide relationship — not courses.
          </p>
        </div>
        {signedIn ? (
          <Button asChild>
            <Link href="/community/projects/new">Share project</Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/sign-in?callbackUrl=/community/projects/new">
              Sign in to share
            </Link>
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id}>
              <Link
                href={`/community/projects/${p.slug}`}
                className="block rounded-xl border border-border p-4 hover:border-primary/40"
              >
                {p.featured ? (
                  <span className="text-xs text-primary">Featured</span>
                ) : null}
                <p className="font-medium">{p.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {p.descriptionPreview}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {p.likeCount} likes · {p.commentCount} comments
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function NewProjectForm({
  guides,
}: {
  guides: Array<{ id: string; title: string }>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [technologies, setTechnologies] = useState("")
  const [screenshotUrls, setScreenshotUrls] = useState("")
  const [guideId, setGuideId] = useState("")
  const [demoUrl, setDemoUrl] = useState("")
  const [repoUrl, setRepoUrl] = useState("")

  return (
    <div>
      <CommunityNav currentPath="/community/projects" />
      <h1 className="font-display text-2xl font-bold">Share a project</h1>
      <form
        className="mt-6 max-w-2xl space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          start(async () => {
            const res = await createProjectAction({
              title,
              description,
              technologies,
              screenshotUrls,
              guideId: guideId || undefined,
              demoUrl: demoUrl || undefined,
              repoUrl: repoUrl || undefined,
            })
            if (!res.ok) toast.error(res.message)
            else {
              toast.success("Project published")
              router.push(`/community/projects/${res.slug}`)
            }
          })
        }}
      >
        <label className="block text-sm">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3"
            required
          />
        </label>
        <label className="block text-sm">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm">
          Technologies (comma-separated)
          <input
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3"
          />
        </label>
        <label className="block text-sm">
          Screenshot URLs (comma-separated, from Media Library)
          <input
            value={screenshotUrls}
            onChange={(e) => setScreenshotUrls(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3"
            placeholder="https://…"
          />
        </label>
        <label className="block text-sm">
          Related Learning Guide (optional)
          <select
            value={guideId}
            onChange={(e) => setGuideId(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3"
          >
            <option value="">None</option>
            {guides.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Demo link
          <input
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3"
          />
        </label>
        <label className="block text-sm">
          Repository link
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3"
          />
        </label>
        <Button type="submit" disabled={pending} loading={pending}>
          Publish project
        </Button>
      </form>
    </div>
  )
}

export function ProjectDetailView({
  project,
  signedIn,
}: {
  project: ShowcaseProjectDetail
  signedIn: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [comment, setComment] = useState("")

  return (
    <div>
      <CommunityNav currentPath="/community/projects" />
      {project.featured ? (
        <p className="text-sm text-primary">Featured project</p>
      ) : null}
      <h1 className="mt-1 font-display text-3xl font-bold">{project.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {project.author?.name ?? project.team?.name ?? "Learner"} ·{" "}
        {project.likeCount} likes · {project.commentCount} comments
      </p>

      <div className="mt-6 whitespace-pre-wrap">{project.description}</div>

      {project.technologies.length > 0 ? (
        <p className="mt-4 flex flex-wrap gap-2">
          {project.technologies.map((t) => (
            <span
              key={t}
              className="rounded-md border border-border px-2 py-0.5 text-xs"
            >
              {t}
            </span>
          ))}
        </p>
      ) : null}

      {project.guide ? (
        <p className="mt-4 text-sm">
          Learning Guide:{" "}
          <Link
            href={`/guides/${project.guide.slug}`}
            className="text-primary hover:underline"
          >
            {project.guide.title}
          </Link>
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        {project.demoUrl ? (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            Demo
          </a>
        ) : null}
        {project.repoUrl ? (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            Repository
          </a>
        ) : null}
      </div>

      {project.screenshotUrls.length > 0 ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {project.screenshotUrls.map((url) => (
            <li key={url}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="max-h-56 w-full rounded-lg border border-border object-cover"
              />
            </li>
          ))}
        </ul>
      ) : null}

      {signedIn ? (
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await likeProjectAction(project.id)
                if (!res.ok) toast.error(res.message)
                else router.refresh()
              })
            }
          >
            Like
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await bookmarkProjectAction(project.id)
                if (!res.ok) toast.error(res.message)
                else toast.success(res.bookmarked ? "Bookmarked" : "Removed")
              })
            }
          >
            Bookmark
          </Button>
        </div>
      ) : null}

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Comments</h2>
        <ul className="mt-4 space-y-3">
          {project.comments.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              <p className="text-xs text-muted-foreground">
                {c.author.name ?? "Learner"} ·{" "}
                {new Date(c.createdAt).toLocaleString()}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
        {signedIn ? (
          <form
            className="mt-4 space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              start(async () => {
                const res = await commentOnProjectAction({
                  projectId: project.id,
                  body: comment,
                })
                if (!res.ok) toast.error(res.message)
                else {
                  setComment("")
                  toast.success("Comment posted")
                  router.refresh()
                }
              })
            }}
          >
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <Button type="submit" size="sm" disabled={pending} loading={pending}>
              Comment
            </Button>
          </form>
        ) : null}
      </section>
    </div>
  )
}
