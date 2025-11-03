import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { decision, result } = await request.json()
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/save-decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        decision_input: decision,
        analysis_result: result,
        user_id: 'demo-user' // In production, use actual user ID from auth
      }),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const savedResult = await response.json()
    return NextResponse.json(savedResult)
  } catch (error) {
    console.error('Error in save-decision API route:', error)
    return NextResponse.json(
      { error: 'Failed to save decision' },
      { status: 500 }
    )
  }
}