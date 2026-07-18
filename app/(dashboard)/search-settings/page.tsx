import { redirect } from "next/navigation"

/** Prefer gated `/dashboard/search-settings` (MES-007 / MES-017). */
export default function Page() {
  redirect("/dashboard/search-settings")
}
