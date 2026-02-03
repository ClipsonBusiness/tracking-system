import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkClientAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, customDomain, stripeWebhookSecret, stripeAccountId } = body

    // Get client ID from cookie
    const clientId = await checkClientAuth()
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

    // Update client details
    const updated = await prisma.client.update({
      where: { id: client.id },
      data: {
        ...(name && { name }),
        ...(customDomain !== undefined && { customDomain: customDomain.trim() || null }),
        ...(stripeWebhookSecret !== undefined && {
          stripeWebhookSecret: stripeWebhookSecret?.trim() || null,
          ...(stripeWebhookSecret?.trim() && { stripeConnectedAt: new Date() }),
        }),
        ...(stripeAccountId !== undefined && { stripeAccountId: stripeAccountId?.trim() || null }),
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

