import { describe, expect, it } from "vitest"

import { designTokensToStyleBlock } from "@/lib/design-tokens-css"
import { SEEDED_DESIGN_TOKENS } from "@/services/settings/design-tokens"

describe("designTokensToStyleBlock", () => {
  it("emits light and dark CSS variable blocks from design tokens", () => {
    const tokens = structuredClone(SEEDED_DESIGN_TOKENS)
    tokens.colors.primary = "#ff00aa"
    tokens.colorsLight.primary = "#cc0088"

    const css = designTokensToStyleBlock(tokens)

    expect(css).toContain(":root {")
    expect(css).toContain(".dark {")
    expect(css).toContain("--primary: #cc0088")
    expect(css).toContain("--primary: #ff00aa")
    expect(css).toContain("--accent:")
    expect(css).toContain("--background:")
  })
})
