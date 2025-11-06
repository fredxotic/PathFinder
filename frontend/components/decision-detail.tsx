"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Download, Trash2, ArrowLeft } from 'lucide-react'
import { SavedDecision } from '@/types'
import { PDFExport } from '@/components/pdf-export'
import { useToast } from '@/components/ui/toast'

interface DecisionDetailProps {
  decision: SavedDecision
  onClose: () => void
  onDelete: (decisionId: string) => void
}

export function DecisionDetail({ decision, onClose, onDelete }: DecisionDetailProps) {
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
        onDelete(decision.id)
        onClose()
    } catch (error) {
        console.error('Error deleting decision:', error)
        toast('Failed to delete decision', 'error')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-background border rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{decision.title}</h2>
              <p className="text-muted-foreground text-sm">
                Created {formatDate(decision.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <PDFExport decision={decision} result={decision.analysis_result} />
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="grid gap-6">
            {/* Context */}
            <Card>
              <CardHeader>
                <CardTitle>Context</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {decision.context}
                </p>
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle>Options Considered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {decision.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        option === decision.analysis_result.recommended_option
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{option}</span>
                        {option === decision.analysis_result.recommended_option && (
                          <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                            Recommended
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priorities */}
            <Card>
              <CardHeader>
                <CardTitle>Priorities & Weights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {decision.priorities.map((priority, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{priority.name}</span>
                        <p className="text-sm text-muted-foreground">{priority.description}</p>
                      </div>
                      <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                        Weight: {priority.weight}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analysis Result */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Recommended Option</h4>
                    <p className="text-lg font-bold">{decision.analysis_result.recommended_option}</p>
                  </div>
                  <div className="bg-secondary p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Confidence Level</h4>
                    <p className="text-lg font-bold">{decision.analysis_result.confidence}%</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {decision.analysis_result.summary}
                  </p>
                </div>

                {decision.analysis_result.reasoning && (
                  <div>
                    <h4 className="font-semibold mb-2">Detailed Reasoning</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">
                        {decision.analysis_result.reasoning}
                      </p>
                    </div>
                  </div>
                )}

                {/* Scores */}
                <div>
                  <h4 className="font-semibold mb-3">Option Scores</h4>
                  <div className="space-y-3">
                    {decision.analysis_result.scores.map((score, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{score.option}</span>
                          <span className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm">
                            Overall Score: {score.overall_score}
                          </span>
                        </div>
                        {score.priority_scores && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                            {Object.entries(score.priority_scores).map(([priority, priorityScore]) => (
                              <div key={priority} className="text-center">
                                <div className="text-xs text-muted-foreground">{priority}</div>
                                <div className="font-semibold">{priorityScore}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}