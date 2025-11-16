// frontend/lib/pdf-generator.ts
import jsPDF from 'jspdf'
import { AnalysisResult, Decision } from '@/types'

// PDF settings
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN = 15
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN
const LINE_HEIGHT = 5
const FONT_SIZE = {
  TITLE: 24,
  SECTION: 14,
  SUBSECTION: 12,
  NORMAL: 10,
  SMALL: 8
}

// Color scheme
const COLORS = {
  primary: [41, 128, 185] as [number, number, number],
  secondary: [108, 117, 125] as [number, number, number],
  lightBg: [248, 249, 250] as [number, number, number],
  lightBlue: [235, 245, 251] as [number, number, number],
  border: [222, 226, 230] as [number, number, number],
  text: {
    primary: [33, 37, 41] as [number, number, number],
    secondary: [73, 80, 87] as [number, number, number],
    white: [255, 255, 255] as [number, number, number]
  }
}

// Draw section box with colored header
function drawSectionBox(pdf: jsPDF, yStart: number, title: string, contentHeight: number): number {
  const headerHeight = 8
  const padding = 4
  const boxHeight = contentHeight + headerHeight + 2 * padding

  // Header Bar
  pdf.setFillColor(...COLORS.primary)
  pdf.rect(MARGIN, yStart, CONTENT_WIDTH, headerHeight, 'F')

  // Content Box
  pdf.setDrawColor(...COLORS.border)
  pdf.setFillColor(255, 255, 255)
  pdf.rect(MARGIN, yStart + headerHeight, CONTENT_WIDTH, boxHeight - headerHeight, 'FD')

  // Section Title
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(FONT_SIZE.SUBSECTION)
  pdf.setTextColor(...COLORS.text.white)
  pdf.text(title, MARGIN + padding, yStart + headerHeight - padding + 0.5)

  // Reset
  pdf.setTextColor(...COLORS.text.primary)
  pdf.setFontSize(FONT_SIZE.NORMAL)
  pdf.setFont('helvetica', 'normal')

  return yStart + boxHeight + 8
}

// Helper to determine the optimal column width dynamically for the matrix table
const calculateColumnWidths = (decision: Decision): { totalWidth: number, colWidths: number[] } => {
  const numPriorities = decision.priorities.length
  
  // Fixed widths for non-priority columns
  const optionWidth = 45 // 45mm for Option Name
  const overallScoreWidth = 20 // 20mm for Overall Score
  
  const remainingWidth = CONTENT_WIDTH - optionWidth - overallScoreWidth
  const priorityWidth = remainingWidth / numPriorities
  
  // Widths array: [Option, Overall Score, Priority 1, Priority 2, ...]
  const colWidths = [optionWidth, overallScoreWidth, ...Array(numPriorities).fill(priorityWidth)]
  
  return { totalWidth: CONTENT_WIDTH, colWidths }
}


