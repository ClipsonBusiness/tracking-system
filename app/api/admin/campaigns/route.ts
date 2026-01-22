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

    if (!name || !destinationUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: name and destinationUrl are required' },
        { status: 400 }
      )
    }

    // Auto-create or use default client if no clientId provided
    let finalClientId = clientId
    
    if (!finalClientId) {
      // Get or create a default client
      let defaultClient = await prisma.client.findFirst({
        where: { name: 'Default Client' },
      })
      
      if (!defaultClient) {
        defaultClient = await prisma.client.create({
          data: {
            name: 'Default Client',
          },
        })
      }
      
      finalClientId = defaultClient.id
    }

    const campaign = await prisma.campaign.create({
      data: {
        clientId: finalClientId,
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

