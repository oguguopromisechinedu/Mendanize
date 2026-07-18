import type { Metadata } from "next"

import PublicLayout from "@/components/layout/PublicLayout"

export const metadata: Metadata = {
  title: {
    default: "Mendanize",
    template: "%s | Mendanize",
  },
  description:
    "AI-powered technology learning platform — articles, guides, tools, and structured learning.",
}

/**
 * Teaching Frontend route group layout (MES-004).
 * URL group `(public)` does not appear in the path.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>
}
