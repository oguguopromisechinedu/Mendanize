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

/**
 * Dual-domain edge protection (MES-030) + request ID (MES-032).
 */
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestId = requestIdFromHeaders(req.headers);
  const requestHeaders = withRequestIdHeaders(req.headers, requestId);

  const next = () =>
    NextResponse.next({
      request: { headers: requestHeaders },
    });

  const toPublicSignIn = () => {
    const signIn = new URL("/sign-in", req.nextUrl.origin);
    signIn.searchParams.set("callbackUrl", pathname);
    const res = NextResponse.redirect(signIn);
    res.headers.set("x-request-id", requestId);
    return res;
  };

  const toAdminLogin = () => {
    const login = new URL("/dashboard/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    const res = NextResponse.redirect(login);
    res.headers.set("x-request-id", requestId);
    return res;
  };

  if (isAdminRoute(pathname)) {
    const adminSession = await adminAuth();
    if (!adminSession?.admin?.id) {
      return toAdminLogin();
    }
    const res = next();
    res.headers.set("x-request-id", requestId);
    return res;
  }

  if (isAdminAuthRoute(pathname)) {
    const adminSession = await adminAuth();
    if (adminSession?.admin?.id) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
    return next();
  }

  if (isPublicProtectedRoute(pathname)) {
    const publicSession = await publicAuth();
    if (!publicSession?.user?.id || publicSession.user.domain !== "public") {
      return toPublicSignIn();
    }
    const res = next();
    res.headers.set("x-request-id", requestId);
    return res;
  }

  if (isAuthRoute(pathname)) {
    const publicSession = await publicAuth();
    if (publicSession?.user?.id && publicSession.user.domain === "public") {
      return NextResponse.redirect(new URL("/account", req.nextUrl.origin));
    }
    return next();
  }

  const res = next();
  res.headers.set("x-request-id", requestId);
  return res;
}

export const config = {
  matcher: [
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
  ],
};
