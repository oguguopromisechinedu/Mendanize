/**
 * Server-side Supabase utilities
 * Use this for database operations that need elevated privileges
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!supabaseUrl) {
  console.warn('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseServiceRoleKey) {
  console.warn(
    'Missing SUPABASE_SERVICE_ROLE_KEY. Server-side operations may fail. Set this in .env.local for development.'
  )
}

/**
 * Admin Supabase client with service role key
 * Use only on the server side for privileged operations
 * Do NOT expose this client to the browser
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
})

export default supabaseAdmin
