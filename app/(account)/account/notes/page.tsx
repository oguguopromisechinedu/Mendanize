import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import { createNoteAction, deleteNoteAction } from "@/features/growth"
import { listLearnerNotes } from "@/services/growth"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Notes",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/notes")}`)

  const notes = await listLearnerNotes(session.user.id)

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Notes
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Capture learning notes. Optionally attach them to a guide later.
        </p>
      </div>

      <form action={createNoteAction} className="space-y-3 border-t border-border/60 pt-6">
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
          placeholder="Note"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <Button type="submit" className="rounded-xl">
          Save note
        </Button>
      </form>

      <ul className="space-y-4">
        {notes.length === 0 ? (
          <li className="text-sm text-muted-foreground">No notes yet.</li>
        ) : (
          notes.map((note) => (
            <li key={note.id} className="border-t border-border/40 pt-4 first:border-0 first:pt-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium">{note.title}</h2>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {note.body}
                  </p>
                </div>
                <form action={deleteNoteAction}>
                  <input type="hidden" name="id" value={note.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Delete
                  </Button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
