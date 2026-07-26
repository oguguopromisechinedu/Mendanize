# Environment Configuration

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-16 |
| **Owner** | Mendanize Platform Architecture |


## Purpose

Catalog required and optional environment variables for local development, preview, and production, and define how secrets are managed.


## Scope

Application URL, database, auth, Supabase, AI providers, Stripe, Redis/rate-limit, analytics. Complements [MES-020](./engineering/MES-020.md) (non-secret preferences).


## Dependencies

- [MES-006-Authentication.md](./engineering/MES-006.md)
- [MES-020-Platform-Settings.md](./engineering/MES-020.md)
- [MES-021-Billing-Subscriptions.md](./engineering/MES-021.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [SECURITY-STANDARDS.md](./standards/Security-Standards.md)


## Quick Start

```bash
cp .env.example .env.local
# fill required values
npm run dev
```


## Variable Groups

| Group | Examples | Required |
|-------|----------|----------|
| App | `NEXT_PUBLIC_APP_URL` | Yes |
| Database | `DATABASE_URL` | Yes |
| Auth | `AUTH_SECRET`, OAuth client IDs/secrets | Yes for auth |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, service role (server-only) | Yes for storage/auth integrations |
| AI | `OPENAI_API_KEY` (v1.0 live provider) | For live generation; local mock if unset |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, publishable key | Yes for billing |
| Rate limit | Upstash Redis REST URL/token | Recommended in prod |
| Analytics | Vercel Analytics (platform) | Optional |


## Implementation Notes

- Never commit `.env.local` or production secrets.
- `NEXT_PUBLIC_*` must be safe for browsers.
- Server-only keys imported only from server modules.
- Platform Settings (MES-020) stores non-secret preferences; raw provider secrets remain in env/secret manager.
- Rotate compromised credentials immediately and invalidate sessions if auth secrets leak.


## Detailed Variable Reference

The following reference is maintained for operators and expands each variable:

This document explains all environment variables required to run Mendanize locally or in production.

## Quick Start (Local Development)

```bash
# Copy the example file
cp .env.example .env.local

# Fill in the required values (see sections below)
# Then start the development server
npm run dev
```

## Required Environment Variables

### Application Settings

#### `NEXT_PUBLIC_APP_URL`

- **Description:** The public URL of your application
- **Local:** `http://localhost:3000`
- **Production:** `https://your-domain.com`
- **Type:** String (URL)
- **Required:** Yes
- **Used by:** Frontend for redirects, API calls, canonical URLs

---

### Database (PostgreSQL)

#### `DATABASE_URL`

- **Description:** PostgreSQL connection string
- **Format:** `postgresql://[user]:[password]@[host]:[port]/[database]?schema=public`
- **Examples:**
  - **Local:** `postgresql://postgres:password@localhost:5432/mendanize?schema=public`
  - **Vercel Postgres:** `postgresql://user:password@ep-*.postgres.vercel-storage.com/mendanize?schema=public`
  - **AWS RDS:** `postgresql://admin:password@mendanize.123456.us-east-1.rds.amazonaws.com:5432/mendanize?schema=public`
- **Type:** String
- **Required:** Yes (for data persistence)
- **How to get:**
  1. Create a PostgreSQL database (local or cloud)
  2. Get the connection string from your provider
  3. Add to `.env.local`

**Setting up locally:**

```bash
# On macOS with Homebrew
brew install postgresql
brew services start postgresql

# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE mendanize;
CREATE USER mendanize_user WITH PASSWORD 'your_secure_password';
ALTER ROLE mendanize_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE mendanize TO mendanize_user;

# Your connection string:
# postgresql://mendanize_user:your_secure_password@localhost:5432/mendanize?schema=public
```

**Setting up with Vercel Postgres:**

```bash
# 1. Create a Vercel Postgres database via https://vercel.com/docs/storage/postgres
# 2. Copy the connection string from your Vercel dashboard
# 3. Add to .env.local
```

---

### Authentication (Next Auth v5)

#### `AUTH_SECRET`

- **Description:** Encryption key for JWT tokens and cookies
- **Generate:** `openssl rand -base64 32`
- **Type:** String (base64-encoded)
- **Required:** Yes
- **Never share:** This is sensitive! Never commit to git.
- **How to generate:**

  ```bash
  # macOS/Linux
  openssl rand -base64 32

  # Windows (PowerShell)
  [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
  ```

#### `AUTH_URL`

- **Description:** Base URL for authentication redirects
- **Local:** `http://localhost:3000`
- **Production:** `https://your-domain.com`
- **Type:** String (URL)
- **Required:** Yes
- **Used by:** NextAuth for OAuth callback URLs

#### `GOOGLE_CLIENT_ID`

- **Description:** OAuth 2.0 Client ID from Google Cloud Console
- **How to get:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com)
  2. Create a new project
  3. Enable Google+ API
  4. Create OAuth 2.0 Credentials (Web application)
  5. Add authorized redirect URIs:
     - Local: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://your-domain.com/api/auth/callback/google`
  6. Copy the Client ID to `.env.local`
- **Type:** String
- **Required:** For Google OAuth (optional if not needed)

