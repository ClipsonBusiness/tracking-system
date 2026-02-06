const { PrismaClient } = require('@prisma/client')
const Stripe = require('stripe')

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

async function createYrcpzConversion() {
  try {
    console.log('🔍 Looking for the sale from a few hours ago...\n')
    
    // Payment Intent ID from the Stripe screenshot
    const paymentIntentId = 'pi_3Sxpw1LDafoVnYnR2A04Kqb2'
    
    // Checkout Session ID from earlier
    const checkoutSessionId = 'cs_live_a1CZTiElE9LlGcPxl8Yf1JvurRDrQSsJvjKIMv4rdvIj0aXWlLRs0UmsRD'
    
    // Find link
    const link = await prisma.link.findUnique({
      where: { slug: 'yrcpz' },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    })
    
    if (!link) {
      console.error('❌ Link with slug "yrcpz" not found!')
      return
    }
    
    console.log(`✅ Found link: ${link.slug} (ID: ${link.id})`)
    console.log(`   Client: ${link.client.name}\n`)
    
    // Try to get checkout session first
    let checkoutSession = null
    let invoice = null
    
    try {
      checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId)
      console.log(`✅ Found checkout session: ${checkoutSessionId}`)
      console.log(`   Amount: $${((checkoutSession.amount_total || 0) / 100).toFixed(2)} ${checkoutSession.currency?.toUpperCase()}`)
      console.log(`   Payment Status: ${checkoutSession.payment_status}`)
      console.log(`   Metadata: ${JSON.stringify(checkoutSession.metadata)}\n`)
      
      // Get invoice from checkout session if available
      if (checkoutSession.invoice) {
        const invoiceId = typeof checkoutSession.invoice === 'string'
          ? checkoutSession.invoice
          : checkoutSession.invoice.id
        try {
          invoice = await stripe.invoices.retrieve(invoiceId)
          console.log(`✅ Found invoice: ${invoiceId}`)
        } catch (err) {
          console.log(`⚠️ Could not retrieve invoice: ${err.message}`)
        }
      }
    } catch (err) {
      console.error(`❌ Error retrieving checkout session: ${err.message}`)
    }
    
    // If no invoice from checkout session, try to get from payment intent
    if (!invoice) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
        console.log(`✅ Found payment intent: ${paymentIntentId}`)
        
        if (paymentIntent.invoice) {
          const invoiceId = typeof paymentIntent.invoice === 'string'
            ? paymentIntent.invoice
            : paymentIntent.invoice.id
          invoice = await stripe.invoices.retrieve(invoiceId)
          console.log(`✅ Found invoice from payment intent: ${invoiceId}`)
        }
      } catch (err) {
        console.error(`❌ Error retrieving payment intent: ${err.message}`)
      }
    }
    
    // Determine conversion data
    let amountPaid = 0
    let currency = 'usd'
    let paidAt = new Date()
    let customerId = 'unknown'
    let subscriptionId = null
    let uniqueId = null
    
    if (invoice) {
      amountPaid = invoice.amount_paid || 0
      currency = invoice.currency || 'usd'
      paidAt = invoice.status_transitions.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : new Date(invoice.created * 1000)
      customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || 'unknown'
      subscriptionId = invoice.subscription
        ? (typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id)
        : null
      uniqueId = invoice.id
      console.log(`\n📊 Using invoice data:`)
      console.log(`   Invoice ID: ${uniqueId}`)
      console.log(`   Amount: $${(amountPaid / 100).toFixed(2)} ${currency.toUpperCase()}`)
      console.log(`   Paid at: ${paidAt.toLocaleString()}`)
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
      console.log(`\n📊 Using checkout session data:`)
      console.log(`   Unique ID: ${uniqueId}`)
      console.log(`   Amount: $${(amountPaid / 100).toFixed(2)} ${currency.toUpperCase()}`)
      console.log(`   Paid at: ${paidAt.toLocaleString()}`)
    } else {
      console.error('❌ Could not retrieve invoice or checkout session data!')
      return
    }
    
    // Check if conversion already exists
    const existing = await prisma.conversion.findUnique({
      where: { stripeInvoiceId: uniqueId },
    })
    
    if (existing) {
      console.log(`\n⚠️ Conversion already exists: ${existing.id}`)
      console.log(`   Link ID: ${existing.linkId || 'null'}`)
      
      if (!existing.linkId) {
        console.log(`\n🔧 Updating conversion to link it to yrcpz...`)
        const updated = await prisma.conversion.update({
          where: { id: existing.id },
          data: { linkId: link.id },
        })
        console.log(`✅ Updated! Conversion ${updated.id} is now linked to ${link.slug}`)
      } else {
        console.log(`✅ Conversion is already linked!`)
      }
      return
    }
    
    // Create conversion
    console.log(`\n➕ Creating conversion...`)
    const conversion = await prisma.conversion.create({
      data: {
        clientId: link.client.id,
        affiliateCode: 'yrcpz',
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
    
    console.log(`\n✅ SUCCESS! Conversion created:`)
    console.log(`   ID: ${conversion.id}`)
    console.log(`   Link: ${link.slug}`)
    console.log(`   Amount: $${(amountPaid / 100).toFixed(2)} ${currency.toUpperCase()}`)
    console.log(`   Paid at: ${paidAt.toLocaleString()}`)
    console.log(`\n🎉 The sale should now appear in the dashboard!`)
    
  } catch (err) {
    console.error('❌ Error:', err)
  } finally {
    await prisma.$disconnect()
  }
}

createYrcpzConversion()
