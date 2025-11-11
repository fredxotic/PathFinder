// app/api/decisions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering since we rely on request.headers (Authorization header)
export const dynamic = 'force-dynamic'

// DELETE is used for secure deletion of a single decision.
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decisionId = params.id
    
    // Validate decision ID
    if (!decisionId || typeof decisionId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid decision ID' },
        { status: 400 }
      )
    }
    
    // Get the Authorization header directly from the incoming client request.
    const authHeader = request.headers.get('Authorization') // <--- Correctly gets token directly
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing Authorization header' },
        { status: 401 }
      )
    }
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    // Pass the original client JWT directly to the FastAPI backend.
    const response = await fetch(`${backendUrl}/decisions/${decisionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader, // FORWARD THE CLIENT'S JWT
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      
      let errorDetail = 'Failed to delete decision'
      try {
        const errorData = JSON.parse(errorText)
        errorDetail = errorData.detail || errorData.error || errorDetail
      } catch (e) {
        // Fallback to generic error text
      }
      
      // Return specific error messages based on status
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Decision not found or already deleted' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: errorDetail },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in delete decision API route:', error)
    // If we reach here, it's a true internal server error.
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET is used for fetching a single decision.
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decisionId = params.id
    
    // Validate decision ID
    if (!decisionId || typeof decisionId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid decision ID' },
        { status: 400 }
      )
    }
    
    // CRITICAL FIX: Get the Authorization header directly from the incoming client request.
    const authHeader = request.headers.get('Authorization') // <--- Correctly gets token directly
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing Authorization header' },
        { status: 401 }
      )
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    // Pass the original client JWT directly to the FastAPI backend.
    const response = await fetch(`${backendUrl}/decisions/${decisionId}`, { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader, // FORWARD THE CLIENT'S JWT
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      
      let errorDetail = 'Failed to fetch decision'
      try {
        const errorData = JSON.parse(errorText)
        errorDetail = errorData.detail || errorData.error || errorDetail
      } catch (e) {
        // Fallback to generic error text
      }
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Decision not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: errorDetail },
        { status: response.status }
      )
    }

    const decision = await response.json()
    return NextResponse.json(decision)
  } catch (error) {
    console.error('Error in get decision API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}