#### `GOOGLE_CLIENT_SECRET`

- **Description:** OAuth 2.0 Client Secret from Google Cloud Console
- **Type:** String
- **Required:** For Google OAuth (optional if not needed)
- **Never share:** This is sensitive! Never commit to git.

---

### AI providers (Anthropic text · OpenAI images)

**Source of truth:**
- **Anthropic** (`ANTHROPIC_API_KEY`) — sole article / text generator
- **OpenAI** (`OPENAI_API_KEY`) — sole image generator (cover, inline, Studio)

There is no separate DALL·E provider in the product — image calls go through OpenAI.

| Provider | Env var | Owns |
|----------|---------|------|
| Claude / Anthropic | `ANTHROPIC_API_KEY` | All article / text generation |
| OpenAI | `OPENAI_API_KEY` | All image generation |

The dashboard **AI & API Status** panel lists Claude and OpenAI only.

#### `OPENAI_API_KEY`

- **Description:** API key for OpenAI image generation
- **How to get:**
  1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
  2. Create a new API key
  3. Copy to `.env.local`
- **Type:** String
- **Required:** For live image generation (Studio, Ask illustrations, article covers/body images). Optional for local UI work (mock drafts).
- **Used by:** Admin AI Studio images, Ask Mendanize images, article cover/inline images
- **Never share:** This is sensitive! Never commit to git.

#### `OPENAI_STUDIO_MODEL` (optional)

- **Description:** Reserved chat model override (text is Anthropic-owned; unused for articles)
- **Default:** `gpt-4o-mini`
- **Required:** No

#### `ANTHROPIC_API_KEY`

