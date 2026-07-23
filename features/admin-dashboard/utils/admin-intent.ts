/**
 * Admin dashboard AI command intents.
 * Routes generate + organize requests into CMS tools or Ask Admin.
 */

export type AdminIntentKind =
  | "generate_article"
  | "generate_image"
  | "generate_video"
  | "organize_articles"
  | "organize_categories"
  | "organize_topics"
  | "organize_media"
  | "organize_navigation"
  | "organize_homepage"
  | "seo"
  | "analytics"
  | "subscribers"
  | "settings"
  | "publish_workflow"
  | "ask_general"

export type AdminIntent = {
  kind: AdminIntentKind
  label: string
  href: string
  /** Prefill for Ask / Studio */
  draft: string
  /** Topic extracted for Studio article generation */
  topic?: string
  /** Whether to open Ask with the draft instead of only navigating */
  openAsk: boolean
}

type RouteRule = {
  kind: AdminIntentKind
  label: string
  href: string
  openAsk: boolean
  patterns: RegExp[]
  topicFrom?: (q: string) => string | undefined
}

function extractTopic(q: string, prefixes: RegExp[]): string | undefined {
  for (const prefix of prefixes) {
    const m = q.match(prefix)
    if (m?.[1]?.trim()) return m[1].trim().replace(/[?.!]+$/, "")
  }
  return undefined
}

const RULES: RouteRule[] = [
  {
    kind: "generate_article",
    label: "Generate article (Claude)",
    href: "/dashboard/ai-studio/article",
    openAsk: false,
    patterns: [
      /\b(write|draft|generate|create)\b.*\b(article|post|blog|guide content)\b/i,
      /\barticle about\b/i,
      /\bdraft (an? )?article\b/i,
    ],
    topicFrom: (q) =>
      (extractTopic(q, [
        /(?:article|post|blog|guide)\s+(?:about|on|for)\s+(.+)$/i,
        /(?:write|draft|generate|create)\s+(?:an?\s+)?(?:article|post|blog)\s+(.+)$/i,
      ]) ??
        q
          .replace(
            /^(write|draft|generate|create)\s+(an?\s+)?(article|post|blog)\s*/i,
            "",
          )
          .trim()) || undefined,
  },
  {
    kind: "generate_image",
    label: "Generate image (OpenAI)",
    href: "/dashboard/ai-studio/image",
    openAsk: false,
    patterns: [
      /\b(generate|create|make)\b.*\b(image|images|illustration|cover|thumbnail|featured image)\b/i,
      /\b(dall-?e|featured image)\b/i,
    ],
  },
  {
    kind: "generate_video",
    label: "Generate video",
    href: "/dashboard/ai-studio/video",
    openAsk: false,
    patterns: [/\b(generate|create|make)\b.*\bvideo\b/i, /\b30[- ]?second\b.*\bvideo\b/i],
  },
  {
    kind: "organize_articles",
    label: "Articles CMS",
    href: "/dashboard/articles",
    openAsk: true,
    patterns: [
      /\b(organize|manage|list|review|schedule|archive)\b.*\barticles?\b/i,
      /\b(drafts?|scheduled)\b.*\barticles?\b/i,
      /\bpublish(ed)?\b.*\barticles?\b/i,
    ],
  },
  {
    kind: "organize_categories",
    label: "Categories",
    href: "/dashboard/categories",
    openAsk: true,
    patterns: [/\b(organize|manage|add|create|reorder)\b.*\bcategor(y|ies)\b/i],
  },
  {
    kind: "organize_topics",
    label: "Topics",
    href: "/dashboard/topics",
    openAsk: true,
    patterns: [/\b(organize|manage|add|create)\b.*\btopics?\b/i],
  },
  {
    kind: "organize_media",
    label: "Media library",
    href: "/dashboard/media",
    openAsk: true,
    patterns: [/\b(organize|manage|upload|library)\b.*\b(media|assets?|images?)\b/i],
  },
  {
    kind: "organize_navigation",
    label: "Navigation",
    href: "/dashboard/navigation",
    openAsk: true,
    patterns: [/\b(organize|manage|edit)\b.*\b(nav|navigation|menu|navbar)\b/i],
  },
  {
    kind: "organize_homepage",
    label: "Homepage CMS",
    href: "/dashboard/homepage",
    openAsk: true,
    patterns: [/\b(organize|manage|edit|update)\b.*\b(homepage|home page|hero)\b/i],
  },
  {
    kind: "seo",
    label: "SEO Center",
    href: "/dashboard/seo",
    openAsk: true,
    patterns: [/\bseo\b/i, /\b(meta description|focus keyword|optimize)\b/i],
  },
  {
    kind: "analytics",
    label: "Analytics",
    href: "/dashboard/analytics",
    openAsk: true,
    patterns: [/\banalytics?\b/i, /\b(traffic|visitors|page views)\b/i],
  },
  {
    kind: "subscribers",
    label: "Subscribers",
    href: "/dashboard/subscribers",
    openAsk: true,
    patterns: [/\bsubscribers?\b/i, /\bnewsletter\b/i],
  },
  {
    kind: "settings",
    label: "Platform settings",
    href: "/dashboard/settings",
    openAsk: true,
    patterns: [/\b(settings?|integrations?|api keys?|providers?)\b/i],
  },
  {
    kind: "publish_workflow",
    label: "Publishing workflow",
    href: "/dashboard/articles",
    openAsk: true,
    patterns: [/\b(publish|publishing workflow|review queue|go live)\b/i],
  },
]

