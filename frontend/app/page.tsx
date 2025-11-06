// frontend/app/page.tsx
"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DecisionForm } from '@/components/decision-form'
import { DecisionResults } from '@/components/decision-results'
import Link from 'next/link'
import { History, User, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { AuthForms } from '@/components/auth-forms'
import { AnalysisResult, Decision } from '@/types'
import { useToast } from '@/components/ui/toast'
import { getAuthHeaders } from '@/lib/auth-headers'

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null)
  
  const { user, signOut, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const handleAnalyzeDecision = async (decisionData: Decision) => {
    if (!user) return
    
    setIsLoading(true)
    setCurrentDecision(decisionData)
    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers,
        body: JSON.stringify(decisionData),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      console.error('Error analyzing decision:', error)
      toast('Analysis failed. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDecision = async () => {
    if (!analysisResult || !currentDecision || !user) return
    
    try {
      const response = await fetch('/api/save-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision: currentDecision,
          result: analysisResult,
          user_id: user.id // Make sure this is included
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save decision')
      }

      toast('Decision saved successfully!', 'success')
    } catch (error) {
      console.error('Error saving decision:', error)
      toast('Failed to save decision', 'error')
    }
  }

  const handleExportPDF = () => {
    // Implement PDF export using jsPDF
    console.log('Exporting PDF...')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Show auth forms if not logged in
  if (!user && !authLoading) {
    return <AuthForms />
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs sm:text-sm">P</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
                PathFinder
              </h1>
            </motion.div>
            
            {/* Mobile menu button could go here in the future */}
            
            <div className="flex items-center flex-wrap justify-center gap-1 sm:gap-2">
              <Link href="/history">
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm">
                  <History className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  History
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm">
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Sign Out
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Make Better Life Decisions with AI
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Get structured analysis, visual insights, and AI-powered recommendations 
            for your important life and career choices.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Welcome back, {user?.email}!
          </p>
        </motion.div>

        {!analysisResult ? (
          <DecisionForm 
            onSubmit={handleAnalyzeDecision}
            isLoading={isLoading}
          />
        ) : (
          <DecisionResults
            result={analysisResult}
            decision={currentDecision}
            onSave={handleSaveDecision}
            onExport={handleExportPDF}
          />
        )}
      </main>
    </div>
  )
}