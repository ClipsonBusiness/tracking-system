import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const STRIPE_CONNECT_CLIENT_ID = process.env.STRIPE_CONNECT_CLIENT_ID!
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    if (!STRIPE_CONNECT_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Stripe Connect not configured. Please set STRIPE_CONNECT_CLIENT_ID' },
        { status: 500 }
      )
    }

    // Build Stripe OAuth URL
    const redirectUri = `${APP_BASE_URL}/api/stripe/connect/callback`
    const state = Buffer.from(JSON.stringify({ clientId })).toString('base64')
    
    const stripeAuthUrl = new URL('https://connect.stripe.com/oauth/authorize')
    stripeAuthUrl.searchParams.set('response_type', 'code')
    stripeAuthUrl.searchParams.set('client_id', STRIPE_CONNECT_CLIENT_ID)
    stripeAuthUrl.searchParams.set('scope', 'read_write')
    stripeAuthUrl.searchParams.set('redirect_uri', redirectUri)
    stripeAuthUrl.searchParams.set('state', state)

    // Redirect to Stripe
    return NextResponse.redirect(stripeAuthUrl.toString())
  } catch (error: any) {
    console.error('Error in Stripe Connect authorize:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initiate Stripe connection' },
      { status: 500 }
    )
  }
}
