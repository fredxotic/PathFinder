"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowLeft, Calendar, Trash2, Download } from 'lucide-react'
import Link from 'next/link'
import { SavedDecision } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { AuthForms } from '@/components/auth-forms'
import { useToast } from '@/components/ui/toast' // Add this import
import { getAuthHeaders } from '@/lib/auth-headers'

export default function HistoryPage() {
  const [decisions, setDecisions] = useState<SavedDecision[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchDecisions()
    }
  }, [user])

  const fetchDecisions = async () => {
    try {
      setLoading(true)
      const headers = await getAuthHeaders()
      
      const response = await fetch('/api/decisions', {
        headers,
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch decisions')
      }
      
      const data = await response.json()
      setDecisions(data)
    } catch (error) {
      console.error('Error fetching decisions:', error)
      toast('Failed to load decision history', 'error')
    } finally {
      setLoading(false)
    }
  }

  const deleteDecision = async (decisionId: string) => {
    setDeletingId(decisionId)
    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(`/api/decisions/${decisionId}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        throw new Error('Failed to delete decision')
      }

      toast('Decision deleted successfully', 'success')
      setDecisions(decisions.filter(d => d.id !== decisionId))
    } catch (error) {
      console.error('Error deleting decision:', error)
      toast('Failed to delete decision', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const exportDecision = (decision: SavedDecision) => {
    // Implement PDF export
    console.log('Exporting decision:', decision.id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Show auth forms if not logged in
  if (!user && !authLoading) {
    return <AuthForms />
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9">
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs sm:text-sm">P</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
                  PathFinder
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Decision History</h2>
          <p className="text-muted-foreground">
            Review your past decisions and analyses
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">Loading your decisions...</div>
        ) : decisions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No decisions yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by analyzing your first decision
            </p>
            <Link href="/">
              <Button>Make Your First Decision</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {decisions.map((decision, index) => (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{decision.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {formatDate(decision.created_at)}
                        </p>
                        <p className="text-sm text-primary font-semibold mt-1">
                          Recommended: {decision.analysis_result.recommended_option}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => exportDecision(decision)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteDecision(decision.id)}
                          disabled={deletingId === decision.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {decision.context}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {decision.options.map((option, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Confidence: {decision.analysis_result.confidence}%</span>
                      <span>Overall Score: {Math.max(...decision.analysis_result.scores.map(s => s.overall_score))}/100</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}