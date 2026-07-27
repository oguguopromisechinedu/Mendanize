"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SearchModal } from "@/components/layout/SearchModal"
import { routes } from "@/lib/design"
import { cn } from "@/lib/utils"
import type { NavLink } from "@/services/settings/navigation"

type PublicHeaderProps = {
  brandName: string
  brandHref: string
  primary: NavLink[]
  mobile?: NavLink[]
  signInHref: string
}

function isActivePath(pathname: string, href: string) {
  if (href === "/" || href === "#") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function LinkLabel({ link }: { link: NavLink }) {
  return (
    <>
      {link.label}
      {link.badgeLabel ? (
        <span className="ml-1.5 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          {link.badgeLabel}
        </span>
      ) : null}
    </>
  )
}

function DesktopLink({
  link,
  pathname,
}: {
  link: NavLink
  pathname: string
}) {
  const active = isActivePath(pathname, link.href)
  const children = link.children?.filter(Boolean) ?? []

  if (children.length) {
    return (
      <div className="group relative">
        <span
          className={cn(
            "inline-flex cursor-default items-center text-sm font-medium transition-colors",
            active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
        >
          <LinkLabel link={link} />
        </span>
        <div className="invisible absolute left-0 top-full z-50 min-w-[12rem] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <ul className="rounded-lg border border-border bg-background p-2 shadow-md">
            {children.map((child) => (
              <li key={`${child.href}-${child.label}`}>
                <Link
                  href={child.href}
                  target={child.openInNewTab ? "_blank" : undefined}
                  rel={child.openInNewTab ? "noopener noreferrer" : undefined}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm transition-colors",
                    isActivePath(pathname, child.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-hover hover:text-foreground"
                  )}
                >
                  <LinkLabel link={child} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={link.href}
      target={link.openInNewTab ? "_blank" : undefined}
      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
      className={cn(
        "inline-flex items-center text-sm font-medium transition-colors",
        active
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      <LinkLabel link={link} />
    </Link>
  )
}

function MobileNavTree({
  links,
  pathname,
  depth = 0,
}: {
  links: NavLink[]
  pathname: string
  depth?: number
}) {
  return (
    <ul className={cn("flex flex-col gap-1", depth > 0 && "ml-3 border-l border-border pl-3")}>
      {links.map((link) => {
        const active = isActivePath(pathname, link.href)
        const children = link.children?.filter(Boolean) ?? []
        return (
          <li key={`${link.href}-${link.label}-${depth}`}>
            {link.href !== "#" ? (
              <SheetClose asChild>
                <Link
                  href={link.href}
                  target={link.openInNewTab ? "_blank" : undefined}
                  rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-foreground hover:bg-hover"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <LinkLabel link={link} />
                </Link>
              </SheetClose>
            ) : (
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <LinkLabel link={link} />
              </p>
            )}
            {children.length ? (
              <MobileNavTree links={children} pathname={pathname} depth={depth + 1} />
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export function PublicHeader({
  brandName,
  brandHref,
  primary,
  mobile,
  signInHref,
}: PublicHeaderProps) {
  const pathname = usePathname()
  const mobileLinks = mobile?.length ? mobile : primary

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-header/95 backdrop-blur-xl">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link
          href={brandHref}
          className="inline-flex items-center gap-2.5 font-display text-base font-bold text-foreground"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            M
          </span>
          {brandName}
        </Link>

        <nav
          className="hidden items-center gap-6 lg:flex"
          aria-label="Primary"
        >
          {primary.map((link) => (
            <DesktopLink
              key={`${link.href}-${link.label}`}
              link={link}
              pathname={pathname}
            />
          ))}
        </nav>

        <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-1.5">
          <SearchModal />
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden !whitespace-normal rounded-lg px-2.5 md:inline-flex"
          >
            <Link href={signInHref}>Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="hidden !whitespace-normal rounded-lg px-2.5 sm:inline-flex"
          >
            <Link href={routes.signUp}>
              <span className="hidden lg:inline">Create account</span>
              <span className="lg:hidden">Sign up</span>
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs p-6">
              <SheetTitle className="sr-only">Site navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Browse Mendanize sections and links.
              </SheetDescription>
              <div className="mb-8 flex items-center justify-between">
                <Link
                  href={brandHref}
                  className="inline-flex items-center gap-2.5 font-display text-base font-bold"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                    M
                  </span>
                  {brandName}
                </Link>
                <SheetClose asChild>
                  <Button type="button" variant="ghost" size="icon" aria-label="Close menu">
                    <XIcon className="size-5" />
                  </Button>
                </SheetClose>
              </div>
              <nav aria-label="Mobile primary">
                <MobileNavTree links={mobileLinks} pathname={pathname} />
              </nav>
              <div className="mt-8 space-y-2 border-t border-border pt-6">
                <SheetClose asChild>
                  <Button asChild variant="outline" className="w-full rounded-lg">
                    <Link href={signInHref}>Sign in</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="w-full rounded-lg">
                    <Link href={routes.signUp}>Create account</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
