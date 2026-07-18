import { redirect } from "next/navigation";

import { requireUser } from "@/features/authentication/server";

/**
 * Authenticated learner layout — MES-022.
 * Private learning data; staff can access as learners too.
 */
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/learning")}`);
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-surface/40 px-6 py-3">
        <p className="text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">
            {session.user.email}
          </span>
        </p>
      </div>
      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