- **Description:** API key for Anthropic Claude article / text generation
- **How to get:** [Anthropic Console](https://console.anthropic.com/)
- **Required:** For live article generation. Optional for local UI work (mock drafts).
- **Never share:** Sensitive — never commit to git.

---

### Stripe (Payment Processing)

#### `STRIPE_SECRET_KEY`

- **Description:** Stripe secret key for backend operations
- **How to get:**
  1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
  2. Navigate to Developers → API Keys
  3. Copy the Secret Key (starts with `sk_`)
- **Type:** String
- **Required:** For billing features (optional until monetization)
- **Never share:** This is sensitive! Never commit to git.

#### `STRIPE_WEBHOOK_SECRET`

- **Description:** Webhook signing secret for Stripe events
- **How to get:**
  1. Stripe Dashboard → Webhooks
  2. Create a new endpoint pointing to `/api/webhooks/stripe`
  3. Copy the Signing Secret
- **Type:** String
- **Required:** For billing features (optional until monetization)
- **Never share:** This is sensitive! Never commit to git.

#### `STRIPE_PRICE_PRO`

- **Description:** Stripe Price ID for Pro tier
- **Format:** `price_` followed by alphanumeric characters
- **Example:** `price_1234567890abcdef`
- **Type:** String
- **Required:** For billing features (optional until monetization)

#### `STRIPE_PRICE_TEAM`

- **Description:** Stripe Price ID for Team tier
- **Format:** `price_` followed by alphanumeric characters
- **Type:** String
- **Required:** For billing features (optional until monetization)

#### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

- **Description:** Stripe public key for frontend operations
- **How to get:** Stripe Dashboard → Developers → API Keys (Publishable Key)
- **Format:** `pk_` followed by alphanumeric characters
- **Type:** String
- **Required:** For billing features (optional until monetization)
- **Note:** This is public! Safe to expose in frontend code.

---

### Rate Limiting (Redis)

#### `UPSTASH_REDIS_REST_URL`

- **Description:** Redis URL for rate limiting and caching
- **How to get:**
  1. Go to [Upstash](https://upstash.com) and create a Redis database
  2. Copy the REST URL
- **Type:** String
- **Required:** No (falls back to in-memory rate limiting if not set)
- **Format:** `https://[user]:[password]@[region].upstash.io/`
- **Used by:** Rate limiting, session management
- **Note:** In-memory fallback works fine locally; use Redis in production

#### `UPSTASH_REDIS_REST_TOKEN`

- **Description:** Redis REST API authentication token
- **How to get:** Same as above, shown in Upstash dashboard
- **Type:** String
- **Required:** No (falls back to in-memory if not set)
- **Never share:** This is sensitive! Never commit to git.

---

## Environment by Stage

### Local Development (.env.local)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/mendanize?schema=public
AUTH_SECRET=your-generated-secret
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=sk-your-openai-key
# Other AI provider keys are reserved for post-v1.0 (not connected yet)
```

**Optional for local dev:**

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Without `OPENAI_API_KEY`, Studio and Ask still run using local mock drafts.
### Staging Environment

Same as production but use staging URLs and test API keys:

```env
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
DATABASE_URL=postgresql://user:pass@staging-db.example.com/mendanize
AUTH_URL=https://staging.your-domain.com
GOOGLE_CLIENT_ID=staging-client-id
STRIPE_SECRET_KEY=sk_test_... (use test key)
```

### Production Environment

All variables required, use production credentials:

```env
NEXT_PUBLIC_APP_URL=https://mendanize.io
DATABASE_URL=postgresql://user:pass@prod-db.example.com/mendanize
AUTH_SECRET=prod-secret (different from local!)
AUTH_URL=https://mendanize.io
OPENAI_API_KEY=sk_prod_key
STRIPE_SECRET_KEY=sk_live_... (use live key)
```

---

## Setting Up Database

### Step 1: Create Local PostgreSQL Database

```bash
# Create database and user
createdb mendanize
createuser mendanize_user
psql mendanize -c "ALTER USER mendanize_user WITH PASSWORD 'password';"
psql mendanize -c "GRANT ALL PRIVILEGES ON DATABASE mendanize TO mendanize_user;"

# Your DATABASE_URL:
# postgresql://mendanize_user:password@localhost:5432/mendanize?schema=public
```

### Step 2: Push Schema to Database

```bash
# Set DATABASE_URL in .env.local, then:
npx prisma db push
```

### Step 3: View Database (Optional)

```bash
# Open Prisma Studio GUI
npx prisma studio
```

---

## Setting Up Authentication

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (e.g., "Mendanize")
3. Enable the Google+ API
4. Create OAuth 2.0 Credentials:
   - Type: Web application
   - Name: Mendanize Web App
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-domain.com/api/auth/callback/google`
5. Copy **Client ID** and **Client Secret** to `.env.local`

### Test Authentication Locally

```bash
# 1. Start dev server
npm run dev

# 2. Go to http://localhost:3000/sign-in
# 3. Try signing in with Google or email/password
# 4. After signup, you'll be redirected to /dashboard
```

---

## Verifying Your Setup

### Check Database Connection

```typescript
// Run this in a Node REPL or test file
import { prisma } from "@/lib/db/prisma";

const users = await prisma.user.findMany();
console.log(users);
```

### Check Environment Variables

```bash
# List loaded environment variables (don't commit secrets!)
node -e "console.log(process.env.NEXT_PUBLIC_APP_URL)"
```

### Verify Build

```bash
# Should complete with no errors
npm run build

# Should show 0 errors, 0 warnings
npm run lint
```

---

## Troubleshooting

### "DATABASE_URL is not set"

**Problem:** Database connection fails  
**Solution:**

1. Check `.env.local` has `DATABASE_URL` set
2. Verify PostgreSQL is running: `psql postgres -c "SELECT 1"`
3. Test connection string manually: `psql postgresql://...`

### "AUTH_SECRET is not set"

**Problem:** Authentication not working  
**Solution:**

1. Generate secret: `openssl rand -base64 32`
2. Add to `.env.local`: `AUTH_SECRET=your-generated-secret`
3. Restart dev server

### "Cannot connect to Google OAuth"

**Problem:** Google sign-in fails  
**Solution:**

1. Verify credentials in Google Cloud Console
2. Check redirect URIs are correct
3. Ensure `AUTH_URL` matches your domain
4. Check browser console for error details

### "Too many requests" error

**Problem:** Getting rate limited  
**Solution:**

1. This is intentional rate limiting (protects API)
2. Wait a few minutes, then try again
3. In production, Redis is used; locally, in-memory store resets on restart

---

## Security Best Practices

✅ **DO:**

- Use different `AUTH_SECRET` for each environment
- Rotate `AUTH_SECRET` regularly in production
- Use strong passwords for database users
- Enable database backups
- Use HTTPS for all production URLs
- Rotate OpenAI API keys periodically
- Monitor Stripe for suspicious activity

❌ **DON'T:**

- Commit `.env.local` to git (already in `.gitignore`)
- Share `AUTH_SECRET`, `OPENAI_API_KEY`, or database credentials
- Use test/dev credentials in production
- Reuse passwords across services
- Log secrets in console or error tracking
- Use `localhost` URLs in production

---

## Getting Help

- **Database Issues:** See [Prisma Docs](https://www.prisma.io/docs)
- **Auth Issues:** See [Next Auth Docs](https://authjs.dev)
- **OpenAI Issues:** See [OpenAI API Docs](https://platform.openai.com/docs)
- **Stripe Issues:** See [Stripe Docs](https://stripe.com/docs)
- **Deployment:** See [Vercel Docs](https://vercel.com/docs)

---

## Checklist Before Launch

- [ ] All required environment variables set
- [ ] DATABASE_URL points to production database
- [ ] AUTH_SECRET is unique and random
- [ ] Google OAuth credentials are production credentials
- [ ] OPENAI_API_KEY is configured
- [ ] Stripe credentials are set (if monetization enabled)
- [ ] `NEXT_PUBLIC_APP_URL` is correct for your domain
- [ ] Database backups are configured
- [ ] Monitoring/alerting is set up
- [ ] All team members know not to share secrets

---

**Last updated:** 2026-07-16  
**Status:** Current for Next.js 16.2.6 + Prisma 7.8.0 + NextAuth v5. AI: OpenAI-only at v1.0.


## Related Documents

- [Deployment](./DEPLOYMENT.md)
- [Security Standards](./standards/Security-Standards.md)
- [Platform Settings](./engineering/MES-020.md)
