import type { HomepageContent, HomepageSectionId } from "../types/types"

export function visibleSections(content: HomepageContent): HomepageSectionId[] {
  return [...content.sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order)
    .map((s) => s.id)
}
