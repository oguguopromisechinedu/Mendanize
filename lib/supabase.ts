/**
 * Supabase client for database and real-time features.
 * Currently using NextAuth for authentication (see /auth.ts).
 * 
 * To switch to Supabase Auth instead, install:
 *   npm install @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
 * 
 * Environment variables required:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 
 * GitHub OAuth is configured in NextAuth and can be used with Supabase RLS policies.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't throw during import; surface a console warning for developers.
  // In production you may want to throw or fail-fast depending on requirements.
  console.warn('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
