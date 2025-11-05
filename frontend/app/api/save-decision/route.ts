// frontend/app/api/save-decision/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { decision, result, user_id } = await request.json()
    
    // Validate that we have a user_id
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/save-decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        decision_input: decision,
        analysis_result: result,
        user_id: user_id // Use the actual user_id from the request
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      return NextResponse.json(
        { error: 'Failed to save decision' },
        { status: response.status }
      )
    }

    const savedResult = await response.json()
    return NextResponse.json(savedResult)
  } catch (error) {
    console.error('Error in save-decision API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}