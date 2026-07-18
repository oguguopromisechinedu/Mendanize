import { redirect } from "next/navigation"

/** Prefer gated `/dashboard/analytics` (MES-007 / MES-023). */
export default function Page() {
  redirect("/dashboard/analytics")
}
