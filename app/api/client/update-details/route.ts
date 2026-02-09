import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, name, customDomain } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      )
    }

    // Find client by access token
    const client = await prisma.client.findUnique({
      where: { clientAccessToken: token },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      )
    }

    // Update client details
    const updated = await prisma.client.update({
      where: { id: client.id },
      data: {
        ...(name && { name }),
        ...(customDomain !== undefined && { customDomain: customDomain.trim() || null }),
      },
    })

    return NextResponse.json({
      success: true,
      client: {
        id: updated.id,
        name: updated.name,
        customDomain: updated.customDomain,
      },
    })
  } catch (error: any) {
    console.error('Error updating client details:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update client details' },
      { status: 500 }
    )
  }
}
