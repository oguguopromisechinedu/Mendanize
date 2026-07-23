/**
 * Root auth re-exports — public domain is the default Auth.js instance.
 * Admin auth: `@/lib/auth/admin`
 *
 * OAuth / credentials hardening lives in `lib/auth/public.ts` (conditional
 * providers + guarded authorize). Admin credentials are separate.
 */

export {
  publicHandlers as handlers,
  publicAuth as auth,
  publicSignIn as signIn,
  publicSignOut as signOut,
} from "@/lib/auth/public";
