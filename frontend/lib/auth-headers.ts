import { supabase } from './supabase-client'

export async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.access_token) {
    // Reverting to throw a standard error, allowing the consuming route to handle it.
    throw new Error('No authentication token found in session. Please sign in again.')
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  }
}