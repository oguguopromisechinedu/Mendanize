# Mendanize - Database Setup & Deployment Guide

This guide walks you through setting up the Mendanize blog platform database and deploying to production.

## Architecture

**Stack:**
- Frontend: Next.js + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Supabase (PostgreSQL)
- ORM: Prisma
- Deployment: Vercel

**Database Models:**
- `User` - Authors and admins
- `Post` - Blog articles
- `Category` - Post organization
- `Tag` - Post tagging
- `PostTag` - Many-to-many relationship
- `Subscriber` - Email subscribers
- Plus: Auth tables, Workspace, Projects, Chat, Generation history

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/oguguopromisechinedu/mendanize.git
cd mendanize
npm install
```

### 2. Create `.env.local`

Copy from `.env.example` and fill in your credentials:

```bash
# Database (from Supabase)
DATABASE_URL="postgresql://user:password@db.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="generate with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (Google & GitHub)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# OpenAI (for future AI features)
OPENAI_API_KEY="..."
```

### 3. Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use existing
3. Go to **Settings → Database** to get connection string
4. Go to **Settings → API** for Supabase keys
5. Format connection string as: `postgresql://user:password@host:port/database`

### 4. Setup Database

```bash
# Run migrations
npm run db:migrate

# Seed sample data (requires DATABASE_URL to be set)
npm run db:seed

# View database in Prisma Studio
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Database Utilities

### Blog Operations
```typescript
import { createPost, getPostBySlug, searchPosts } from '@/lib/db/blog'

// Create a post
const post = await createPost({
  title: 'My AI Post',
  slug: 'my-ai-post',
  content: '# Content here',
  authorId: 'user-id',
  categoryId: 'category-id',
  status: 'PUBLISHED',
})

// Get published posts
const posts = await getPublishedPosts(limit = 10, skip = 0)

// Search posts
const results = await searchPosts('AI learning')
```

### Category Operations
```typescript
import { getCategories, getCategoryBySlug } from '@/lib/db/blog'

// Get all categories
const categories = await getCategories()

// Get category with posts
const category = await getCategoryBySlug('ai-fundamentals')
```

### Tag Operations
```typescript
import { getTags, addTagsToPost } from '@/lib/db/blog'

// Get all tags
const tags = await getTags()

// Add tags to post
await addTagsToPost('post-id', ['tag-id-1', 'tag-id-2'])
```

### Subscriber Operations
```typescript
import { createSubscriber, getActiveSubscribers } from '@/lib/db/blog'

// Subscribe to blog
const subscriber = await createSubscriber({
  email: 'user@example.com',
  name: 'John Doe',
  categories: ['ai-fundamentals'],
})

// Get subscribers by category
const subs = await getSubscribersByCategory('ai-fundamentals')
```

## Prisma Commands

```bash
# Create a new migration
npm run db:migrate

# Check migration status
npx prisma migrate status

# Reset database (DEV ONLY - deletes all data!)
npx prisma migrate reset

# View database in UI
npm run db:studio

# Generate types
npx prisma generate

# Format schema
npx prisma format
```

## Production Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import the repository
4. Add environment variables in Vercel settings:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - All OAuth and API keys
5. Deploy!

### Post-Deployment

```bash
# Run migrations on production
vercel env pull  # Get production env vars
npm run db:migrate  # This runs in CI/CD automatically
```

### Vercel Setup Guide

1. **Environment Variables**
   - Go to Project → Settings → Environment Variables
   - Add all variables from `.env.local`
   - Use production database URL for `DATABASE_URL`

2. **Automatic Migrations**
   - Add to `package.json`:
     ```json
     "vercel-build": "npm run build && npm run db:migrate"
     ```
   - Set Build Command to: `npm run vercel-build`

3. **Database Backups**
   - Enable automatic backups in Supabase
   - Set up backup schedule in Supabase settings

## Scaling & Performance

### Database Optimization
- Add indexes on frequently queried columns
- Use Prisma's `.select()` to avoid fetching unnecessary fields
- Implement pagination for large result sets
- Use connection pooling (built into Supabase)

### Common Queries to Optimize
```typescript
// Instead of:
const post = await prisma.post.findUnique({ where: { id } })

// Do this to avoid unnecessary fields:
const post = await prisma.post.findUnique({
  where: { id },
  select: {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    publishedAt: true,
  }
})
```

## API Integration Points (Future)

The architecture is ready for:

1. **Claude API** - Article generation and enhancement
   ```typescript
   import { getClaudeClient } from '@/lib/ai/claude'
   // Generate article ideas, improve drafts, etc.
   ```

2. **OpenAI API** - Image generation and content enhancement
   ```typescript
   import { getOpenAIClient } from '@/lib/ai/openai'
   // Generate featured images, summaries, etc.
   ```

3. **Stripe** - Premium subscriptions
   ```typescript
   import { createStripeCustomer } from '@/lib/billing/stripe'
   // Create subscription tiers, manage billing
   ```

## Troubleshooting

### Database Connection Error
```
Error: Database not configured. Set DATABASE_URL.
```
**Solution:** Ensure `DATABASE_URL` is set in `.env.local`

### Migration Failed
```
Error: P3009
```
**Solution:** Check if migrations folder has conflicts. Run `npx prisma migrate resolve`

### Prisma Client Out of Sync
```
Error: Prisma Client is out of sync
```
**Solution:** Run `npx prisma generate` to regenerate client types

### Seed Script Fails
```bash
# Run with full output
npx tsx prisma/seed.ts --verbose
```

## Database Schema Diagram

```
User (Authors & Admins)
  ├─ posts[] → Post
  ├─ profile → Profile
  ├─ subscription → Subscription
  ├─ accounts[] → Account (OAuth)
  ├─ sessions[] → Session
  └─ [other SaaS fields]

Post (Blog Articles)
  ├─ author → User
  ├─ category → Category
  ├─ postTags[] → PostTag
  └─ [content, status, SEO fields]

Category
  └─ posts[] → Post

Tag
  └─ postTags[] → PostTag

PostTag (Many-to-Many Junction)
  ├─ post → Post
  └─ tag → Tag

Subscriber
  └─ [email list management]
```

## Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use Supabase RLS** - Row Level Security for data isolation
3. **Validate all inputs** - Use Zod schemas
4. **Limit API access** - Use rate limiting
5. **Keep secrets secure** - Rotate API keys regularly
6. **Use HTTPS only** - Enforced by Vercel

## Support & Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

**Last Updated:** 2026-07-01
**Mendanize Version:** 1.0.0
