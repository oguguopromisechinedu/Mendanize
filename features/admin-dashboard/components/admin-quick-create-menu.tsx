"use client"

import Link from "next/link"
import {
  BookOpen,
  FileText,
  FolderPlus,
  Hash,
  Home,
  ImageIcon,
  Menu,
  Plus,
  Sparkles,
  Upload,
  Video,
  BarChart3,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const CREATE_ITEMS = [
  { label: "Create Article", href: "/dashboard/articles/new", icon: FileText },
  { label: "Create Guide", href: "/dashboard/guides/new", icon: BookOpen },
  { label: "Add Category", href: "/dashboard/categories/new", icon: FolderPlus },
  { label: "Add Topic", href: "/dashboard/topics/new", icon: Hash },
  { label: "Upload Media", href: "/dashboard/media/upload", icon: Upload },
  { label: "Create Page", href: "/dashboard/pages", icon: FileText },
  { label: "Navbar Manager", href: "/dashboard/navigation", icon: Menu },
  { label: "Homepage Builder", href: "/dashboard/homepage", icon: Home },
  { label: "AI Image Generator", href: "/dashboard/ai-studio/image", icon: ImageIcon },
  { label: "AI Video Generator", href: "/dashboard/ai-studio/video", icon: Video },
  { label: "AI Article Draft", href: "/dashboard/ai-studio/article", icon: Sparkles },
  { label: "View Analytics", href: "/dashboard/analytics", icon: BarChart3 },
] as const

export function AdminQuickCreateMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-1.5 rounded-lg shadow-glow">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Quick Create</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Create & manage</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {CREATE_ITEMS.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href} className="flex items-center gap-2">
              <item.icon className="size-4 text-primary" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { CREATE_ITEMS }
