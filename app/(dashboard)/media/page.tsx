import { redirect } from "next/navigation"

/** Prefer gated `/dashboard/media` (MES-007). */
export default function Page() {
  redirect("/dashboard/media")
}
