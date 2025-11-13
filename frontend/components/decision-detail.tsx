"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { SavedDecision } from '@/types'
import { PDFExport } from '@/components/pdf-export'
import { useToast } from '@/components/ui/toast'
import React, { useState } from 'react'

interface DecisionDetailProps {
  decision: SavedDecision
  onClose: () => void
  onDelete: (decisionId: string) => Promise<boolean>
}

export function DecisionDetail({ decision, onClose, onDelete }: DecisionDetailProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const success = await onDelete(decision.id)
      if (success) {
        onClose()
      } else {
        toast('Failed to delete decision', 'error')
      }
    } catch (error) {
      console.error('Error deleting decision:', error)
      toast('Failed to delete decision', 'error')
    } finally {
      setIsDeleting(false)
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
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-background border rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-2 sm:mx-4"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b gap-3 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose} 
              disabled={isDeleting}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline ml-2">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                {decision.title}
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm truncate">
                Created {formatDate(decision.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-1 sm:space-x-2">
            <div className="hidden xs:block">
              <PDFExport decision={decision} result={decision.analysis_result} />
            </div>
            <Button 
              variant="destructive"
              size="sm" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              {isDeleting ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              disabled={isDeleting}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile PDF Export Button */}
        <div className="xs:hidden border-b p-2">
          <div className="flex justify-center">
            <PDFExport decision={decision} result={decision.analysis_result} />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-80px)] p-3 sm:p-4 md:p-6">
          <div className="grid gap-4 sm:gap-6">
            {/* Context */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Context</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base">
                  {decision.context}
                </p>
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Options Considered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:gap-3">
                  {decision.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 sm:p-4 rounded-lg border text-sm sm:text-base ${
                        option === decision.analysis_result.recommended_option
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                        <span className="font-medium break-words">{option}</span>
                        {option === decision.analysis_result.recommended_option && (
                          <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs sm:text-sm whitespace-nowrap self-start sm:self-auto">
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
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Priorities & Weights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:gap-3">
                  {decision.priorities.map((priority, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded-lg gap-2 sm:gap-0">
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-sm sm:text-base">{priority.name}</span>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{priority.description}</p>
                      </div>
                      <span className="bg-secondary text-secondary-foreground px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap self-start sm:self-auto">
                        Weight: {priority.weight}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analysis Result */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Recommended Option & Confidence */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-primary/10 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold text-primary mb-1 sm:mb-2 text-sm sm:text-base">Recommended Option</h4>
                    <p className="text-base sm:text-lg font-bold break-words">{decision.analysis_result.recommended_option}</p>
                  </div>
                  <div className="bg-secondary p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Confidence Level</h4>
                    <p className="text-base sm:text-lg font-bold">{decision.analysis_result.confidence}%</p>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Summary</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base">
                    {decision.analysis_result.summary}
                  </p>
                </div>

                {/* Detailed Reasoning */}
                {decision.analysis_result.reasoning && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">Detailed Reasoning</h4>
                    <div className="bg-muted p-3 sm:p-4 rounded-lg">
                      <p className="whitespace-pre-wrap text-sm sm:text-base">
                        {decision.analysis_result.reasoning}
                      </p>
                    </div>
                  </div>
                )}

                {/* Option Scores */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm sm:text-base">Option Scores</h4>
                  <div className="space-y-3 sm:space-y-4">
                    {decision.analysis_result.scores.map((score, index) => (
                      <div key={index} className="border rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-2">
                          <span className="font-medium text-sm sm:text-base break-words">{score.option}</span>
                          <span className="bg-primary text-primary-foreground px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap self-start sm:self-auto">
                            Overall Score: {score.overall_score}
                          </span>
                        </div>
                        {score.priority_scores && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
                            {Object.entries(score.priority_scores).map(([priority, priorityScore]) => (
                              <div key={priority} className="text-center p-2 bg-muted/50 rounded">
                                <div className="text-xs text-muted-foreground truncate" title={priority}>
                                  {priority}
                                </div>
                                <div className="font-semibold text-sm">{priorityScore}</div>
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