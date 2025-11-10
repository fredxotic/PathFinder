"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { supabase, getCurrentUser } from '@/lib/supabase-client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: string | null; data: any }>
  signIn: (email: string, password: string) => Promise<{ error: string | null; data: any }>
  signInWithGoogle: () => Promise<{ error: string | null; data: any }>
  signOut: () => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const user = await getCurrentUser()
        setUser(user)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      })
      return { 
        error: error ? error.message : null,
        data 
      }
    } catch (error: any) {
      return { 
        error: error.message || 'An unexpected error occurred during sign up',
        data: null 
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      return { 
        error: error ? error.message : null,
        data 
      }
    } catch (error: any) {
      return { 
        error: error.message || 'An unexpected error occurred during sign in',
        data: null 
      }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // IMPORTANT: This redirect URL must be configured in your Supabase Auth Providers settings.
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { 
        error: error ? error.message : null,
        data 
      }

    } catch (error: any) {
      return { 
        error: error.message || 'An unexpected error occurred during Google sign in',
        data: null 
      }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { 
        error: error ? error.message : null
      }

    } catch (error: any) {
      return { 
        error: error.message || 'An unexpected error occurred during sign out'
      }
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}