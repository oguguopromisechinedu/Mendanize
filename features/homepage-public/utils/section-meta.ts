import type { HomepageSectionMeta } from "../types/types"

export function sectionMeta(
  sections: HomepageSectionMeta[],
  id: string,
) {
  return sections.find((s) => s.id === id)
}

export function sectionSpacingClass(spacing?: string) {
  switch (spacing) {
    case "compact":
      return "py-10 lg:py-14"
    case "spacious":
      return "py-20 lg:py-32"
    default:
      return undefined
  }
}
