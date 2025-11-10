import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const decisionData = await request.json()

    // Enhanced validation
    if (!decisionData.title || !decisionData.context || !decisionData.options || !decisionData.priorities) {
      return NextResponse.json(
        { error: 'Missing required fields: title, context, options, and priorities are required' },
        { status: 400 }
      )
    }

    if (decisionData.options.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required' },
        { status: 400 }
      )
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    console.log(`🔄 Sending analysis request to backend: ${decisionData.title}`)
    
    const response = await fetch(`${backendUrl}/analyze-decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(decisionData),
      signal: AbortSignal.timeout(60000) // 60 second timeout
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      let errorDetail = 'Backend service unavailable'
      try {
        const errorText = await response.text()
        errorDetail = errorText || `HTTP ${response.status}`
      } catch {
        // Use default error detail
      }
      
      console.error(`❌ Backend error (${responseTime}ms):`, errorDetail)
      
      return NextResponse.json(
        { 
          error: 'Analysis service temporarily unavailable',
          detail: 'Please try again in a few moments'
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log(`✅ Analysis completed successfully (${responseTime}ms)`)
    
    return NextResponse.json(result)
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    console.error(`💥 Error in analyze-decision API route (${responseTime}ms):`, error)
    
    if (error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          error: 'Analysis timeout',
          detail: 'The analysis is taking longer than expected. Please try again.'
        },
        { status: 504 }
      )
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Backend service unavailable',
          detail: 'Cannot connect to analysis service. Please check if the backend is running.'
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        detail: 'An unexpected error occurred. Please try again.'
      },
      { status: 500 }
    )
  }
}