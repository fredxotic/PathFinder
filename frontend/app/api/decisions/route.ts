// frontend/app/api/decisions/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id') || 'demo-user'
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/decisions?user_id=${userId}`)

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const decisions = await response.json()
    return NextResponse.json(decisions)
  } catch (error) {
    console.error('Error in decisions API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch decisions' },
      { status: 500 }
    )
  }
}