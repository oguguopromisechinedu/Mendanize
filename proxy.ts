import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { publicAuth } from "@/lib/auth/public";
import { adminAuth } from "@/lib/auth/admin";
import {
  isAdminAuthRoute,
  isAdminRoute,
  isAuthRoute,
  isPublicProtectedRoute,
} from "@/lib/auth/config";
import {
  requestIdFromHeaders,
  withRequestIdHeaders,
} from "@/middleware/index";
import { applyReferralCookieIfNeeded } from "@/services/referrals/cookie";

/**
 * Dual-domain edge protection (MES-030) + request ID (MES-032)
 * + first-touch referral cookie (MES-046).
 */
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestId = requestIdFromHeaders(req.headers);
  const requestHeaders = withRequestIdHeaders(req.headers, requestId);
  requestHeaders.set("x-pathname", pathname);

  const finish = (res: NextResponse) => {
    res.headers.set("x-request-id", requestId);
    return applyReferralCookieIfNeeded(req, res);
  };

  const next = () =>
    NextResponse.next({
      request: { headers: requestHeaders },
    });

  const toPublicSignIn = () => {
    const signIn = new URL("/sign-in", req.nextUrl.origin);
    signIn.searchParams.set("callbackUrl", pathname);
    const res = NextResponse.redirect(signIn);
    return finish(res);
  };

  const toAdminLogin = () => {
    const login = new URL("/dashboard/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    const res = NextResponse.redirect(login);
    return finish(res);
  };

  if (isAdminRoute(pathname)) {
    const adminSession = await adminAuth();
    if (!adminSession?.admin?.id) {
      return toAdminLogin();
    }
    return finish(next());
  }

  if (isAdminAuthRoute(pathname)) {
    const adminSession = await adminAuth();
    if (adminSession?.admin?.id) {
      return finish(
        NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin)),
      );
    }
    return finish(next());
  }

  if (isPublicProtectedRoute(pathname)) {
    const publicSession = await publicAuth();
    if (!publicSession?.user?.id || publicSession.user.domain !== "public") {
      return toPublicSignIn();
    }
    return finish(next());
  }

  if (isAuthRoute(pathname)) {
    const publicSession = await publicAuth();
    if (publicSession?.user?.id && publicSession.user.domain === "public") {
      return finish(
        NextResponse.redirect(new URL("/account", req.nextUrl.origin)),
      );
    }
    return finish(next());
  }

  return finish(next());
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/account",
    "/account/:path*",
    "/workspace/:path*",
    "/learning/:path*",
    "/ask",
    "/ask/:path*",
    "/onboarding",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/community",
    "/community/:path*",
    "/pricing",
  ],
};
