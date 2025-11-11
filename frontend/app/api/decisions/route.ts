// app/api/decisions/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering since we rely on request.headers (Authorization header)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to view decisions' },
        { status: 401 }
      )
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    // The FastAPI endpoint is now secure and gets the user_id from the header.
    const response = await fetch(`${backendUrl}/decisions`, { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader, // FORWARD THE JWT TO FASTAPI
      },
      cache: 'no-store', // <<< FIX: Crucial to bypass Next.js fetch cache for this endpoint
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      
      let errorDetail = 'Failed to fetch decisions'
      try {
        const errorData = JSON.parse(errorText)
        errorDetail = errorData.detail || errorData.error || errorDetail
      } catch (e) {
        // Fallback to generic error text
      }
      
      // CRITICAL IMPROVEMENT: Forward the actual status code from the backend
      return NextResponse.json(
        { error: errorDetail },
        { status: response.status }
      )
    }

    const decisions = await response.json()
    return NextResponse.json(decisions)
  } catch (error) {
    console.error('Error in decisions API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}