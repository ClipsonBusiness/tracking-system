import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  // Get account ID from query param (for connected accounts - optional)
  const searchParams = request.nextUrl.searchParams
  const accountId = searchParams.get('account')

  // Find client by Stripe account ID or webhook secret
  let client = null
  let webhookSecret: string | null = null

  // Try to find client by account ID first (if provided)
  if (accountId) {
    client = await prisma.client.findFirst({
      where: { stripeAccountId: accountId },
    })
    if (client) {
      webhookSecret = client.stripeWebhookSecret || null
    }
  }

  // If no client found, try all clients and match by webhook secret
  // This allows clients to just use webhook secret without account ID
  if (!client || !webhookSecret) {
    const allClients = await prisma.client.findMany({
      where: {
        stripeWebhookSecret: { not: null },
      },
    })

    // Try each client's webhook secret to find the right one
    for (const testClient of allClients) {
      if (testClient.stripeWebhookSecret) {
        try {
          // Try to verify with this client's secret
          const testEvent = stripe.webhooks.constructEvent(body, signature, testClient.stripeWebhookSecret)
          // If no error, this is the right client!
          client = testClient
          webhookSecret = testClient.stripeWebhookSecret
          break
        } catch {
          // Not this client's secret, try next
          continue
        }
      }
    }
  }

  // Fallback to default webhook secret if no client-specific one found
  if (!webhookSecret) {
    webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || null
  }

  if (!webhookSecret) {
    console.error('No webhook secret found')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    // Try with default secret if client-specific failed
    if (webhookSecret !== process.env.STRIPE_WEBHOOK_SECRET) {
      try {
        const defaultSecret = process.env.STRIPE_WEBHOOK_SECRET
        if (defaultSecret) {
          event = stripe.webhooks.constructEvent(body, signature, defaultSecret)
        } else {
          throw err
        }
      } catch {
        return NextResponse.json(
          { error: `Webhook Error: ${err.message}` },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }
  }

  // Store raw event
  try {
    await prisma.stripeEvent.upsert({
      where: { id: event.id },
      update: {
        type: event.type,
        created: new Date(event.created * 1000),
        rawJson: JSON.stringify(event),
      },
      create: {
        id: event.id,
        type: event.type,
        created: new Date(event.created * 1000),
        rawJson: JSON.stringify(event),
      },
    })
  } catch (err) {
    console.error('Error storing Stripe event:', err)
    // Continue processing even if storage fails
  }

  // Handle specific event types
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Could store subscription data if needed
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('Error handling event:', err)
    // Return 500 so Stripe retries
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Could store checkout session data if needed
  console.log('Checkout session completed:', session.id)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.customer || typeof invoice.customer !== 'string') {
    console.log('Invoice has no customer ID')
    return
  }

  // Extract affiliate code from metadata
  let affiliateCode: string | null = null

  // Try invoice metadata first
  if (invoice.metadata?.affiliate_code) {
    affiliateCode = invoice.metadata.affiliate_code
  }

  // Try subscription metadata
  if (!affiliateCode && invoice.subscription) {
    const subscriptionId =
      typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription.id

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      if (subscription.metadata?.affiliate_code) {
        affiliateCode = subscription.metadata.affiliate_code
      }
    } catch (err) {
      console.error('Error retrieving subscription:', err)
    }
  }

  // Try customer metadata
  if (!affiliateCode) {
    try {
      const customer = await stripe.customers.retrieve(invoice.customer)
      if (!customer.deleted && customer.metadata?.affiliate_code) {
        affiliateCode = customer.metadata.affiliate_code
      }
    } catch (err) {
      console.error('Error retrieving customer:', err)
    }
  }

  // Get client - use the one found from webhook verification above, or find by account ID
  // If client wasn't found during webhook verification, try to find it now
  if (!client) {
    if (accountId) {
      client = await prisma.client.findFirst({
        where: { stripeAccountId: accountId },
      })
    }
    
    if (!client && event.account) {
      // Try to find client from event account
      client = await prisma.client.findFirst({
        where: { stripeAccountId: event.account },
      })
    }
    
    if (!client) {
      // Last resort: use first client (for backward compatibility)
      client = await prisma.client.findFirst()
    }
  }
  
  if (!client) {
    console.error('No client found for conversion')
    return
  }

  // Create conversion with idempotency check
  const invoiceId = invoice.id
  const amountPaid = invoice.amount_paid || 0
  const currency = invoice.currency || 'usd'
  const paidAt = new Date(invoice.status_transitions.paid_at! * 1000)
  const subscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id || null

  try {
    await prisma.conversion.upsert({
      where: { stripeInvoiceId: invoiceId },
      update: {
        // Update if needed (e.g., status changed)
        status: 'paid',
      },
      create: {
        clientId: client.id,
        affiliateCode,
        stripeCustomerId: invoice.customer as string,
        stripeSubscriptionId: subscriptionId,
        stripeInvoiceId: invoiceId,
        amountPaid,
        currency,
        paidAt,
        status: 'paid',
      },
    })
    console.log(`Conversion created/updated for invoice ${invoiceId}`)
  } catch (err) {
    console.error('Error creating conversion:', err)
    throw err
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  // Find conversion by invoice ID
  if (!charge.invoice || typeof charge.invoice !== 'string') {
    return
  }

  try {
    await prisma.conversion.updateMany({
      where: {
        stripeInvoiceId: charge.invoice,
      },
      data: {
        status: 'refunded',
      },
    })
    console.log(`Conversion marked as refunded for invoice ${charge.invoice}`)
  } catch (err) {
    console.error('Error updating conversion for refund:', err)
  }
}

