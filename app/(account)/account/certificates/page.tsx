import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import { listCertificatesForUser } from "@/services/growth"

export const metadata: Metadata = {
  title: "Certificates",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/certificates")}`)

  const certificates = await listCertificatesForUser(session.user.id)

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Certificates
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Verifiable credentials earned when you complete a guide and pass its
          assessment.
        </p>
      </div>

      <ul className="space-y-4">
        {certificates.length === 0 ? (
          <li className="text-sm text-muted-foreground">
            No certificates yet. Finish a learning guide assessment to earn one.
          </li>
        ) : (
          certificates.map((cert) => (
            <li
              key={cert.id}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4 first:border-0 first:pt-0"
            >
              <div>
                <h2 className="font-medium">{cert.title}</h2>
                <p className="text-xs text-muted-foreground">
                  Issued {new Date(cert.issuedAt).toLocaleDateString()} ·{" "}
                  {cert.credentialCode}
                </p>
              </div>
              <Link
                href={cert.verifyPath}
                className="text-sm font-medium text-[var(--brand-amber,#E8940C)] underline-offset-4 hover:underline"
              >
                Verify
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
