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

  // Only treat the request as authenticated when a real user is present.
  // `req.auth` can be a non-null object without a valid session, so check `user`.
  const user = req.auth?.user
  const isLoggedIn = !!user
  const isStaff = !!user?.role && isStaffRole(user.role)

  const isAdminRoute = adminPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  const toSignIn = () => {
    const signIn = new URL("/sign-in", req.nextUrl.origin)
    signIn.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signIn)
  }

  // Admin surfaces (the dashboard) require a staff session.
  // Anyone else — anonymous or non-staff — is sent to the admin login,
  // never to the homepage, so the sign-in page is always reachable.
  if (isAdminRoute && !isStaff) {
    return toSignIn()
  }

  // Other protected (non-admin) routes just require a signed-in user.
  if (isProtectedRoute(pathname) && !isAdminRoute && !isLoggedIn) {
    return toSignIn()
  }

  // Only staff (who can actually use the dashboard) skip the auth pages.
  // Non-staff and anonymous visitors must be able to reach /sign-in.
  if (isAuthRoute(pathname) && isStaff) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin))
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
