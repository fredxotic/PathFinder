"use client"

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { generateDecisionPDF } from '@/lib/pdf-generator'
import { Decision, AnalysisResult } from '@/types'

interface PDFExportProps {
  decision: Decision
  result: AnalysisResult
  className?: string
}

export function PDFExport({ decision, result, className }: PDFExportProps) {
  const handleExport = async () => {
    try {
      await generateDecisionPDF(decision, result)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleExport}
      className={className}
    >
      <Download className="w-4 h-4 mr-2" />
      Export PDF
    </Button>
  )
}