import { redirect } from "next/navigation"

/** Prefer gated `/dashboard/navigation` (MES-007). */
export default function Page() {
  redirect("/dashboard/navigation")
}
