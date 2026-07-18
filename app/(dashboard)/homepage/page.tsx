import { redirect } from "next/navigation"

/** Prefer gated `/dashboard/homepage` (MES-007 / MES-013). */
export default function Page() {
  redirect("/dashboard/homepage")
}
