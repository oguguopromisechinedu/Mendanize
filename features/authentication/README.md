# authentication

**Implements:** MES-006

**Session contract:** Auth.js (NextAuth v5) + Prisma — single owner for sessions.  
Supabase is the PostgreSQL host, not a parallel auth provider.

Import from `@/features/authentication`.

## Structure

- `components/` — AuthShell, sign-in/up, forgot/reset, verify-email
- `actions/` — sign-up, password reset, sign-out
- `services/` — `getSession`, `requireAdmin`, `requireEditor`, profile foundation
- `validators/` — Zod schemas
- `types/` — AuthSession, roles, profile foundation
