"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Download, Share2 } from 'lucide-react'
import { AnalysisResult } from '@/types'
import { calculateConfidence } from '@/lib/utils'
import { PDFExport } from '@/components/pdf-export'
import React from 'react'
import { Decision } from '@/types'
import { useToast } from '@/components/ui/toast'

interface DecisionResultsProps {
  result: AnalysisResult
  decision?: Decision | null
  onSave?: () => void
  onExport?: () => void
}

// Fix the Tooltip type issue by creating a custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
        <p className="font-semibold">{label}</p>
        <p className="text-primary">Score: {payload[0].value}</p>
      </div>
    )
  }
  return null
}

const RadarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function DecisionResults({ result, decision, onSave, onExport }: DecisionResultsProps) {
  const { toast } = useToast()
  const confidence = calculateConfidence(result.scores.map(s => s.overall_score))

  // FIXED: Safe data preparation for radar chart
  const radarData = React.useMemo(() => {
    if (!result.scores.length) {
      return []
    }

    // Get all unique priorities from all options
    const allPriorities = new Set<string>()
    result.scores.forEach(score => {
      if (score.priority_scores) {
        Object.keys(score.priority_scores).forEach(priority => {
          allPriorities.add(priority)
        })
      }
    })

    if (allPriorities.size === 0) {
      return []
    }

    // Create data points for each priority
    return Array.from(allPriorities).map(priority => {
      const dataPoint: any = { priority }
      result.scores.forEach(score => {
        // Use the option name as key, but sanitize it for Recharts
        const optionKey = score.option.replace(/[^a-zA-Z0-9]/g, '_')
        dataPoint[optionKey] = score.priority_scores?.[priority] || 0
        // Also store the original option name for tooltip
        dataPoint[`${optionKey}_name`] = score.option
      })
      return dataPoint
    })
  }, [result.scores])

  // FIXED: Safe data preparation for bar chart - ensure we only show actual options
  const barData = React.useMemo(() => {
    return result.scores.map(score => ({
      option: score.option.length > 20 ? `${score.option.substring(0, 20)}...` : score.option,
      score: score.overall_score || 0,
      fullOption: score.option
    }))
  }, [result.scores])

  // FIXED: Colors array with enough colors for up to 5 options
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe']

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
  }

  // Debug logging to help identify the issue
  React.useEffect(() => {
    console.log('Result scores:', result.scores)
    console.log('Radar data:', radarData)
    console.log('Bar data:', barData)
  }, [result.scores, radarData, barData])

  // If no valid data, show simplified view
  if (!result.scores.length || radarData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg font-semibold text-primary">
                Recommended: {result.recommended_option}
              </p>
              <p className="whitespace-pre-wrap">{result.summary}</p>
              {result.reasoning && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Detailed Reasoning:</h4>
                  <p className="whitespace-pre-wrap">{result.reasoning}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave}>
                Save Decision
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Confidence Meter */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Confidence Level</h3>
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full border-8 border-muted relative">
                  <div
                    className="absolute inset-0 rounded-full border-8 border-primary transition-all duration-1000 ease-out"
                    style={{
                      clipPath: `conic-gradient(transparent 0%, transparent ${100 - confidence}%, currentColor ${100 - confidence}%, currentColor 100%)`,
                      transform: 'rotate(-90deg)',
                    }}
                  />
                  <div className="absolute inset-4 rounded-full bg-background flex items-center justify-center">
                    <span className="text-2xl font-bold">{confidence}%</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {confidence > 70 ? 'High confidence in analysis' :
                 confidence > 40 ? 'Moderate confidence in analysis' :
                 'Consider gathering more information'}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Priority Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="priority" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  {result.scores.map((score, index) => {
                    // Sanitize the option name for use as dataKey
                    const optionKey = score.option.replace(/[^a-zA-Z0-9]/g, '_')
                    return (
                      <Radar
                        key={score.option}
                        name={score.option}
                        dataKey={optionKey}
                        stroke={colors[index % colors.length]}
                        fill={colors[index % colors.length]}
                        fillOpacity={0.3}
                      />
                    )
                  })}
                  <Tooltip content={<RadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                Comparing {result.scores.length} option(s) across {radarData.length} priority areas
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bar Chart - FIXED: This should now only show actual options */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Overall Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis 
                    dataKey="option" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    content={<CustomTooltip />}
                    formatter={(value) => [`${value}`, 'Score']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullOption || label
                      }
                      return label
                    }}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                Showing {barData.length} option(s)
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced AI Summary with new analysis fields */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recommended Option */}
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <h3 className="font-semibold text-primary mb-2">🎯 Recommended Option</h3>
              <p className="text-lg font-bold">{result.recommended_option}</p>
            </div>

            {/* Summary */}
            <div>
              <h4 className="font-semibold mb-2">📊 Executive Summary</h4>
              <p className="whitespace-pre-wrap text-muted-foreground">{result.summary}</p>
            </div>

            {/* Detailed Reasoning */}
            {result.reasoning && (
              <div>
                <h4 className="font-semibold mb-2">🔍 Detailed Analysis</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{result.reasoning}</p>
                </div>
              </div>
            )}

            {/* Key Insights */}
            {(result as any).key_insights && (result as any).key_insights.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">💡 Key Insights</h4>
                <ul className="space-y-2">
                  {(result as any).key_insights.map((insight: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {(result as any).next_steps && (result as any).next_steps.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">🚀 Next Steps</h4>
                <ul className="space-y-2">
                  {(result as any).next_steps.map((step: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Option Details */}
            <div>
              <h4 className="font-semibold mb-4">📈 Option Breakdown</h4>
              <div className="grid gap-4">
                {result.scores.map((score, index) => (
                  <div key={score.option} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium">{score.option}</h5>
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                        Score: {score.overall_score}
                      </span>
                    </div>
                    
                    {/* Strengths & Weaknesses */}
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {(score as any).strengths && (score as any).strengths.length > 0 && (
                        <div>
                          <span className="font-medium text-green-600">✅ Strengths:</span>
                          <ul className="mt-1 space-y-1">
                            {(score as any).strengths.map((strength: string, i: number) => (
                              <li key={i}>• {strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {(score as any).weaknesses && (score as any).weaknesses.length > 0 && (
                        <div>
                          <span className="font-medium text-orange-600">⚠️ Weaknesses:</span>
                          <ul className="mt-1 space-y-1">
                            {(score as any).weaknesses.map((weakness: string, i: number) => (
                              <li key={i}>• {weakness}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave}>
                Save Decision
              </Button>
              {decision && (
                <PDFExport decision={decision} result={result} />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}