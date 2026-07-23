import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forgot password — Admin",
  robots: { index: false },
};

/**
 * Admin forgot-password placeholder (MES-030).
 * Self-service admin reset is limited; Super Admins provision credentials.
 */
export default function AdminForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="font-display text-2xl font-semibold">Admin password reset</h1>
        <p className="text-sm text-muted-foreground">
          Admin accounts cannot self-register. Contact a Super Administrator to
          reset your password.
        </p>
        <Link href="/dashboard/login" className="text-sm text-primary hover:opacity-90">
          Back to admin sign in
        </Link>
      </div>
    </div>
  );
}
