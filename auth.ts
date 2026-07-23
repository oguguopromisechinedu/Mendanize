/**
 * Root auth re-exports — public domain is the default Auth.js instance.
 * Admin auth: `@/lib/auth/admin`
 */

export {
  publicHandlers as handlers,
  publicAuth as auth,
  publicSignIn as signIn,
  publicSignOut as signOut,
} from "@/lib/auth/public";
