import { redirect } from "next/navigation"

/** Prefer gated `/dashboard/settings` (MES-007 / MES-020). */
export default function Page() {
  redirect("/dashboard/settings")
}
