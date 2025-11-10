// frontend/app/auth/callback/page.tsx
"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// This component is strictly for handling the initial OAuth redirect and URL cleaning.
export default function AuthCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const handleAuthCallback = async () => {
            const code = searchParams.get('code')
            
            // --- CRITICAL HASH FIX ---
            // If hash is present (OAuth redirect), simply redirect to the clean base path ('/')
            // and stop the component from rendering, allowing the main App to take over.
            if (window.location.hash || code) {
                console.log("OAuth flow detected. Redirecting to clean root path ('/')")
                // router.replace handles clearing the URL state much better than window.location.href
                router.replace('/')
                return
            }
            // --- END CRITICAL HASH FIX ---
            
            // If we fall through and no hash/code is present, redirect home anyway
            console.log("Redirecting to home (fallback).")
            router.replace('/')
        }

        // We wrap this in a timeout to ensure Next.js has time to register the component before running navigation logic
        const timer = setTimeout(() => handleAuthCallback(), 100); 

        return () => clearTimeout(timer);

    }, [router, searchParams])

    // Render a simple loading state while waiting for redirection
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Finalizing authentication and redirecting...</p>
        </div>
    )
}