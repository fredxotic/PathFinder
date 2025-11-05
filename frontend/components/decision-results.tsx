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
  decision?: Decision | null; // Make it optional to handle null case
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

export function DecisionResults({ result, decision, onSave, onExport }: DecisionResultsProps) {
  const { toast } = useToast()
  const confidence = calculateConfidence(result.scores.map(s => s.overall_score))

  // Safe data preparation for radar chart
  const radarData = React.useMemo(() => {
    if (!result.scores.length) {
      return []
    }

    const firstScore = result.scores[0]
    if (!firstScore?.priority_scores) {
      return []
    }

    const priorities = Object.keys(firstScore.priority_scores)
    if (priorities.length === 0) {
      return []
    }

    return priorities.map(priority => {
      const dataPoint: any = { priority }
      result.scores.forEach(score => {
        const priorityScore = score.priority_scores?.[priority] || 0
        dataPoint[score.option] = priorityScore
      })
      return dataPoint
    })
  }, [result.scores])

  // Safe data preparation for bar chart
  const barData = React.useMemo(() => {
    return result.scores.map(score => ({
      option: score.option.substring(0, 20),
      score: score.overall_score || 0,
      fullOption: score.option
    }))
  }, [result.scores])

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe']

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
  }

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
                  {result.scores.map((score, index) => (
                    <Radar
                      key={score.option}
                      name={score.option}
                      dataKey={score.option}
                      stroke={colors[index % colors.length]}
                      fill={colors[index % colors.length]}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bar Chart */}
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
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="score" 
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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