// frontend/app/api/decisions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to delete decisions' },
        { status: 401 }
      )
    }

    const decisionId = params.id
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    // Make sure to include the user_id in the backend request
    const response = await fetch(`${backendUrl}/decisions/${decisionId}?user_id=${session.user.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      
      // If backend returns 404, it means the decision doesn't exist or doesn't belong to this user
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Decision not found or you do not have permission to delete it' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to delete decision' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in delete decision API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to view decisions' },
        { status: 401 }
      )
    }

    const decisionId = params.id
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/decisions/${decisionId}?user_id=${session.user.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch decision' },
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