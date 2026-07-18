import Link from "next/link"
import type { ReactNode } from "react"

import Logo from "@/components/brand/Logo"
import { routes } from "@/lib/design"

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo className="justify-center" href={routes.home} />
          <h1 className="mt-8 font-display text-2xl font-semibold text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-md">
          {children}
        </div>
        {footer ? (
          <div className="text-center text-sm text-muted-foreground">{footer}</div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            <Link href={routes.home} className="text-primary hover:opacity-90">
              Back to home
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
