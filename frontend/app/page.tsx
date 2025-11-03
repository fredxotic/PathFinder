"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DecisionForm } from '@/components/decision-form'
import { DecisionResults } from '@/components/decision-results'
import Link from 'next/link'
import { History } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

import { AnalysisResult, Decision } from '@/types'

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null)

  const handleAnalyzeDecision = async (decisionData: Decision) => {
    setIsLoading(true)
    setCurrentDecision(decisionData)
    try {
      const response = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(decisionData),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      console.error('Error analyzing decision:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDecision = async () => {
    if (!analysisResult || !currentDecision) return
    
    try {
      await fetch('/api/save-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision: currentDecision, // Use the original decision data
          result: analysisResult,
        }),
      })
      // Show success message
    } catch (error) {
      console.error('Error saving decision:', error)
    }
  }

  const handleExportPDF = () => {
    // Implement PDF export using jsPDF
    console.log('Exporting PDF...')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
              PathFinder
            </h1>
          </motion.div>
          <div className="flex items-center space-x-2">
            <Link href="/history">
              <Button variant="outline" size="sm">
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            Make Better Life Decisions with AI
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get structured analysis, visual insights, and AI-powered recommendations 
            for your important life and career choices.
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
            decision={currentDecision} // Pass the original decision data
            onSave={handleSaveDecision}
            onExport={handleExportPDF}
          />
        )}
      </main>
    </div>
  )
}