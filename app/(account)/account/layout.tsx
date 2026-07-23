import { redirect } from "next/navigation";

import { requirePublicUser } from "@/features/authentication/server";

/** Authenticated PublicUser account area — MES-022 / MES-030 */
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePublicUser();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account")}`);
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-surface/40 px-6 py-3">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 text-sm">
          <a href="/account" className="font-medium text-foreground hover:opacity-90">
            My Learning
          </a>
          <a href="/account/saved" className="text-muted-foreground hover:text-foreground">
            Saved
          </a>
          <a href="/account/history" className="text-muted-foreground hover:text-foreground">
            History
          </a>
          <a href="/account/interests" className="text-muted-foreground hover:text-foreground">
            Interests
          </a>
          <a href="/account/preferences" className="text-muted-foreground hover:text-foreground">
            Preferences
          </a>
          <a href="/account/billing" className="text-muted-foreground hover:text-foreground">
            Billing
          </a>
          <a href="/account/privacy" className="text-muted-foreground hover:text-foreground">
            Privacy
          </a>
          <span className="ml-auto text-muted-foreground">
            {session.user.email}
          </span>
        </nav>
      </div>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
