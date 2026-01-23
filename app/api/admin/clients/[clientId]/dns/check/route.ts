import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  await requireAdminAuth()

  try {
    const client = await prisma.client.findUnique({
      where: { id: params.clientId },
      select: {
        id: true,
        customDomain: true,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Check if custom domain is configured
    // For now, we consider DNS configured if customDomain exists
    // In the future, you could add a separate DNS configuration check
    const dnsConfigured = !!client.customDomain

    return NextResponse.json({
      dnsConfigured,
      customDomain: client.customDomain,
      message: dnsConfigured 
        ? 'DNS is configured for this client'
        : 'DNS configuration required',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check DNS configuration' },
      { status: 500 }
    )
  }
}

