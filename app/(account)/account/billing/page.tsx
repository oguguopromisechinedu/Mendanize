import { loadBillingDashboard } from "@/features/billing/server";
import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { requirePublicUser } from "@/features/authentication/server";
import {
  BillingDashboardView } from "@/features/billing";

export const metadata: Metadata = {
  title: "Billing",
  robots: { index: false },
};

export default async function Page() {
  const session = await requirePublicUser();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/billing")}`);
  }
  const data = await loadBillingDashboard(session.user.id);
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading billing…</p>}>
      <BillingDashboardView data={data} />
    </Suspense>
  );
}
