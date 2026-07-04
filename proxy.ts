import { NextResponse } from "next/server";
import { auth } from "@/auth";

const protectedPrefixes = [
  "/dashboard",
  "/workspace",
  "/onboarding",
];

const adminPrefixes = ["/dashboard"];

const authRoutes = ["/sign-in", "/sign-up"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isProtected = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isAuthRoute = authRoutes.some((p) => pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    const signIn = new URL("/sign-in", req.nextUrl.origin);
    signIn.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signIn);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  if (
    adminPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`)) &&
    req.auth?.user?.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspace/:path*",
    "/onboarding",
    "/sign-in",
    "/sign-up",
  ],
};
