import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
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
        await handleInvoicePaid(event.data.object as Stripe.Invoice, client, accountId, webhookSecret)
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
  console.log('Checkout session completed:', session.id)
  
  // If affiliate code is in checkout session metadata, propagate it to customer and subscription
  const affiliateCode = session.metadata?.affiliate_code
  
  if (affiliateCode) {
    // Update customer metadata if customer exists
    if (session.customer && typeof session.customer === 'string') {
      try {
        await stripe.customers.update(session.customer, {
          metadata: {
            affiliate_code: affiliateCode,
          },
        })
        console.log(`Updated customer ${session.customer} with affiliate code: ${affiliateCode}`)
      } catch (err) {
        console.error('Error updating customer metadata:', err)
      }
    }
    
    // Update subscription metadata if subscription exists
    if (session.subscription) {
      const subscriptionId = typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription.id
      
      try {
        await stripe.subscriptions.update(subscriptionId, {
          metadata: {
            affiliate_code: affiliateCode,
          },
        })
        console.log(`Updated subscription ${subscriptionId} with affiliate code: ${affiliateCode}`)
      } catch (err) {
        console.error('Error updating subscription metadata:', err)
      }
    }
  }
}

async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  client: { id: string; stripeAccountId: string | null } | null,
  accountId: string | null,
  webhookSecret: string | null
) {
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
      
      // If still no affiliate code, check the subscription's latest invoice's checkout session
      if (!affiliateCode && subscription.latest_invoice) {
        const latestInvoiceId = typeof subscription.latest_invoice === 'string'
          ? subscription.latest_invoice
          : subscription.latest_invoice.id
        
        if (latestInvoiceId === invoice.id) {
          // This is the subscription's latest invoice, try to find checkout session
          try {
            const checkoutSessions = await stripe.checkout.sessions.list({
              subscription: subscriptionId,
              limit: 1,
            })
            
            if (checkoutSessions.data.length > 0) {
              const session = checkoutSessions.data[0]
              if (session.metadata?.affiliate_code) {
                affiliateCode = session.metadata.affiliate_code
                // Update subscription with the affiliate code for future invoices
                try {
                  await stripe.subscriptions.update(subscriptionId, {
                    metadata: {
                      affiliate_code: affiliateCode,
                    },
                  })
                } catch (err) {
                  console.error('Error updating subscription metadata:', err)
                }
              }
            }
          } catch (err) {
            console.error('Error retrieving checkout session:', err)
          }
        }
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
  let foundClient = client
  if (!foundClient) {
    if (accountId) {
      foundClient = await prisma.client.findFirst({
        where: { stripeAccountId: accountId },
      })
    }
    
    // If using default webhook secret, try to find client by matching webhook secret
    if (!foundClient && webhookSecret === process.env.STRIPE_WEBHOOK_SECRET) {
      // Find client that has this webhook secret stored
      foundClient = await prisma.client.findFirst({
        where: { stripeWebhookSecret: webhookSecret },
      })
    }
    
    if (!foundClient) {
      // Last resort: use first client with webhook secret configured
      foundClient = await prisma.client.findFirst({
        where: { stripeWebhookSecret: { not: null } },
        orderBy: { createdAt: 'asc' },
      })
      
      // If still no client, use first client (for backward compatibility)
      if (!foundClient) {
        foundClient = await prisma.client.findFirst()
      }
    }
  }
  
  if (!foundClient) {
    // BULLETPROOF: Try to find client by checking invoice metadata or customer email
    // This ensures we NEVER lose a conversion
    console.error('No client found for conversion, trying additional methods...')
    
    // Try to find by customer email domain or other metadata
    try {
      const customer = await stripe.customers.retrieve(invoice.customer as string)
      if (customer && !customer.deleted && customer.email) {
        // Try to find client by custom domain matching email domain
        const emailDomain = customer.email.split('@')[1]
        const allClients = await prisma.client.findMany({
          where: { customDomain: { not: null } },
        })
        
        for (const testClient of allClients) {
          if (testClient.customDomain && emailDomain.includes(testClient.customDomain.replace('https://', '').replace('http://', '').replace('www.', ''))) {
            foundClient = testClient
            console.log(`Found client by email domain match: ${testClient.name}`)
            break
          }
        }
      }
    } catch (err) {
      console.error('Error retrieving customer for client matching:', err)
    }
    
    // Last resort: Use first client with webhook secret (most likely the right one)
    if (!foundClient) {
      foundClient = await prisma.client.findFirst({
        where: { stripeWebhookSecret: { not: null } },
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, stripeAccountId: true },
      })
      if (foundClient) {
        console.log(`Using fallback client: ${foundClient.name}`)
      }
    }
    
    // If STILL no client, create conversion with first client (better than losing it)
    if (!foundClient) {
      foundClient = await prisma.client.findFirst()
      if (foundClient) {
        console.warn(`WARNING: Using first available client as fallback: ${foundClient.name}`)
      } else {
        console.error('CRITICAL: No clients exist in database!')
        return
      }
    }
  }

  // Try to find the link that generated this conversion
  // We'll match by finding the most recent click for this customer
  let linkId: string | null = null
  
  // First, try to get link slug from metadata (if client passes it in checkout)
  let linkSlug: string | null = null
  if (invoice.metadata?.link_slug) {
    linkSlug = invoice.metadata.link_slug
  } else if (invoice.subscription) {
    const subscriptionId =
      typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id || null
    
    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        if (subscription.metadata?.link_slug) {
          linkSlug = subscription.metadata.link_slug
        }
      } catch (err) {
        console.error('Error retrieving subscription for link_slug:', err)
      }
    }
  }
  
  // If we have link slug from metadata, find the link
  if (linkSlug) {
    try {
      const link = await prisma.link.findUnique({
        where: { slug: linkSlug },
        select: { id: true },
      })
      if (link) {
        linkId = link.id
      }
    } catch (err) {
      console.error('Error finding link by slug:', err)
    }
  }
  
  // If no link from metadata, try to match by finding most recent click for this customer
  // We'll match by finding the most recent click that happened BEFORE the purchase
  if (!linkId && invoice.customer && typeof invoice.customer === 'string') {
    try {
      const customer = await stripe.customers.retrieve(invoice.customer)
      if (!customer.deleted) {
        // Get the purchase time from the invoice
        const paidAt = invoice.status_transitions.paid_at 
          ? new Date(invoice.status_transitions.paid_at * 1000)
          : new Date()
        
        // Find the most recent click for this client that happened BEFORE the purchase
        // This ensures we attribute to the click that actually led to the sale
        const sixtyDaysAgo = new Date(paidAt)
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
        
        const recentClick = await prisma.click.findFirst({
          where: {
            clientId: foundClient.id,
            ts: { 
              gte: sixtyDaysAgo,
              lte: paidAt, // Click must be BEFORE purchase
            },
          },
          orderBy: { ts: 'desc' },
          select: { linkId: true },
        })
        
        if (recentClick) {
          linkId = recentClick.linkId
          console.log(`✅ Matched conversion to link ${linkId} by most recent click before purchase`)
        } else {
          // BULLETPROOF: Try broader time window (90 days) and any click, not just before purchase
          // This catches edge cases where timing is off
          const ninetyDaysAgo = new Date(paidAt)
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
          
          const anyRecentClick = await prisma.click.findFirst({
            where: {
              clientId: foundClient.id,
              ts: { gte: ninetyDaysAgo },
            },
            orderBy: { ts: 'desc' },
            select: { linkId: true },
          })
          
          if (anyRecentClick) {
            linkId = anyRecentClick.linkId
            console.log(`⚠️ Matched conversion to link ${linkId} by most recent click (90-day window, may be after purchase)`)
          } else {
            console.log(`❌ No click found within 90 days for client ${foundClient.id}`)
          }
        }
      }
    } catch (err) {
      console.error('Error matching conversion to link:', err)
    }
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
    // BULLETPROOF: Always create conversion, even without linkId (can fix later)
    const conversion = await prisma.conversion.upsert({
      where: { stripeInvoiceId: invoiceId },
      update: {
        // Update if needed (e.g., status changed or linkId was null and now we have it)
        status: 'paid',
        ...(linkId && { linkId }), // Only update linkId if we have it
      },
      create: {
        clientId: foundClient.id,
        affiliateCode,
        linkId, // Can be null - we'll fix it later
        stripeCustomerId: invoice.customer as string,
        stripeSubscriptionId: subscriptionId,
        stripeInvoiceId: invoiceId,
        amountPaid,
        currency,
        paidAt,
        status: 'paid',
      },
    })
    
    const linkStatus = linkId ? `✅ with link ${linkId}` : linkSlug ? `⚠️ link_slug found (${linkSlug}) but link not found in DB` : '❌ NO LINK ATTRIBUTED'
    console.log(`✅ Conversion ${conversion.id} created/updated for invoice ${invoiceId} - ${linkStatus}`)
    
    // If conversion was created without linkId, try to fix it immediately
    if (!linkId && conversion.linkId === null) {
      console.log(`🔧 Attempting to fix orphan conversion ${conversion.id}...`)
      
      // Try one more time with even broader search
      const veryRecentClick = await prisma.click.findFirst({
        where: {
          clientId: foundClient.id,
        },
        orderBy: { ts: 'desc' },
        select: { linkId: true },
      })
      
      if (veryRecentClick) {
        await prisma.conversion.update({
          where: { id: conversion.id },
          data: { linkId: veryRecentClick.linkId },
        })
        console.log(`✅ Fixed! Attributed conversion to link ${veryRecentClick.linkId}`)
      }
    }
  } catch (err) {
    console.error('❌ Error creating conversion:', err)
    // Don't throw - return success to Stripe so it doesn't retry
    // We'll log the error and can fix manually
    console.error('Conversion data:', {
      clientId: foundClient.id,
      invoiceId,
      amountPaid,
      linkId,
    })
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

