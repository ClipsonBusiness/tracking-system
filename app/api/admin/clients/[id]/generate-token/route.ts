import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await requireAdminAuth()

  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex')

    // Update client with access token
    await prisma.client.update({
      where: { id: params.id },
      data: {
        clientAccessToken: token,
      },
    })

    // Get base URL from request headers (works in production)
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host') || 'localhost:3000'
    const baseUrl = process.env.APP_BASE_URL || `${protocol}://${host}`
    
    return NextResponse.json({
      token,
      dashboardUrl: `${baseUrl}/client/dashboard?token=${token}`,
      getStartedUrl: `${baseUrl}/client/get-started?token=${token}`,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate token' },
      { status: 500 }
    )
  }
}