export const ADMIN_COMMAND_SUGGESTIONS = [
  {
    label: "Write an article about AI Agents",
    kind: "generate_article" as const,
    draft: "Write an article about AI Agents",
  },
  {
    label: "Generate a featured image",
    kind: "generate_image" as const,
    draft: "Generate a featured image for my latest article",
  },
  {
    label: "Organize article drafts",
    kind: "organize_articles" as const,
    draft: "Help me organize and prioritize article drafts for publish",
  },
  {
    label: "Optimize SEO before publish",
    kind: "seo" as const,
    draft: "Create an SEO checklist for my next article before publish",
  },
  {
    label: "Update homepage hero",
    kind: "organize_homepage" as const,
    draft: "Suggest homepage hero copy and CMS steps to publish it",
  },
  {
    label: "Review publishing workflow",
    kind: "publish_workflow" as const,
    draft: "Walk me through Topic → Generate → SEO → Review → Publish",
  },
] as const

export function resolveAdminIntent(raw: string): AdminIntent {
  const q = raw.trim()
  if (!q) {
    return {
      kind: "ask_general",
      label: "Ask Admin",
      href: "/dashboard/ai-studio",
      draft: "",
      openAsk: true,
    }
  }

  for (const rule of RULES) {
    if (!rule.patterns.some((p) => p.test(q))) continue
    const topic = rule.topicFrom?.(q)
    const href =
      rule.kind === "generate_article" && topic
        ? `${rule.href}?topic=${encodeURIComponent(topic)}`
        : rule.kind === "generate_image"
          ? `${rule.href}?prompt=${encodeURIComponent(q)}`
          : rule.href

    return {
      kind: rule.kind,
      label: rule.label,
      href,
      draft: q,
      topic,
      openAsk: rule.openAsk,
    }
  }

  return {
    kind: "ask_general",
    label: "Ask Admin",
    href: "/dashboard/ai-studio",
    draft: q,
    openAsk: true,
  }
}

/** CMS action cards appended to admin Ask replies. */
export function adminActionsForQuery(raw: string): Array<{
  title: string
  href: string
  reason: string
}> {
  const intent = resolveAdminIntent(raw)
  const base = [
    {
      title: intent.label,
      href: intent.href.split("?")[0]!,
      reason: "Matched your request",
    },
    {
      title: "AI Studio · Article",
      href: "/dashboard/ai-studio/article",
      reason: "Generate with Claude + OpenAI image",
    },
    {
      title: "Articles CMS",
      href: "/dashboard/articles",
      reason: "Organize drafts → publish",
    },
    {
      title: "SEO Center",
      href: "/dashboard/seo",
      reason: "Optimize before go-live",
    },
  ]

  // Dedupe by href
  const seen = new Set<string>()
  return base.filter((a) => {
    if (seen.has(a.href)) return false
    seen.add(a.href)
    return true
  })
}

export function buildAdminActionMarkdown(
  actions: Array<{ title: string; href: string; reason: string }>,
): string {
  if (!actions.length) return ""
  const lines = [
    "",
    "### CMS actions you can take now",
    ...actions.map((a) => `- [${a.title}](${a.href}) — ${a.reason}`),
  ]
  return lines.join("\n")
}
