import { createClient } from '@supabase/supabase-js'
import { config } from '../config'

// Create Supabase client for client-side operations
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
)

// Create Supabase client with service role for server-side operations
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)