import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "Account",
    template: "%s | Mendanize",
  },
}

/**
 * Auth route group layout (MES-006).
 * URL group `(auth)` does not appear in the path.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
