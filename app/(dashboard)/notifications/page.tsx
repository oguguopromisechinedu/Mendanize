import { redirect } from "next/navigation"

/** Prefer `/dashboard/notifications` (MES-007 / MES-024). */
export default function Page() {
  redirect("/dashboard/notifications")
}
