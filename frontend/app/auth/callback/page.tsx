// frontend/app/auth/callback/page.tsx
"use client"

import dynamic from 'next/dynamic';
// FIX: Use the root alias (@/) instead of relative paths (../../)
const AuthCallbackClient = dynamic(() => import('@/components/auth-callback-client'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Initializing...</p>
        </div>
    ),
});

// Since we are creating a new client component, let's create that file now.
// For now, this main page only renders the client component.
export default function AuthCallbackPage() {
    return <AuthCallbackClient />;
}