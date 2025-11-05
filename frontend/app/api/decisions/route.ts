import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the client
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to view decisions' },
        { status: 401 }
      )
    }

    // Verify the user and get their ID
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const verifyResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': authHeader,
        'apikey': supabaseKey,
      },
    })

    if (!verifyResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    const userData = await verifyResponse.json()
    const userId = userData.id

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/decisions?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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