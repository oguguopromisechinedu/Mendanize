import { redirect } from "next/navigation"

/** Prefer gated `/dashboard/ai-studio` (MES-007). */
export default function Page() {
  redirect("/dashboard/ai-studio")
}
