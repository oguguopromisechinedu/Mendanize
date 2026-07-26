import Link from "next/link"
import {
  BriefcaseBusiness,
  Clapperboard,
  GitBranch,
  X,
  type LucideIcon,
} from "lucide-react"

import { FooterNewsletter } from "@/components/layout/FooterNewsletter"
import { Separator } from "@/components/ui/separator"
import type { NavigationConfig } from "@/services/settings/navigation"

type PublicFooterProps = {
  config: Pick<
    NavigationConfig,
    | "brand"
    | "footer"
    | "social"
    | "popularTopics"
    | "newsletter"
    | "copyrightText"
  >
}

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  x: X,
  twitter: X,
  linkedin: BriefcaseBusiness,
  github: GitBranch,
  youtube: Clapperboard,
}

function socialIcon(label: string): LucideIcon | null {
  return SOCIAL_ICONS[label.trim().toLowerCase()] ?? null
}

/** Footer reads from Navbar Manager via getNavigationConfig (MES-016 / MES-004). */
export function PublicFooter({ config }: PublicFooterProps) {
  const year = new Date().getFullYear()
  const copyright =
    config.copyrightText?.trim() ||
    `© ${year} ${config.brand.name}. All rights reserved.`
  const topics = config.popularTopics ?? []

  return (
    <footer className="mt-auto border-t border-border bg-surface text-muted-foreground">
      <div className="container-app section-y">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-7 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] lg:gap-7">
          <div className="col-span-2 lg:col-span-1">
            <Link
              href={config.brand.href}
              className="inline-flex items-center gap-2 font-display text-sm font-bold text-foreground sm:gap-2.5 sm:text-base"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground sm:size-8 sm:text-sm">
                M
              </span>
              {config.brand.name}
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 sm:mt-4 sm:leading-7">
              {config.brand.tagline}
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-5 sm:gap-3">
              {config.social.map((item) => {
                const Icon = socialIcon(item.label)
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    className="inline-flex text-muted-foreground transition-colors hover:text-primary"
                  >
                    {Icon ? <Icon className="size-4" aria-hidden /> : item.label}
                  </a>
                )
              })}
            </div>
          </div>

          {config.footer.map((section) => (
            <div key={section.id} className="min-w-0">
              <p className="mb-2.5 text-xs font-semibold text-foreground sm:mb-4 sm:text-sm">
                {section.title}
              </p>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {section.links.map((link) => (
                  <li key={`${section.id}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      target={link.openInNewTab ? "_blank" : undefined}
                      rel={
                        link.openInNewTab ? "noopener noreferrer" : undefined
                      }
                      className="block truncate text-xs leading-5 hover:text-foreground sm:text-sm sm:leading-normal"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {topics.length > 0 ? (
            <div className="col-span-2 min-w-0 sm:col-span-1">
              <p className="mb-2.5 text-xs font-semibold text-foreground sm:mb-4 sm:text-sm">
                Popular Topics
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {topics.map((topic) => (
                  <Link
                    key={topic.label}
                    href={topic.href}
                    className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:px-2.5 sm:py-1 sm:text-[11px]"
                  >
                    {topic.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {config.newsletter.enabled ? (
          <>
            <Separator className="my-7 sm:my-10" />
            <FooterNewsletter
              headline={config.newsletter.headline}
              placeholder={config.newsletter.placeholder}
            />
          </>
        ) : null}
      </div>

      <div className="border-t border-border py-4 sm:py-6">
        <div className="container-app text-center text-xs sm:text-left">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
