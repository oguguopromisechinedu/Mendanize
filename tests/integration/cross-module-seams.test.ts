/**
 * Cross-module integration seam checks (MES-029).
 * Verifies Shared Services invariants without spinning a full browser.
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = path.resolve(__dirname, "../..")

function read(rel: string) {
  return readFileSync(path.join(root, rel), "utf8")
}

describe("MES-018 Recommendations sole source", () => {
  it("public and learning related rails import the recommendations feature/service", () => {
    const mustImport = [
      "features/articles/components/public/article-reading-view.tsx",
      "features/learning-guides/components/public/guide-resource-panel.tsx",
      "features/ai-tools/components/public/tool-detail-view.tsx",
      "features/user-learning/components/recommended-view.tsx",
    ]
    for (const rel of mustImport) {
      const src = read(rel)
      expect(
        src.includes("@/features/recommendations") ||
          src.includes("@/services/recommendations")
      ).toBe(true)
    }
  })

  it("recommendations service module exists as the single Shared Service", () => {
    expect(existsSync(path.join(root, "services/recommendations/service.ts"))).toBe(
      true
    )
    expect(existsSync(path.join(root, "features/recommendations/index.ts"))).toBe(
      true
    )
  })
})

describe("MES-020 AI settings sole screen", () => {
  it("Ask and AI Studio point at /dashboard/settings/ai", () => {
    const ask = read("services/ai/ask.ts")
    const studio = read("features/ai-studio/components/studio-home-view.tsx")
    expect(ask).toContain('/dashboard/settings/ai')
    expect(studio).toContain('/dashboard/settings/ai')
  })

  it("platform settings registers the AI settings route", () => {
    const constants = read("features/platform-settings/constants/constants.ts")
    expect(constants).toContain('/dashboard/settings/ai')
  })
})

describe("MES-016 / MES-004 navigation drives public shell", () => {
  it("PublicLayout loads navigation from settings service", () => {
    const layout = read("components/layout/PublicLayout.tsx")
    expect(layout).toContain("getNavigationConfig")
    expect(layout).toContain("@/services/settings/navigation")
    expect(layout).toContain("PublicHeader")
    expect(layout).toContain("PublicFooter")
  })
})

describe("MES-019 Ask handoff constants", () => {
  it("contextual widget can continue into authenticated Ask", () => {
    const constants = read("features/ask-mendanize/constants/constants.ts")
    expect(constants).toMatch(/ASK_DASHBOARD_HREF|ASK_SIGN_IN_HREF/)
  })
})

describe("MES-025-027 public surfaces exist", () => {
  it("ships article, guide, and AI tool public routes", () => {
    const publicDir = path.join(root, "app", "(public)")
    expect(
      existsSync(path.join(publicDir, "articles", "[slug]", "page.tsx"))
    ).toBe(true)
    expect(
      existsSync(path.join(publicDir, "guides", "[slug]", "page.tsx"))
    ).toBe(true)
    expect(
      existsSync(
        path.join(
          publicDir,
          "guides",
          "[slug]",
          "lessons",
          "[lessonSlug]",
          "page.tsx"
        )
      )
    ).toBe(true)
    expect(
      existsSync(path.join(publicDir, "ai-tools", "[slug]", "page.tsx"))
    ).toBe(true)
  })
})

describe("MES-028 production readiness seams", () => {
  it("exposes health, logger, and shared ErrorState", () => {
    expect(existsSync(path.join(root, "app/api/health/route.ts"))).toBe(true)
    expect(existsSync(path.join(root, "lib/logger.ts"))).toBe(true)
    expect(existsSync(path.join(root, "components/ui/error-state.tsx"))).toBe(
      true
    )
    expect(existsSync(path.join(root, "app/global-error.tsx"))).toBe(true)
  })
})

describe("MES-003 / MES-020 design customization propagates", () => {
  it("root layout injects Settings-backed design tokens", () => {
    const layout = read("app/layout.tsx")
    expect(layout).toContain("DesignTokensStyle")
    expect(existsSync(path.join(root, "components/layout/DesignTokensStyle.tsx"))).toBe(
      true
    )
    expect(existsSync(path.join(root, "lib/design-tokens-css.ts"))).toBe(true)
  })

  it("design token CSS helper maps branding colors to CSS variables", () => {
    const cssHelper = read("lib/design-tokens-css.ts")
    expect(cssHelper).toContain("designTokensToStyleBlock")
    expect(cssHelper).toContain('["primary"')
    expect(cssHelper).toContain("colorsLight")
  })

  it("DesignTokensStyle loads tokens from settings service", () => {
    const style = read("components/layout/DesignTokensStyle.tsx")
    expect(style).toContain("getDesignTokens")
    expect(style).toContain("@/services/settings")
  })
})

describe("MES-006 email verification end-to-end seams", () => {
  it("signup and verify actions exist with Notification Service dispatch", () => {
    const actions = read("features/authentication/actions/actions.ts")
    expect(actions).toContain("sendEmailVerification")
    expect(actions).toContain("verifyEmailWithToken")
    expect(actions).toContain("resendVerificationEmail")
    expect(existsSync(path.join(root, "features/authentication/services/verification.ts"))).toBe(
      true
    )
  })

  it("verify-email page consumes token query params", () => {
    const page = read("app/(auth)/verify-email/page.tsx")
    expect(page).toContain("verifyEmailWithToken")
    expect(page).toContain("searchParams")
  })

  it("credentials authorize allows immediate login after registration", () => {
    const auth = read("lib/auth/public.ts")
    const signup = read("features/authentication/actions/actions.ts")
    expect(auth).toContain('id: "credentials"')
    expect(auth).not.toContain("emailVerification && !user.emailVerified")
    expect(signup).toContain("publicSignIn")
    expect(signup).toContain("Account created. You are signed in.")
  })
})

describe("MES-030 dual authentication isolation", () => {
  it("keeps PublicUser and Admin Auth.js instances on separate cookies", () => {
    const cookies = read("lib/auth/cookies.ts")
    const publicAuth = read("lib/auth/public.ts")
    const adminAuth = read("lib/auth/admin.ts")
    expect(cookies).toContain("mendanize.public")
    expect(cookies).toContain("mendanize.admin")
    expect(publicAuth).toContain("PUBLIC_SESSION_COOKIE")
    expect(adminAuth).toContain("ADMIN_SESSION_COOKIE")
    expect(adminAuth).toContain("admin-credentials")
    expect(adminAuth).not.toContain("Google(")
  })

  it("proxy never cross-grants dashboard and account sessions", () => {
    const proxy = read("proxy.ts")
    expect(proxy).toContain("adminAuth")
    expect(proxy).toContain("publicAuth")
    expect(proxy).toContain("/dashboard/login")
    expect(proxy).toContain("/account")
    expect(proxy).toContain("/ask")
  })

  it("billing and learning live under /account for PublicUser", () => {
    expect(existsSync(path.join(root, "app/(account)/account/billing/page.tsx"))).toBe(
      true
    )
    expect(existsSync(path.join(root, "app/(account)/account/page.tsx"))).toBe(true)
    const billingConstants = read("features/billing/constants/constants.ts")
    expect(billingConstants).toContain('/account/billing')
    const learningNav = read("features/user-learning/constants/constants.ts")
    expect(learningNav).toContain('/account')
  })

  it("schema models PublicUser and Admin separately with AuthorizationLog", () => {
    const schema = read("prisma/schema.prisma")
    expect(schema).toContain("model PublicUser")
    expect(schema).toContain("model Admin")
    expect(schema).toContain("model AuthorizationLog")
    expect(schema).toContain("publicUserId")
    expect(schema).toContain("AdminRoleKey")
  })
})

describe("MES-004 / MES-009 public taxonomy and Learn are implemented", () => {
  it("ships complete public category, topic, and learn routes", () => {
    const publicDir = path.join(root, "app", "(public)")
    expect(existsSync(path.join(publicDir, "categories", "page.tsx"))).toBe(true)
    expect(existsSync(path.join(publicDir, "categories", "[slug]", "page.tsx"))).toBe(
      true
    )
    expect(existsSync(path.join(publicDir, "topics", "page.tsx"))).toBe(true)
    expect(existsSync(path.join(publicDir, "topics", "[slug]", "page.tsx"))).toBe(
      true
    )
    expect(existsSync(path.join(publicDir, "learn", "page.tsx"))).toBe(true)
  })

  it("public taxonomy pages are not placeholders", () => {
    for (const rel of [
      "app/(public)/categories/page.tsx",
      "app/(public)/topics/page.tsx",
      "app/(public)/learn/page.tsx",
    ]) {
      const src = read(rel)
      expect(src.toLowerCase()).not.toContain("placeholder")
      expect(src).toMatch(/Public(Category|Topic|Learn)View|listPublic/)
    }
  })

  it("content service exposes published taxonomy by slug", () => {
    const service = read("services/content/service.ts")
    expect(service).toContain("getPublishedCategoryBySlug")
    expect(service).toContain("getPublishedTopicBySlug")
    expect(service).toContain("listPublicCategories")
  })
})

describe("MES-006 session contract for AI API routes", () => {
  it("AI chat and tools routes use getSession, not auth() directly", () => {
    const chat = read("app/api/ai/chat/route.ts")
    const tools = read("app/api/ai/tools/route.ts")
    expect(chat).toContain('from "@/features/authentication/server"')
    expect(chat).toContain("getSession")
    expect(chat).not.toMatch(/from ["']@\/auth["']/)
    expect(tools).toContain('from "@/features/authentication/server"')
    expect(tools).toContain("getSession")
    expect(tools).not.toMatch(/from ["']@\/auth["']/)
  })
})

describe("MES-029 CI quality gates", () => {
  it("CI fails the job on lint and typecheck errors", () => {
    const ci = read(".github/workflows/ci.yml")
    expect(ci).toContain("npm run lint")
    expect(ci).toContain("npm run typecheck")
    const lintBlock = ci.slice(ci.indexOf("Lint"), ci.indexOf("Typecheck"))
    const typeBlock = ci.slice(ci.indexOf("Typecheck"), ci.indexOf("Unit"))
    expect(lintBlock).not.toContain("continue-on-error")
    expect(typeBlock).not.toContain("continue-on-error")
  })
})

describe("MES-019 Ask Tier 1/Tier 2 handoff wiring", () => {
  it("public Ask widget embeds on article, guide, and tool detail views", () => {
    const surfaces = [
      "features/articles/components/public/article-reading-view.tsx",
      "features/learning-guides/components/public/guide-overview-view.tsx",
      "features/ai-tools/components/public/tool-detail-view.tsx",
    ]
    for (const rel of surfaces) {
      if (!existsSync(path.join(root, rel))) continue
      const src = read(rel)
      expect(
        src.includes("ask-mendanize") ||
          src.includes("AskWidget") ||
          src.includes("ContextualAsk") ||
          src.includes("AskMendanize")
      ).toBe(true)
    }
  })
})
