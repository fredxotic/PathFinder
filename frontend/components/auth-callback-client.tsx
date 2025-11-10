// components/auth-callback-client.tsx
"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Use the public key here, not the service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabase client instance used only for the code exchange
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function AuthCallbackClient() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const handleAuthCallback = async () => {
            const code = searchParams.get('code')
            
            if (code) {
                // Exchange the temporary code for a permanent user session/token
                console.log("Found code, exchanging for session...")
                const { error } = await supabase.auth.exchangeCodeForSession(code)

                if (error) {
                    console.error("Error exchanging code:", error)
                    router.replace('/?error=login_failed')
                    return
                }

                console.log("Session exchange successful. Redirecting to home.")
                // If successful, redirect to the main application dashboard
                router.replace('/')
            } else {
                 // CRITICAL FIX: Always clear the hash fragment immediately
                if (window.location.hash) {
                    // Use replaceState to clear the hash without triggering another route change
                    window.history.replaceState(null, '', window.location.origin + window.location.pathname);
                }
                
                // If no code is present (e.g., direct navigation or hash cleared)
                console.log("No code found in URL. Redirecting to home.")
                router.replace('/')
            }
        }

        handleAuthCallback()
    }, [router, searchParams])

    // Render a simple loading state while processing the token exchange
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Finalizing authentication...</p>
        </div>
    )
}