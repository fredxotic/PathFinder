// frontend/app/api/decisions/route.ts (MODIFIED)

import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering since we rely on request.headers (Authorization header)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // ... (rest of the code remains the same)
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to view decisions' },
        { status: 401 }
      )
    }
    // We no longer try to verify the user here. We trust the browser's 
    // fetch mechanism and let the FastAPI backend validate the JWT.
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    // The FastAPI endpoint is now secure and gets the user_id from the header.
    const response = await fetch(`${backendUrl}/decisions`, { // NO user_id QUERY PARAMETER
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader, // FORWARD THE JWT TO FASTAPI
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch decisions' },
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