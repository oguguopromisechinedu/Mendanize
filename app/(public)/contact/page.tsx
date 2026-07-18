import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Mendanize — placeholder page for the public shell.",
}

export default function ContactPage() {
  return (
    <PageShell
      title="Contact"
      description="Placeholder contact page. Forms and notifications land with later MES specs."
      crumbs={[{ label: "Contact" }]}
    />
  )
}
