import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminResetPasswordForm } from "@/features/authentication/components/admin-reset-password-form";

export const metadata: Metadata = {
  title: "Reset password — Admin",
  robots: { index: false },
};

export default function AdminResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <AdminResetPasswordForm />
    </Suspense>
  );
}
