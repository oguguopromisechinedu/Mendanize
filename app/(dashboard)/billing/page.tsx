import { redirect } from "next/navigation";

/** Prefer `/dashboard/settings/billing` (MES-021). */
export default function Page() {
  redirect("/dashboard/settings/billing");
}
