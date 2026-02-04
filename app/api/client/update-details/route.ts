import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkClientAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, name, customDomain, stripeWebhookSecret, stripeAccountId } = body

    let clientId: string | null = null

    // Try token-based authentication first (for setup pages)
    if (token) {
      const clientByToken = await prisma.client.findUnique({
        where: { clientAccessToken: token },
        select: { id: true },
      })
      if (clientByToken) {
        clientId = clientByToken.id
      }
    }

    // Fallback to cookie-based authentication
    if (!clientId) {
      clientId = await checkClientAuth()
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Find client by ID
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Update client details (safely handle null/undefined values)
    const updated = await prisma.client.update({
      where: { id: client.id },
      data: {
        ...(name && { name }),
        ...(customDomain !== undefined && { 
          customDomain: customDomain && typeof customDomain === 'string' ? customDomain.trim() || null : null 
        }),
        ...(stripeWebhookSecret !== undefined && {
          stripeWebhookSecret: stripeWebhookSecret && typeof stripeWebhookSecret === 'string' 
            ? stripeWebhookSecret.trim() || null 
            : null,
          ...(stripeWebhookSecret && typeof stripeWebhookSecret === 'string' && stripeWebhookSecret.trim() && { 
            stripeConnectedAt: new Date() 
          }),
        }),
        ...(stripeAccountId !== undefined && { 
          stripeAccountId: stripeAccountId && typeof stripeAccountId === 'string' 
            ? stripeAccountId.trim() || null 
            : null 
        }),
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

