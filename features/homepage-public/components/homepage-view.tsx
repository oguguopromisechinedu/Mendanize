import type { HomepageContent, HomepageSectionId } from "../types/types"
import { visibleSections } from "../utils/visible-sections"
import { sectionMeta } from "../utils/section-meta"
import { HeroSection } from "./hero-section"
import { StatsSection } from "./stats-section"
import { CategoriesSection } from "./categories-section"
import { PathsSection } from "./paths-section"
import { ArticlesSection } from "./articles-section"
import { ToolsSection } from "./tools-section"
import { WhySection } from "./why-section"
import { TestimonialsSection } from "./testimonials-section"
import { FaqSection } from "./faq-section"
import { FinalCtaSection } from "./final-cta-section"
import { LatestNewsletterSection } from "./latest-newsletter-section"

function renderSection(id: HomepageSectionId, content: HomepageContent) {
  const meta = sectionMeta(content.sections, id)

  switch (id) {
    case "hero":
      return (
        <HeroSection key={id} content={content.hero} ask={content.ask} />
      )
    case "ask":
      return null
    case "stats":
      return (
        <StatsSection
          key={id}
          items={content.stats}
          spacing={meta?.spacing}
        />
      )
    case "categories":
      return (
        <CategoriesSection
          key={id}
          items={content.categories}
          titleOverride={meta?.title}
          spacing={meta?.spacing}
        />
      )
    case "paths":
      return (
        <PathsSection
          key={id}
          items={content.paths}
          titleOverride={meta?.title}
          spacing={meta?.spacing}
        />
      )
    case "articles":
      return (
        <ArticlesSection
          key={id}
          items={content.articles}
          titleOverride={meta?.title}
          spacing={meta?.spacing}
        />
      )
    case "tools":
      return (
        <ToolsSection
          key={id}
          items={content.tools}
          titleOverride={meta?.title}
          spacing={meta?.spacing}
        />
      )
    case "why":
      return (
        <WhySection
          key={id}
          items={content.why}
          titleOverride={meta?.title}
          spacing={meta?.spacing}
        />
      )
    case "testimonials":
      return (
        <TestimonialsSection
          key={id}
          items={content.testimonials}
          titleOverride={meta?.title}
          spacing={meta?.spacing}
        />
      )
    case "newsletter":
      return (
        <LatestNewsletterSection
          key={id}
          articles={content.latestArticles}
          newsletter={content.newsletter}
          titleOverride={meta?.title}
          spacing={meta?.spacing}
        />
      )
    case "faq":
      return (
        <FaqSection
          key={id}
          items={content.faq}
          titleOverride={meta?.title}
          spacing={meta?.spacing}
        />
      )
    case "finalCta":
      return (
        <FinalCtaSection
          key={id}
          content={content.finalCta}
          spacing={meta?.spacing}
        />
      )
    default:
      return null
  }
}

/** Reusable homepage composition — section order/visibility from content payload. */
export function HomepageView({ content }: { content: HomepageContent }) {
  const order = visibleSections(content)
  return <div className="flex flex-col">{order.map((id) => renderSection(id, content))}</div>
}
