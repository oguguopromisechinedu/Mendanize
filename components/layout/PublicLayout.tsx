import { PublicHeader } from "@/components/layout/PublicHeader"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { PwaShell } from "@/components/pwa/pwa-shell"
import { ConsentBanner } from "@/features/privacy/components/consent-banner"
import { getNavigationConfig } from "@/services/settings/navigation"

/**
 * Teaching Frontend shell (MES-004).
 * Every public page under app/(public) inherits this layout.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nav = await getNavigationConfig()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicHeader
        brandName={nav.brand.name}
        brandHref={nav.brand.href}
        primary={nav.primary}
        mobile={nav.mobile}
        signInHref={nav.signInHref}
      />
      <main id="main-content" className="relative flex-1 isolate">
        {children}
      </main>
      <PublicFooter
        config={{
          brand: nav.brand,
          footer: nav.footer,
          social: nav.social,
          popularTopics: nav.popularTopics,
          newsletter: nav.newsletter,
          copyrightText: nav.copyrightText,
        }}
      />
      <ConsentBanner />
      <PwaShell />
    </div>
  )
}
