import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function GET() {
  await requireAdminAuth()

  try {
    const campaigns = await prisma.campaign.findMany({
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(campaigns)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  await requireAdminAuth()

  try {
    const body = await request.json()
    const { clientId, name, destinationUrl, customDomain, status } = body

    if (!clientId || !name || !destinationUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, name, and destinationUrl are required' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.create({
      data: {
        clientId,
        name,
        destinationUrl,
        customDomain: customDomain || null,
        status: status || 'active',
      },
    })

    return NextResponse.json(campaign)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

