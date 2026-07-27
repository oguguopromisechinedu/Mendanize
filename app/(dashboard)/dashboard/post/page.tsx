import type { Metadata } from "next"

import { PostWorkspaceView } from "@/features/admin-dashboard/components/post-workspace-view"

export const metadata: Metadata = {
  title: "Post",
  robots: { index: false },
}

export default function PostWorkspacePage() {
  return <PostWorkspaceView />
}
