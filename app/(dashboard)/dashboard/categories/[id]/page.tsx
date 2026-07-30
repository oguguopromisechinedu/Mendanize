import { loadCategoryDetails } from "@/features/categories-topics/server";
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  CategoryDetailView } from "@/features/categories-topics";

export const metadata: Metadata = {
  title: "Category details",
  robots: { index: false },
}

export default async function CategoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detail = await loadCategoryDetails(id)
  if (!detail) notFound()
  return <CategoryDetailView detail={detail} />
}
