import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customDomain, dnsScreenshot } = body
    const authHeader = request.headers.get('authorization')
    
    // Get client from token in query or body
    const url = new URL(request.url)
    const token = url.searchParams.get('token') || body.token

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

    if (!customDomain) {
      return NextResponse.json(
        { error: 'Custom domain is required' },
        { status: 400 }
      )
    }

    // Update client with custom domain and screenshot
    const updated = await prisma.client.update({
      where: { id: client.id },
      data: {
        customDomain: customDomain.trim(),
        dnsScreenshot: dnsScreenshot || null,
      },
    })

    return NextResponse.json({
      success: true,
      client: updated,
      message: 'DNS configuration saved successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save DNS configuration' },
      { status: 500 }
    )
  }
}
