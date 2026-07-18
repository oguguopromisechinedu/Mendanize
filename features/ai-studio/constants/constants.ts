export const STUDIO_CARDS = [
  {
    id: "article",
    title: "Generate article",
    description: "Claude writes the draft; OpenAI adds a featured image.",
    href: "/dashboard/ai-studio/article",
  },
  {
    id: "image",
    title: "Generate image",
    description: "OpenAI DALL·E visuals for covers and inline media.",
    href: "/dashboard/ai-studio/image",
  },
  {
    id: "video",
    title: "Generate video",
    description: "Interface ready — provider wiring deferred.",
    href: "/dashboard/ai-studio/video",
  },
  {
    id: "history",
    title: "Generation history",
    description: "Search and reopen past Studio outputs.",
    href: "/dashboard/ai-studio/history",
  },
] as const
