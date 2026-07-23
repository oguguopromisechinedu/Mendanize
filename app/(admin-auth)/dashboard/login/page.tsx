"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/features/authentication/components/auth-shell";
import {
  adminSignInWithCredentials,
  signInSchema,
} from "@/features/authentication";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(
        parsed.error.flatten().fieldErrors as Record<string, string[]>,
      );
      setError("Fix the highlighted fields");
      return;
    }

    setLoading(true);
    const res = await adminSignInWithCredentials({
      email: parsed.data.email,
      password: parsed.data.password,
      remember,
    });
    setLoading(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    router.push(callbackUrl.startsWith("/dashboard") ? callbackUrl : "/dashboard");
    router.refresh();
  };

  return (
    <AuthShell
      title="Admin sign in"
      description="Staff access only. Accounts are provisioned by a Super Administrator."
      footer={
        <Link href="/dashboard/forgot-password" className="text-primary hover:opacity-90">
          Forgot password?
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email?.[0] ? (
            <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!fieldErrors.password}
          />
          {fieldErrors.password?.[0] ? (
            <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
          />
          <Label htmlFor="remember" className="font-normal">
            Remember me
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
