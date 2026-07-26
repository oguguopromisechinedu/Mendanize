import type { Metadata } from "next"
import Link from "next/link"

import { verifyCertificate } from "@/services/growth"

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  return {
    title: `Verify ${code}`,
    robots: { index: true },
  }
}

export default async function Page({ params }: Props) {
  const { code } = await params
  const cert = await verifyCertificate(code)

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-4 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
        Mendanize credential
      </p>
      {cert ? (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold">
            {cert.title}
          </h1>
          <p className="mt-4 text-muted-foreground">
            Issued to {cert.holderName ?? "a verified learner"} on{" "}
            {new Date(cert.issuedAt).toLocaleDateString()}.
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {cert.credentialCode}
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold">
            Certificate not found
          </h1>
          <p className="mt-4 text-muted-foreground">
            This credential code is not in our records.
          </p>
        </>
      )}
      <Link
        href="/"
        className="mt-10 text-sm font-medium underline-offset-4 hover:underline"
      >
        Back to Mendanize
      </Link>
    </main>
  )
}
