// frontend/components/decision-matrix.tsx
"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Decision, AnalysisResult } from '@/types'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DecisionMatrixProps {
  decision: Decision
  result: AnalysisResult
}

// Utility to determine color based on score (0-100)
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 65) return 'text-yellow-600 dark:text-yellow-400'
  if (score >= 50) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

export function DecisionMatrix({ decision, result }: DecisionMatrixProps) {
  // Extract all unique priority names for the table headers
  const priorityNames = decision.priorities.map(p => p.name)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Decision Matrix: Priority Alignment</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                {/* Sticky Left Column for Options */}
                <th className="sticky left-0 bg-muted/50 p-3 text-left font-semibold min-w-[150px] z-10">Option</th>
                <th className="p-3 text-center font-semibold min-w-[80px]">Overall Score</th>
                {priorityNames.map((name, index) => (
                  <th key={index} className="p-3 text-center font-semibold min-w-[100px] border-l">
                    <span className="block truncate">{name}</span>
                    <span className="text-xs text-muted-foreground font-normal">({decision.priorities.find(p => p.name === name)?.weight}/10)</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.scores.map((score, optionIndex) => (
                <tr 
                  key={optionIndex} 
                  className={cn(
                    "border-b",
                    score.option === result.recommended_option ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent/50'
                  )}
                >
                  {/* Option Name (Sticky Left) */}
                  <td className="sticky left-0 bg-background/95 p-3 font-medium border-r border-border min-w-[150px] z-10">
                    <div className="flex items-center gap-2">
                        {score.option}
                        {score.option === result.recommended_option && (
                            <span className="text-xs font-bold text-primary ml-1"> (Recommended)</span>
                        )}
                    </div>
                  </td>
                  
                  {/* Overall Score */}
                  <td className="p-3 text-center font-bold min-w-[80px] border-r">
                    <span className={getScoreColor(score.overall_score)}>{score.overall_score}</span>
                  </td>
                  
                  {/* Priority Scores */}
                  {priorityNames.map((name, priorityIndex) => {
                    const priorityScore = score.priority_scores?.[name]
                    return (
                      <td 
                        key={priorityIndex} 
                        className="p-3 text-center min-w-[100px] border-l"
                      >
                        <span className={cn(getScoreColor(priorityScore || 0), 'font-medium')}>
                          {priorityScore !== undefined ? Math.round(priorityScore) : 'N/A'}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  )
}