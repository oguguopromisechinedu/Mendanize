import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import {
  createPromptAction,
  deletePromptAction,
} from "@/features/growth"
import { listPromptLibrary } from "@/services/growth"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Prompt library",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/prompts")}`)

  const entries = await listPromptLibrary(session.user.id)

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Prompt library
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your saved prompts — private to your PublicUser account.
        </p>
      </div>

      <form action={createPromptAction} className="space-y-3 border-t border-border/60 pt-6">
        <input
          name="title"
          required
          placeholder="Title"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <textarea
          name="body"
          required
          rows={5}
          placeholder="Prompt body"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <Button type="submit" className="rounded-xl">
          Save prompt
        </Button>
      </form>

      <ul className="space-y-4">
        {entries.length === 0 ? (
          <li className="text-sm text-muted-foreground">No prompts yet.</li>
        ) : (
          entries.map((entry) => (
            <li
              key={entry.id}
              className="border-t border-border/40 pt-4 first:border-0 first:pt-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium">{entry.title}</h2>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {entry.body}
                  </p>
                </div>
                <form action={deletePromptAction}>
                  <input type="hidden" name="id" value={entry.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Delete
                  </Button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>

      <p className="text-sm text-muted-foreground">
        Need a starter?{" "}
        <Link href="/ask" className="text-foreground underline-offset-4 hover:underline">
          Ask Mendanize AI
        </Link>
      </p>
    </div>
  )
}
