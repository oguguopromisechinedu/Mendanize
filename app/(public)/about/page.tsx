import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"

export const metadata: Metadata = {
  title: "About",
  description: "About Mendanize — placeholder page for the public shell.",
}

export default function AboutPage() {
  return (
    <PageShell
      title="About"
      description="Placeholder about page. Narrative and mission content can be managed later via CMS settings."
      crumbs={[{ label: "About" }]}
    />
  )
}
