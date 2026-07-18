import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { NavigationConfig } from "@/services/settings/navigation"

type PublicFooterProps = {
  config: Pick<
    NavigationConfig,
    "brand" | "footer" | "social" | "newsletter" | "copyrightText"
  >
}

/** Footer reads from Navbar Manager via getNavigationConfig (MES-016). */
export function PublicFooter({ config }: PublicFooterProps) {
  const year = new Date().getFullYear()
  const copyright =
    config.copyrightText?.trim() ||
    `© ${year} ${config.brand.name}. All rights reserved.`

  return (
    <footer className="mt-auto border-t border-border bg-surface text-muted-foreground">
      <div className="container-app section-y">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link
              href={config.brand.href}
              className="inline-flex items-center gap-2.5 font-display text-base font-bold text-foreground"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                M
              </span>
              {config.brand.name}
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7">
              {config.brand.tagline}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {config.social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm hover:text-primary"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {config.footer.map((section) => (
            <div key={section.id}>
              <p className="mb-4 text-sm font-semibold text-foreground">
                {section.title}
              </p>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={`${section.id}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      target={link.openInNewTab ? "_blank" : undefined}
                      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                      className="text-sm hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {config.newsletter.enabled ? (
          <>
            <Separator className="my-10" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {config.newsletter.headline}
                </p>
                <p className="mt-1 text-sm">
                  Newsletter wiring is a placeholder until notifications land.
                </p>
              </div>
              <div className="flex w-full max-w-md gap-2">
                <Input
                  type="email"
                  name="email"
                  placeholder={config.newsletter.placeholder}
                  aria-label="Email for newsletter"
                  disabled
                />
                <Button type="button" disabled>
                  Subscribe
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="border-t border-border py-6">
        <div className="container-app text-xs">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
