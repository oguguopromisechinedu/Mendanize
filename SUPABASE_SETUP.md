# Supabase Integration Guide

This project integrates Supabase for database and real-time features alongside NextAuth for authentication.

## Setup Steps

### 1. Install Dependencies
Supabase dependencies should already be in `package.json`:
```bash
npm install @supabase/supabase-js
```

### 2. Create a Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Get your project URL and anon key from **Settings → API**

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For server-side only
```

### 4. GitHub OAuth Setup (Optional)
For OAuth integration with Supabase RLS policies:
- Configure GitHub OAuth in Supabase dashboard
- Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env.local`

## Usage

### Client-Side (Browser)
```typescript
import { supabase } from '@/lib/supabase'

// Fetch data
const { data, error } = await supabase
  .from('your_table')
  .select('*')
```

### Server-Side (API Routes / Server Actions)
```typescript
import { supabaseAdmin } from '@/lib/supabase/server'

// Use service role key for privileged operations
const { data, error } = await supabaseAdmin
  .from('your_table')
  .select('*')
```

## Authentication Flow

Currently, **NextAuth** handles user authentication:
- Google OAuth
- GitHub OAuth
- Email/Password (Credentials)

Supabase is used for **database and real-time features**, not authentication. 

To switch to Supabase Auth in the future:
```bash
npm install @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
```

Then update `auth.ts` and create middleware for session management.

## Real-Time Subscriptions

Listen for real-time database changes:
```typescript
import { supabase } from '@/lib/supabase'

const channel = supabase
  .channel('your_table')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'your_table' },
    (payload) => console.log('Change received!', payload)
  )
  .subscribe()

// Cleanup
channel.unsubscribe()
```

## Security

- **`NEXT_PUBLIC_*`** variables are safe to expose to the browser
- **`SUPABASE_SERVICE_ROLE_KEY`** must NEVER be exposed to the client
- Use Supabase RLS (Row Level Security) policies to control data access
- Leverage NextAuth session in your RLS policies via JWT claims

## Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS SDK](https://supabase.com/docs/reference/javascript)
- [NextAuth Docs](https://next-auth.js.org)
