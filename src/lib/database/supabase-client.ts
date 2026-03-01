import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy-loaded Supabase clients to ensure environment variables are available
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

// Create Supabase client for client-side operations
export const getSupabaseClient = (): SupabaseClient => {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !anonKey) {
      throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
    
    _supabase = createClient(url, anonKey)
  }
  return _supabase
}

// Create Supabase client with service role for server-side operations
export const getSupabaseAdmin = (): SupabaseClient => {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!url || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }
    
    _supabaseAdmin = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return _supabaseAdmin
}

// Backward compatibility exports
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    return getSupabaseClient()[prop as keyof SupabaseClient]
  }
})

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    return getSupabaseAdmin()[prop as keyof SupabaseClient]
  }
})