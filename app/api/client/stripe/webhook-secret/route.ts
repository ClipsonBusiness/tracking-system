import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, webhookSecret } = body

    if (!clientId || !webhookSecret) {
      return NextResponse.json(
        { error: 'Client ID and webhook secret are required' },
        { status: 400 }
      )
    }

    // Verify webhook secret format
    if (!webhookSecret.startsWith('whsec_')) {
      return NextResponse.json(
        { error: 'Invalid webhook secret format. Must start with whsec_' },
        { status: 400 }
      )
    }

    // Update client with webhook secret
    const client = await prisma.client.update({
      where: { id: clientId },
      data: {
        stripeWebhookSecret: webhookSecret,
        stripeConnectedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook secret saved successfully',
    })
  } catch (error: any) {
    console.error('Error saving webhook secret:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save webhook secret' },
      { status: 500 }
    )
  }
}

