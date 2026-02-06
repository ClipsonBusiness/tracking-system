import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  await requireAdminAuth()
  
  try {
    const { invoiceId, checkoutSessionId, paymentIntentId, linkSlug } = await request.json()
    
    if (!linkSlug) {
      return NextResponse.json(
        { error: 'Missing linkSlug' },
        { status: 400 }
      )
    }
    
    // Find the link
    const link = await prisma.link.findUnique({
      where: { slug: linkSlug },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    })
    
    if (!link) {
      return NextResponse.json(
        { error: `Link with slug "${linkSlug}" not found` },
        { status: 404 }
      )
    }
    
    let invoice: Stripe.Invoice | null = null
    let checkoutSession: Stripe.Checkout.Session | null = null
    
    // Try to get invoice if invoiceId provided
    if (invoiceId) {
      try {
        invoice = await stripe.invoices.retrieve(invoiceId)
      } catch (err: any) {
        return NextResponse.json(
          { error: `Failed to retrieve invoice: ${err.message}` },
          { status: 400 }
        )
      }
    }
    
    // Try to get checkout session if checkoutSessionId provided
    if (checkoutSessionId) {
      try {
        checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId)
        
        // If we have checkout session but no invoice, try to get invoice from it
        if (!invoice && checkoutSession.invoice) {
          const invoiceIdFromSession = typeof checkoutSession.invoice === 'string'
            ? checkoutSession.invoice
            : checkoutSession.invoice.id
          try {
            invoice = await stripe.invoices.retrieve(invoiceIdFromSession)
          } catch (err) {
            console.error('Error retrieving invoice from checkout session:', err)
          }
        }
      } catch (err: any) {
        // Don't fail if checkout session not found - try payment intent instead
        console.warn(`Checkout session not found: ${err.message}, trying payment intent...`)
      }
    }
    
    // Try to get invoice from payment intent if paymentIntentId provided
    // This is the most reliable method for subscription payments
    if (!invoice && paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
        console.log(`✅ Found payment intent: ${paymentIntentId}`)
        
        if (paymentIntent.invoice) {
          const invoiceIdFromPI = typeof paymentIntent.invoice === 'string'
            ? paymentIntent.invoice
            : paymentIntent.invoice.id
          try {
            invoice = await stripe.invoices.retrieve(invoiceIdFromPI)
            console.log(`✅ Found invoice from payment intent: ${invoiceIdFromPI}`)
          } catch (err) {
            console.error('Error retrieving invoice from payment intent:', err)
          }
        } else {
          // If no invoice on payment intent, try to find checkout session from payment intent
          // Payment intents from checkout sessions have metadata
          if (paymentIntent.metadata?.checkout_session_id) {
            try {
              checkoutSession = await stripe.checkout.sessions.retrieve(
                paymentIntent.metadata.checkout_session_id
              )
              console.log(`✅ Found checkout session from payment intent metadata`)
            } catch (err) {
              console.warn('Could not retrieve checkout session from payment intent metadata')
            }
          }
        }
      } catch (err: any) {
        return NextResponse.json(
          { error: `Failed to retrieve payment intent: ${err.message}` },
          { status: 400 }
        )
      }
    }
    
    if (!invoice && !checkoutSession) {
      return NextResponse.json(
        { error: 'Must provide invoiceId, checkoutSessionId, or paymentIntentId' },
        { status: 400 }
      )
    }
    
    // Extract data from invoice or checkout session
    let amountPaid = 0
    let currency = 'usd'
    let paidAt = new Date()
    let customerId = 'unknown'
    let subscriptionId: string | null = null
    let uniqueId: string
    
    if (invoice) {
      amountPaid = invoice.amount_paid || 0
      currency = invoice.currency || 'usd'
      paidAt = invoice.status_transitions.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : new Date()
      customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || 'unknown'
      subscriptionId = invoice.subscription
        ? (typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id)
        : null
      uniqueId = invoice.id
    } else if (checkoutSession) {
      amountPaid = checkoutSession.amount_total || 0
      currency = checkoutSession.currency || 'usd'
      paidAt = new Date(checkoutSession.created * 1000)
      customerId = typeof checkoutSession.customer === 'string'
        ? checkoutSession.customer
        : checkoutSession.customer?.id || 'unknown'
      subscriptionId = checkoutSession.subscription
        ? (typeof checkoutSession.subscription === 'string'
            ? checkoutSession.subscription
            : checkoutSession.subscription.id)
        : null
      uniqueId = checkoutSession.invoice
        ? (typeof checkoutSession.invoice === 'string'
            ? checkoutSession.invoice
            : checkoutSession.invoice.id)
        : `cs_${checkoutSession.id}`
    } else {
      return NextResponse.json(
        { error: 'No invoice or checkout session data available' },
        { status: 400 }
      )
    }
    
    // Check if conversion already exists
    const existing = await prisma.conversion.findUnique({
      where: { stripeInvoiceId: uniqueId },
    })
    
    if (existing) {
      // Update existing conversion to link it
      const updated = await prisma.conversion.update({
        where: { id: existing.id },
        data: { linkId: link.id },
      })
      
      return NextResponse.json({
        success: true,
        message: `Updated existing conversion ${existing.id} and linked to ${linkSlug}`,
        conversion: {
          id: updated.id,
          linkId: updated.linkId,
          amountPaid: updated.amountPaid,
          currency: updated.currency,
          paidAt: updated.paidAt,
        },
      })
    }
    
    // Create new conversion
    const conversion = await prisma.conversion.create({
      data: {
        clientId: link.client.id,
        affiliateCode: linkSlug,
        linkId: link.id,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripeInvoiceId: uniqueId,
        amountPaid,
        currency,
        paidAt,
        status: 'paid',
      },
    })
    
    return NextResponse.json({
      success: true,
      message: `Conversion created and linked to ${linkSlug}`,
      conversion: {
        id: conversion.id,
        linkId: conversion.linkId,
        amountPaid: conversion.amountPaid,
        currency: conversion.currency,
        paidAt: conversion.paidAt,
      },
    })
  } catch (err: any) {
    console.error('Error creating conversion:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to create conversion' },
      { status: 500 }
    )
  }
}
