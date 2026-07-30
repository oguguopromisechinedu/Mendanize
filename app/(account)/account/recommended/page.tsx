import { loadRecommended } from "@/features/user-learning/server";
import type { Metadata } from "next"

import { requirePublicUser } from "@/features/authentication/server"
import {
  RecommendedView } from "@/features/user-learning";

export const metadata: Metadata = {
  title: "Recommended for you",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  const items = await loadRecommended(session!.user.id)
  return <RecommendedView items={items} />
}
