import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Decode state to get clientId first (needed for error redirects)
    let clientId: string | null = null
    try {
      if (state) {
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString())
        clientId = decodedState.clientId
      }
    } catch {
      // Will handle below
    }

    // Helper function to get redirect URL with token
    const getRedirectUrl = async (path: string, params?: Record<string, string>) => {
      if (clientId) {
        const client = await prisma.client.findUnique({
          where: { id: clientId },
          select: { clientAccessToken: true },
        })
        if (client?.clientAccessToken) {
          const queryParams = new URLSearchParams({ token: client.clientAccessToken, ...params })
          return `${APP_BASE_URL}${path}?${queryParams.toString()}`
        }
      }
      const queryParams = params ? new URLSearchParams(params) : ''
      return `${APP_BASE_URL}${path}${queryParams ? '?' + queryParams.toString() : ''}`
    }

    // Handle OAuth errors
    if (error) {
      console.error('Stripe OAuth error:', error)
      const redirectUrl = await getRedirectUrl('/client/dashboard', { error: 'stripe_connection_failed' })
      return NextResponse.redirect(redirectUrl || `${APP_BASE_URL}/client/login?error=stripe_connection_failed`)
    }

    if (!code || !state || !clientId) {
      const redirectUrl = await getRedirectUrl('/client/dashboard', { error: 'invalid_callback' })
      return NextResponse.redirect(redirectUrl || `${APP_BASE_URL}/client/login?error=invalid_callback`)
    }

    // Exchange code for access token and get account ID
    let connectedAccountId: string
    try {
      const response = await stripe.oauth.token({
        grant_type: 'authorization_code',
        code,
      })
      connectedAccountId = response.stripe_user_id!
    } catch (err: any) {
      console.error('Error exchanging OAuth code:', err)
      const redirectUrl = await getRedirectUrl('/client/dashboard', { error: 'token_exchange_failed' })
      return NextResponse.redirect(redirectUrl || `${APP_BASE_URL}/client/login?error=token_exchange_failed`)
    }

    // Get client to retrieve access token for redirect
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { clientAccessToken: true },
    })

    if (!client || !client.clientAccessToken) {
      return NextResponse.redirect(`${APP_BASE_URL}/client/login?error=no_access_token`)
    }

    // Update client with Stripe account ID
    await prisma.client.update({
      where: { id: clientId },
      data: {
        stripeAccountId: connectedAccountId,
        stripeConnectedAt: new Date(),
      },
    })

    // Create webhook in connected account
    try {
      await createWebhookForAccount(connectedAccountId, clientId)
    } catch (err) {
      console.error('Error creating webhook:', err)
      // Continue anyway - webhook can be created later
    }

    // Redirect to success page with token
    const successUrl = `${APP_BASE_URL}/client/dashboard?token=${client.clientAccessToken}&success=stripe_connected`
    return NextResponse.redirect(successUrl)
  } catch (error: any) {
    console.error('Error in Stripe Connect callback:', error)
    // Try to get clientId from state for error redirect
    try {
      const state = request.nextUrl.searchParams.get('state')
      if (state) {
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString())
        const clientId = decodedState.clientId
        if (clientId) {
          const client = await prisma.client.findUnique({
            where: { id: clientId },
            select: { clientAccessToken: true },
          })
          if (client?.clientAccessToken) {
            return NextResponse.redirect(`${APP_BASE_URL}/client/dashboard?token=${client.clientAccessToken}&error=connection_failed`)
          }
        }
      }
    } catch {
      // Fall through to default error
    }
    return NextResponse.redirect(`${APP_BASE_URL}/client/login?error=connection_failed`)
  }
}

async function createWebhookForAccount(accountId: string, clientId: string) {
  const webhookUrl = `${APP_BASE_URL}/api/stripe/webhook?account=${accountId}`
  
  // Note: Creating webhooks in connected accounts requires the connected account's API key
  // For now, we'll instruct the client to create it manually, or use Stripe Connect webhooks
  // In production with full Connect setup, you'd use the connected account's API key
  
  try {
    // Try to create webhook endpoint in connected account
    // This requires the connected account's API key, which we get from OAuth
    // For MVP, we'll store instructions for manual setup
    
    // Store a placeholder - client will need to create webhook manually
    // Or we can provide instructions in the dashboard
    console.log(`Webhook setup needed for account ${accountId}`)
    console.log(`Webhook URL: ${webhookUrl}`)
    
    // For now, we'll note that webhook needs to be created
    // In a full implementation, you'd use the OAuth token to create the webhook
    // This requires additional Stripe Connect setup
    
  } catch (err: any) {
    console.error('Webhook creation note:', err.message)
    // Don't throw - webhook can be created manually
  }
}