export async function generateDecisionPDF(decision: Decision, result: AnalysisResult): Promise<void> {
  const pdf = new jsPDF()
  let yPosition = MARGIN + 10

  // --- 1. HEADER ---
  pdf.setFontSize(FONT_SIZE.TITLE)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(...COLORS.primary)
  pdf.text('PathFinder', MARGIN, yPosition)
  
  pdf.setFontSize(FONT_SIZE.SECTION)
  pdf.setTextColor(...COLORS.text.primary)
  pdf.text(`Decision: ${decision.title}`, MARGIN, yPosition + 8)
  yPosition += 25
  
  // Recommendation Box
  const confidence = Math.round(result.confidence)
  const recoBoxWidth = 75
  const recoBoxX = PAGE_WIDTH - MARGIN - recoBoxWidth
  
  pdf.setFillColor(...COLORS.lightBg)
  pdf.rect(recoBoxX, MARGIN + 5, recoBoxWidth, 18, 'F')
  pdf.setDrawColor(...COLORS.border)
  pdf.rect(recoBoxX, MARGIN + 5, recoBoxWidth, 18)
  
  pdf.setFontSize(FONT_SIZE.NORMAL)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...COLORS.text.secondary)
  pdf.text('Recommended Option', recoBoxX + 3, MARGIN + 10)
  
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(...COLORS.primary)
  pdf.text(result.recommended_option, recoBoxX + 3, MARGIN + 16)
  
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(FONT_SIZE.SMALL)
  pdf.setTextColor(...COLORS.secondary)
  pdf.text(`Confidence: ${confidence}%`, recoBoxX + 3, MARGIN + 21)

  // --- 2. CONTEXT & PRIORITIES ---
  const contextLines = pdf.splitTextToSize(decision.context, CONTENT_WIDTH - 8)
  const contextHeight = contextLines.length * LINE_HEIGHT
  const prioritiesHeight = decision.priorities.length * (LINE_HEIGHT + 6)
  const boxContentHeight = contextHeight + prioritiesHeight + 20
  
  yPosition = drawSectionBox(pdf, yPosition, 'Decision Context & Priorities', boxContentHeight)
  
  let contentY = yPosition - boxContentHeight - 8
  
  // Context
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(...COLORS.text.secondary)
  pdf.text('Context:', MARGIN + 4, contentY)
  contentY += LINE_HEIGHT
  
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...COLORS.text.primary)
  pdf.text(contextLines as string[], MARGIN + 4, contentY)
  contentY += contextHeight + 8

  // Priorities
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(...COLORS.text.secondary)
  pdf.text('Priorities:', MARGIN + 4, contentY)
  contentY += LINE_HEIGHT
  
  pdf.setFont('helvetica', 'normal')
  decision.priorities.forEach((priority) => {
    pdf.setTextColor(...COLORS.text.primary)
    pdf.text(`• ${priority.name} `, MARGIN + 4, contentY)
    
    const nameWidth = pdf.getTextWidth(`• ${priority.name} `)
    pdf.setTextColor(...COLORS.secondary)
    pdf.text(`(${priority.weight}/10)`, MARGIN + 4 + nameWidth, contentY)
    
    pdf.setFontSize(FONT_SIZE.SMALL)
    pdf.setTextColor(...COLORS.text.secondary)
    const desc = priority.description.length > 70 
      ? priority.description.substring(0, 70) + '...'
      : priority.description
    pdf.text(desc, MARGIN + 4, contentY + 4)
    
    pdf.setFontSize(FONT_SIZE.NORMAL)
    contentY += LINE_HEIGHT + 6
  })

  // --- 3. DECISION MATRIX ---
  // Fixed column widths for proper table layout
  const optionColWidth = 45
  const overallColWidth = 20
  const priorityColWidth = (CONTENT_WIDTH - optionColWidth - overallColWidth) / decision.priorities.length
  const colWidths = [optionColWidth, overallColWidth, ...Array(decision.priorities.length).fill(priorityColWidth)]
  
  const headerHeight = 10
  const rowHeight = 8
  const tableContentHeight = (result.scores.length * rowHeight) + headerHeight + 10
  
  if (yPosition + tableContentHeight > PAGE_HEIGHT - MARGIN) {
    pdf.addPage()
    yPosition = MARGIN + 5
  }
  
  yPosition = drawSectionBox(pdf, yPosition, 'Decision Matrix: Priority Scores (0-100)', tableContentHeight)
  contentY = yPosition - tableContentHeight - 8
  
  const startY = contentY
  const endY = startY + tableContentHeight - 5

  // Table Header
  pdf.setFontSize(FONT_SIZE.SMALL)
  pdf.setFillColor(...COLORS.lightBg)
  pdf.rect(MARGIN + 4, contentY, CONTENT_WIDTH - 8, headerHeight, 'F')
  pdf.setTextColor(...COLORS.text.secondary)
  pdf.setFont('helvetica', 'bold')
  
  // Draw headers with proper abbreviations
  let currentX = MARGIN + 4
  
  // Option header
  pdf.text('Option', currentX + 2, contentY + headerHeight / 2 + 1, { baseline: 'middle' } as any)
  currentX += optionColWidth
  
  // Overall header
  pdf.text('Overall', currentX + overallColWidth / 2, contentY + headerHeight / 2 + 1, 
    { align: 'center', baseline: 'middle' } as any)
  currentX += overallColWidth
  
  // Priority headers with proper abbreviations
  decision.priorities.forEach((priority) => {
    let headerText = priority.name
    // Smart abbreviations for common priority names
    if (priority.name === 'Career Growth') headerText = 'Career'
    else if (priority.name === 'Work-Life Balance') headerText = 'Work-Life'
    else if (priority.name === 'Financial Stability') headerText = 'Financial'
    else if (priority.name === 'Personal Fulfillment') headerText = 'Personal'
    else if (priority.name === 'Learning Opportunity') headerText = 'Learning'
    else if (headerText.length > 8) headerText = headerText.substring(0, 8) + '.'
    
    pdf.text(headerText, currentX + priorityColWidth / 2, contentY + headerHeight / 2 + 1, 
      { align: 'center', baseline: 'middle' } as any)
    
    currentX += priorityColWidth
  })
  
  // Header borders
  pdf.setLineWidth(0.2)
  pdf.line(MARGIN + 4, startY, PAGE_WIDTH - MARGIN - 4, startY)
  pdf.line(MARGIN + 4, startY + headerHeight, PAGE_WIDTH - MARGIN - 4, startY + headerHeight)

  contentY += headerHeight

  // --- Draw Vertical Lines for Grid (FIX) ---
  pdf.setDrawColor(...COLORS.border)
  let lineX = MARGIN + 4; 
  
  // Line after Option Name column
  lineX += optionColWidth
  pdf.line(lineX, startY, lineX, endY) 
  
  // Line after Overall Score column
  lineX += overallColWidth
  pdf.line(lineX, startY, lineX, endY) 
  
  // Lines between Priority columns
  for (let i = 0; i < decision.priorities.length - 1; i++) {
    lineX += priorityColWidth
    pdf.line(lineX, startY, lineX, endY) 
  }


  // Data Rows
  pdf.setFontSize(FONT_SIZE.NORMAL)
  result.scores.forEach((score) => {
    if (contentY + rowHeight > PAGE_HEIGHT - MARGIN) {
      pdf.addPage()
      contentY = MARGIN + 10
    }

    currentX = MARGIN + 4
    
    // Highlight recommended option
    const isRecommended = score.option === result.recommended_option
    if (isRecommended) {
      pdf.setFillColor(...COLORS.lightBlue)
      pdf.rect(MARGIN + 4, contentY - rowHeight * 0.3, CONTENT_WIDTH - 8, rowHeight, 'F')
    }

    // Row separator
    pdf.setDrawColor(...COLORS.border)
    pdf.line(MARGIN + 4, contentY - rowHeight * 0.3, PAGE_WIDTH - MARGIN - 4, contentY - rowHeight * 0.3)

    // Option Column
    pdf.setFont('helvetica', isRecommended ? 'bold' : 'normal')
    pdf.setTextColor(...COLORS.text.primary)
    const optionText = score.option.length > 20 
      ? score.option.substring(0, 20) + '...'
      : score.option
    pdf.text(optionText, currentX + 2, contentY + rowHeight / 2 - 1, { baseline: 'middle' } as any)
    currentX += optionColWidth
    
    // Overall Score
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...COLORS.primary)
    pdf.text(score.overall_score.toString(), currentX + overallColWidth / 2, contentY + rowHeight / 2 - 1, 
      { align: 'center', baseline: 'middle' } as any)
    currentX += overallColWidth
    
    // Priority Scores
    pdf.setFont('helvetica', 'normal')
    decision.priorities.forEach((priority) => {
      const priorityScore = Math.round(score.priority_scores?.[priority.name] || 0)
      pdf.setTextColor(...COLORS.secondary)
      pdf.text(priorityScore.toString(), currentX + priorityColWidth / 2, contentY + rowHeight / 2 - 1, 
        { align: 'center', baseline: 'middle' } as any)
      currentX += priorityColWidth
    })
    
    contentY += rowHeight
  })
  
  // Final bottom line
  pdf.line(MARGIN + 4, contentY - rowHeight * 0.3, PAGE_WIDTH - MARGIN - 4, contentY - rowHeight * 0.3)
  yPosition = contentY + 10

  // --- 4. AI ANALYSIS NARRATIVE ---
  const narrativeSections = [
    { title: 'EXECUTIVE SUMMARY', content: result.summary },
    { title: 'DETAILED REASONING', content: result.reasoning },
    { title: 'KEY INSIGHTS', content: result.key_insights.map(i => `• ${i}`).join('\n') },
    { title: 'NEXT STEPS', content: result.next_steps.map(s => `• ${s}`).join('\n') },
    { title: 'COMPARATIVE ANALYSIS', content: result.comparative_analysis }
  ]

  const combinedNarrative = narrativeSections.map(section => 
    `${section.title}:\n${section.content}`
  ).join('\n\n')

  const narrativeLines = pdf.splitTextToSize(combinedNarrative, CONTENT_WIDTH - 8)
  const narrativeHeight = narrativeLines.length * LINE_HEIGHT + 20

  if (yPosition + narrativeHeight > PAGE_HEIGHT - MARGIN) {
    pdf.addPage()
    yPosition = MARGIN + 5
  }

  yPosition = drawSectionBox(pdf, yPosition, 'AI Analysis & Recommendations', narrativeHeight)
  contentY = yPosition - narrativeHeight - 8

  // Narrative content
  let currentNarrativeY = contentY

  narrativeLines.forEach((line: string) => {
    if (line.match(/^[A-Z\s]+:$/)) {
      // Section header
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(FONT_SIZE.SUBSECTION)
      pdf.setTextColor(...COLORS.primary)
    } else if (line.trim().startsWith('•')) {
      // Bullet points
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(FONT_SIZE.NORMAL)
      pdf.setTextColor(...COLORS.text.primary)
    } else {
      // Regular content
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(FONT_SIZE.NORMAL)
      pdf.setTextColor(...COLORS.text.primary)
    }

    pdf.text(line, MARGIN + 4, currentNarrativeY)
    currentNarrativeY += LINE_HEIGHT
  })

  // --- 5. FOOTER ---
  pdf.setFontSize(FONT_SIZE.SMALL)
  pdf.setTextColor(...COLORS.secondary)
  pdf.setFont('helvetica', 'normal')
  pdf.text(
    `Generated by PathFinder on ${new Date().toLocaleDateString()}`,
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - MARGIN + 5,
    { align: 'center' } as any
  )

  // Save PDF
  const filename = `pathfinder-${decision.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
  pdf.save(filename)
}