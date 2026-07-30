import Link from "next/link"

import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/community", label: "Home", exact: true },
  { href: "/community/discussions", label: "Discussions" },
  { href: "/community/groups", label: "Study Groups" },
  { href: "/community/teams", label: "Teams" },
  { href: "/community/projects", label: "Showcase" },
  { href: "/community/events", label: "Events" },
  { href: "/community/guidelines", label: "Guidelines" },
]

export function CommunityNav({ currentPath }: { currentPath: string }) {
  return (
    <nav
      aria-label="Community"
      className="mb-8 flex flex-wrap gap-1 border-b border-border pb-3"
    >
      {LINKS.map((link) => {
        const active = link.exact
          ? currentPath === link.href
          : currentPath === link.href || currentPath.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-primary/15 text-foreground"
                : "text-muted-foreground hover:bg-hover hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
