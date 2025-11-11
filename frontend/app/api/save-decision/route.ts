// frontend/app/api/save-decision/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Get the authorization header from the client request
    const authHeader = request.headers.get('Authorization') // <--- Correctly gets token directly
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing Authorization header' },
        { status: 401 }
      )
    }

    // Validate required fields with better error messages
    if (!body.decision_input && !body.decision) {
      return NextResponse.json(
        { error: 'Missing required field: decision_input' },
        { status: 400 }
      )
    }

    if (!body.analysis_result && !body.result) {
      return NextResponse.json(
        { error: 'Missing required field: analysis_result' },
        { status: 400 }
      )
    }

    // Handle both field naming conventions for backward compatibility
    const decisionInput = body.decision_input || body.decision
    const analysisResult = body.analysis_result || body.result

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/save-decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader, // Forward the JWT token
      },
      body: JSON.stringify({
        decision_input: decisionInput,
        analysis_result: analysisResult,
        // user_id is NOT included here - backend extracts it from JWT
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })

      // Try to parse backend error message
      try {
        const errorData = JSON.parse(errorText)
        const errorMessage = errorData.detail || errorData.error || 'Failed to save decision'
        return NextResponse.json({ error: errorMessage }, { status: response.status })
      } catch {
        // If backend returns non-JSON error, provide generic message based on status
        if (response.status === 401) {
          return NextResponse.json({ error: 'Unauthorized - Please sign in again' }, { status: 401 })
        } else if (response.status === 403) {
          return NextResponse.json({ error: 'Forbidden - You do not have permission to save this decision' }, { status: 403 })
        } else if (response.status === 422) {
          return NextResponse.json({ error: 'Invalid decision data format' }, { status: 422 })
        } else {
          return NextResponse.json({ error: 'Failed to save decision' }, { status: response.status })
        }
      }
    }

    const savedResult = await response.json()
    
    return NextResponse.json(savedResult, {
      status: 201, // Use 201 Created for successful resource creation
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
    
  } catch (error) {
    console.error('Error in save-decision API route:', error)
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}