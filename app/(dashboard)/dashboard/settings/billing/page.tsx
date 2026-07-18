import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { requireUser } from "@/features/authentication/server";
import {
  BillingDashboardView,
  loadBillingDashboard,
} from "@/features/billing";

export const metadata: Metadata = {
  title: "Billing",
  robots: { index: false },
};

export default async function Page() {
  const session = await requireUser();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/dashboard/settings/billing")}`);
  }
  const data = await loadBillingDashboard(session.user.id);
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading billing…</p>}>
      <BillingDashboardView data={data} />
    </Suspense>
  );
}
