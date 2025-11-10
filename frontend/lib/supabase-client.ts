import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 1. Export the main client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// 2. Unified helper that ensures authentication and returns the client (used by profile/history pages)
export const getSupabaseWithAuth = async () => {
  // CRITICAL: We wait for the session to be established before proceeding.
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated. Please sign in.')
  }
  
  return supabase
}

// 3. Auth helper functions with better error handling (no change here)
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error: error ? new Error(error.message) : null }
  } catch (error: any) {
    return { data: null, error }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error: error ? new Error(error.message) : null }
  } catch (error: any) {
    return { data: null, error }
  }
}

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error: error ? new Error(error.message) : null }
  } catch (error: any) {
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error: error ? new Error(error.message) : null }
  } catch (error: any) {
    return { error }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// 4. Update getAuthHeaders to use the session's access_token (this function is crucial for API routes)
export const getAuthHeaders = async () => {
  // CRITICAL FIX: Ensure we call getSession() to get the most current token
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.access_token) {
    // We throw a more specific error here, which helps the calling API route return a 401
    throw new Error('No authentication token found in session')
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  }
}