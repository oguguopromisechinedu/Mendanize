import type { Metadata } from "next";

import { AdminForgotPasswordForm } from "@/features/authentication/components/admin-forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password — Admin",
  robots: { index: false },
};

export default function AdminForgotPasswordPage() {
  return <AdminForgotPasswordForm />;
}
