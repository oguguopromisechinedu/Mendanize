import { redirect } from "next/navigation"

/** Prefer gated `/dashboard/seo` (MES-007). */
export default function Page() {
  redirect("/dashboard/seo")
}
