"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Trash2, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SavedDecision } from '@/types'

interface DecisionHistoryProps {
  onViewDecision?: (decision: SavedDecision) => void
  onDeleteDecision?: (decisionId: string) => void
}

export function DecisionHistory({ onViewDecision, onDeleteDecision }: DecisionHistoryProps) {
  const [decisions, setDecisions] = useState<SavedDecision[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDecisions()
  }, [])

  const fetchDecisions = async () => {
    try {
      const response = await fetch('/api/decisions?user_id=demo-user')
      
      if (response.ok) {
        const data = await response.json()
        setDecisions(data)
      }
    } catch (error) {
      console.error('Error fetching decisions:', error)
    } finally {
      setLoading(false)
    }
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

  const handleDelete = async (decisionId: string) => {
    if (onDeleteDecision) {
      onDeleteDecision(decisionId)
    }
    // Optimistically remove from UI
    setDecisions(prev => prev.filter(d => d.id !== decisionId))
    
    try {
      await fetch(`/api/decisions/${decisionId}?user_id=demo-user`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error deleting decision:', error)
      // Revert optimistic update on error
      fetchDecisions()
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading decisions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Decision History</h2>
          <p className="text-muted-foreground mt-2">
            Review your past decisions and analyses
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Analysis
          </Button>
        </Link>
      </div>

      {decisions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
        <div className="grid gap-6">
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
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(decision.created_at)}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewDecision?.(decision)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(decision.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Recommended: <strong>{decision.analysis_result.recommended_option}</strong>
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      decision.analysis_result.confidence > 70 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : decision.analysis_result.confidence > 40
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      Confidence: {decision.analysis_result.confidence}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}