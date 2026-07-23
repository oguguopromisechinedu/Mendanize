import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requirePublicUser } from "@/features/authentication/server";
import { AskDashboardView } from "@/features/ask-mendanize";
import { loadAskDashboard } from "@/features/ask-mendanize/server";

export const metadata: Metadata = {
  title: "Ask Mendanize",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Tier 2 Ask — PublicUser session only (MES-019 / MES-030) */
export default async function AskPage({ searchParams }: PageProps) {
  const session = await requirePublicUser();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/ask");
  }

  const raw = await searchParams;
  const c = typeof raw.c === "string" ? raw.c : null;
  const handoff = typeof raw.handoff === "string" ? raw.handoff : null;
  const draft = typeof raw.draft === "string" ? raw.draft : null;
  const intent = typeof raw.intent === "string" ? raw.intent : null;

  const payload = await loadAskDashboard({
    userId: session.user.id,
    conversationId: c,
    handoffId: handoff,
  });

  return (
    <div className="px-4 py-6 sm:px-6">
      <AskDashboardView
        payload={payload}
        initialDraft={draft}
        initialIntent={intent}
      />
    </div>
  );
}
