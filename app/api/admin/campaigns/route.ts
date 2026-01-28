import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import crypto from 'crypto'

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
    const { clientId, name, destinationUrl, customDomain, commissionPercent, status, enableAffiliateProgram } = body

    if (!name || !destinationUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: name and destinationUrl are required' },
        { status: 400 }
      )
    }

    // Auto-create client from campaign name if no clientId provided
    let finalClientId = clientId
    
    if (!finalClientId) {
      // Create a new client using the campaign name
      // Extract a clean client name from campaign name (remove common suffixes)
      const clientName = name.trim() || 'New Client'
      
      // Check if a client with this name already exists
      let newClient = await prisma.client.findFirst({
        where: { name: clientName },
      })
      
      if (!newClient) {
        // Create new client with the campaign name and auto-generate access token
        const clientToken = crypto.randomBytes(32).toString('hex')
        newClient = await prisma.client.create({
          data: {
            name: clientName,
            clientAccessToken: clientToken,
          },
        })
      } else if (!newClient.clientAccessToken) {
        // If client exists but has no token, generate one
        const clientToken = crypto.randomBytes(32).toString('hex')
        newClient = await prisma.client.update({
          where: { id: newClient.id },
          data: { clientAccessToken: clientToken },
        })
      }
      
      finalClientId = newClient.id
    }

    const campaign = await prisma.campaign.create({
      data: {
        clientId: finalClientId,
        name,
        destinationUrl,
        customDomain: customDomain || null,
        commissionPercent: commissionPercent !== undefined && commissionPercent !== null && commissionPercent !== '' ? parseFloat(commissionPercent.toString()) : null,
        status: status || 'active',
      },
    })

    // Note: Stripe setup is handled by client in their setup form
    // enableAffiliateProgram flag is just for tracking that this campaign supports affiliates

    // Get or generate client access token
    let client = await prisma.client.findUnique({
      where: { id: finalClientId },
      select: {
        clientAccessToken: true,
      },
    })

    // Auto-generate access token if client doesn't have one
    if (!client?.clientAccessToken) {
      const crypto = await import('crypto')
      const token = crypto.randomBytes(32).toString('hex')
      await prisma.client.update({
        where: { id: finalClientId },
        data: { clientAccessToken: token },
      })
      client = { clientAccessToken: token }
    }

    // Generate setup URL for client onboarding
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host') || 'localhost:3000'
    const baseUrl = process.env.APP_BASE_URL || `${protocol}://${host}`
    
    const setupUrl = client?.clientAccessToken
      ? `${baseUrl}/client/setup/${client.clientAccessToken}`
      : null
    
    const portalUrl = client?.clientAccessToken
      ? `${baseUrl}/client/dashboard?token=${client.clientAccessToken}`
      : null

    return NextResponse.json({
      ...campaign,
      clientPortalUrl: portalUrl,
      clientSetupUrl: setupUrl,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

