import type { Metadata } from "next"
import Link from "next/link"

import { AcceptInviteView } from "@/features/admin-modules/components/accept-invite-view"
import { getInvitationByToken } from "@/services/admin/invitations"

export const metadata: Metadata = {
  title: "Accept staff invitation",
  robots: { index: false },
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: PageProps) {
  const raw = await searchParams
  const token = typeof raw.token === "string" ? raw.token : ""

  const invitation = token ? await getInvitationByToken(token) : null

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      {!token || !invitation ? (
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Invitation invalid</h1>
          <p className="text-sm text-muted-foreground">
            This invitation link is missing, expired, or already used.
          </p>
          <Link
            href="/dashboard/login"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Go to staff login
          </Link>
        </div>
      ) : (
        <AcceptInviteView
          token={token}
          email={invitation.email}
          defaultName={invitation.name}
          roleLabel={invitation.role.name}
        />
      )}
    </div>
  )
}
