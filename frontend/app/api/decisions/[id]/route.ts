import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id') || 'demo-user'
    const decisionId = params.id
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/decisions/${decisionId}?user_id=${userId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in delete decision API route:', error)
    return NextResponse.json(
      { error: 'Failed to delete decision' },
      { status: 500 }
    )
  }
}