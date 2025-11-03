"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { DecisionHistory } from '@/components/decision-history'
import { DecisionResults } from '@/components/decision-results'
import { SavedDecision, AnalysisResult } from '@/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function HistoryPage() {
  const [selectedDecision, setSelectedDecision] = useState<SavedDecision | null>(null)

  const handleViewDecision = (decision: SavedDecision) => {
    setSelectedDecision(decision)
  }

  const handleBackToHistory = () => {
    setSelectedDecision(null)
  }

  if (selectedDecision) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <header className="border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToHistory}
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to History</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">P</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
                  PathFinder
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">{selectedDecision.title}</h2>
                <p className="text-muted-foreground">
                  Analyzed on {new Date(selectedDecision.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
            
            <DecisionResults 
              result={selectedDecision.analysis_result}
              onSave={() => {}} // Already saved
              onExport={() => {}} // Could implement export here
            />
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center cursor-pointer">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
              PathFinder
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <DecisionHistory 
          onViewDecision={handleViewDecision}
          onDeleteDecision={() => {}} // Handled internally
        />
      </main>
    </div>
  )
}