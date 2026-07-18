import { NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  adminPrefixes,
  isAuthRoute,
  isProtectedRoute,
} from "@/lib/auth/config"
import { isStaffRole } from "@/features/authentication"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  if (isProtectedRoute(pathname) && !isLoggedIn) {
    const signIn = new URL("/sign-in", req.nextUrl.origin)
    signIn.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signIn)
  }

  if (isAuthRoute(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin))
  }

  if (
    adminPrefixes.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    ) &&
    (!req.auth?.user?.role || !isStaffRole(req.auth.user.role))
  ) {
    // Logged-in non-staff hitting /dashboard go home; unauthenticated already redirected above.
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspace/:path*",
    "/learning/:path*",
    "/ask/:path*",
    "/onboarding",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ],
}
