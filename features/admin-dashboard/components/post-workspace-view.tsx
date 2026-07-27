import Link from "next/link"
import {
  BookOpen,
  Calendar,
  FilePen,
  FileText,
  Folder,
  ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  Sparkles,
  Tags,
  Trash2,
  Video,
  type LucideIcon,
} from "lucide-react"

import { AdminPageHeader } from "@/features/admin-dashboard/components/admin-primitives"

const POST_TOOLS: Array<{
  label: string
  description: string
  href: string
  icon: LucideIcon
}> = [
  {
    label: "Articles",
    description: "Create, edit, and publish articles",
    href: "/dashboard/articles",
    icon: FileText,
  },
  {
    label: "Learning Guides",
    description: "Manage learning paths and lessons",
    href: "/dashboard/guides",
    icon: BookOpen,
  },
  {
    label: "Categories",
    description: "Organize content by category",
    href: "/dashboard/categories",
    icon: Folder,
  },
  {
    label: "Topics",
    description: "Maintain the topic graph",
    href: "/dashboard/topics",
    icon: Tags,
  },
  {
    label: "Media Library",
    description: "Images, video, and other assets",
    href: "/dashboard/media",
    icon: ImageIcon,
  },
  {
    label: "Pages",
    description: "Static and marketing pages",
    href: "/dashboard/pages",
    icon: LayoutTemplate,
  },
  {
    label: "AI Article Generator",
    description: "Anthropic-assisted article drafts",
    href: "/dashboard/ai-studio/article",
    icon: Sparkles,
  },
  {
    label: "AI Image Generator",
    description: "OpenAI cover and inline images",
    href: "/dashboard/ai-studio/image",
    icon: ImageIcon,
  },
  {
    label: "AI Video Generator",
    description: "Short-form video generation",
    href: "/dashboard/ai-studio/video",
    icon: Video,
  },
  {
    label: "Scheduled Posts",
    description: "Articles queued for future publish",
    href: "/dashboard/articles/scheduled",
    icon: Calendar,
  },
  {
    label: "Drafts",
    description: "Unpublished article drafts",
    href: "/dashboard/articles/drafts",
    icon: FilePen,
  },
  {
    label: "Trash",
    description: "Archived articles",
    href: "/dashboard/articles/archived",
    icon: Trash2,
  },
]

export function PostWorkspaceView() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Post"
        description="Dedicated workspace for publishing and content management — articles, guides, media, pages, and AI generators."
      />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {POST_TOOLS.map((tool) => {
          const Icon = tool.icon
          return (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="group flex h-full items-start gap-3 rounded-xl border border-border bg-card/80 px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-hover hover:shadow-sm"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary transition group-hover:bg-primary/25">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {tool.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {tool.description}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <LayoutDashboard className="size-3.5" aria-hidden />
        Platform health and business metrics stay on the main Dashboard.
      </p>
    </div>
  )
}
