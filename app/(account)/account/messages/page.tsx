import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requirePublicUser } from "@/features/authentication/server";
import { Button } from "@/components/ui/button";
import { listConversationsForUser } from "@/services/ai/ask";
import { listMentorshipsForUser } from "@/services/growth";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false },
};

export default async function Page() {
  const session = await requirePublicUser();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/messages")}`);
  }

  const userId = session.user.id;
  const [mentorships, conversations] = await Promise.all([
    listMentorshipsForUser(userId),
    listConversationsForUser(userId),
  ]);

  const mentorshipCount =
    mentorships.asMentee.length + mentorships.asMentor.length;

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Messages
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          AI Tutor conversations and mentorship threads. Full direct messaging
          between learners ships in a later phase.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium">AI Tutor history</h2>
          <Button asChild size="sm" variant="outline" className="rounded-xl">
            <Link href="/ask">New conversation</Link>
          </Button>
        </div>
        {conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved conversations yet. Ask Mendanize AI to start one.
          </p>
        ) : (
          <ul className="space-y-2">
            {conversations.slice(0, 20).map((conversation) => (
              <li key={conversation.id}>
                <Link
                  href={`/ask?conversation=${conversation.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3 transition hover:border-primary/40 hover:bg-hover"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {conversation.title}
                    </p>
                    {conversation.contextTitle ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {conversation.contextTitle}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 border-t border-border/60 pt-8">
        <h2 className="text-lg font-medium">Mentorship</h2>
        <p className="text-sm text-muted-foreground">
          {mentorshipCount === 0
            ? "No active mentorship relationships yet."
            : `${mentorships.asMentee.length} as mentee · ${mentorships.asMentor.length} as mentor`}
        </p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/account/career">Open Career Hub</Link>
        </Button>
      </section>

      <section className="space-y-3 border-t border-border/60 pt-8">
        <h2 className="text-lg font-medium">Community</h2>
        <p className="text-sm text-muted-foreground">
          Join discussions and study groups while peer-to-peer chat is in
          development.
        </p>
        <Button asChild className="rounded-xl">
          <Link href="/community/discussions">Browse discussions</Link>
        </Button>
      </section>
    </div>
  );
}
