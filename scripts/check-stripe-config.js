// Check Stripe configuration for clients
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkStripeConfig() {
  try {
    console.log('🔍 Checking Stripe Configuration for Clients...\n')
    
    // Find all clients
    const clients = await prisma.client.findMany({
      include: {
        campaigns: {
          take: 1,
        },
        conversions: {
          take: 5,
          orderBy: { paidAt: 'desc' },
          include: {
            link: {
              select: { slug: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    if (clients.length === 0) {
      console.log('❌ No clients found')
      return
    }

    clients.forEach((client, index) => {
      console.log(`\n${'='.repeat(60)}`)
      console.log(`${index + 1}. ${client.name}`)
      console.log(`${'='.repeat(60)}`)
      
      // Check custom domain
      console.log(`\n domain:`)
      if (client.customDomain) {
        console.log(`   ✅ Custom Domain: ${client.customDomain}`)
      } else {
        console.log(`   ❌ No custom domain configured`)
      }
      
      // Check Stripe configuration
      console.log(`\n💳 Stripe Configuration:`)
      if (client.stripeWebhookSecret) {
        const secretPreview = client.stripeWebhookSecret.substring(0, 20) + '...'
        console.log(`   ✅ Webhook Secret: ${secretPreview}`)
      } else {
        console.log(`   ❌ Webhook Secret: NOT SET`)
        console.log(`   ⚠️  Revenue tracking will NOT work without this!`)
      }
      
      if (client.stripeAccountId) {
        console.log(`   ✅ Account ID: ${client.stripeAccountId}`)
      } else {
        console.log(`   ⚠️  Account ID: Not set (optional)`)
      }
      
      // Check webhook URL
      const webhookUrl = process.env.APP_BASE_URL || 'https://clipsonaffiliates.com'
      console.log(`\n🔗 Webhook URL:`)
      console.log(`   ${webhookUrl}/api/stripe/webhook`)
      console.log(`   ⚠️  Client needs to configure this in their Stripe Dashboard`)
      
      // Check conversions
      console.log(`\n💰 Revenue Tracking:`)
      if (client.conversions.length > 0) {
        console.log(`   ✅ ${client.conversions.length} conversion(s) found`)
        console.log(`   Recent conversions:`)
        client.conversions.forEach((conv, i) => {
          const amount = (conv.amountPaid / 100).toFixed(2)
          const linkInfo = conv.link ? `Link: ${conv.link.slug}` : 'No link attributed'
          console.log(`   ${i + 1}. $${amount} - ${linkInfo} - ${conv.paidAt.toLocaleDateString()}`)
        })
        
        // Calculate total revenue
        const totalRevenue = client.conversions.reduce((sum, conv) => sum + conv.amountPaid, 0) / 100
        console.log(`\n   💵 Total Revenue: $${totalRevenue.toFixed(2)}`)
      } else {
        console.log(`   ⚠️  No conversions yet`)
        console.log(`   💡 Conversions will appear here after customers make purchases`)
      }
      
      // Check if link attribution is working
      const conversionsWithLinks = client.conversions.filter(c => c.linkId !== null)
      if (client.conversions.length > 0) {
        const attributionRate = (conversionsWithLinks.length / client.conversions.length * 100).toFixed(1)
        console.log(`\n   📊 Link Attribution: ${attributionRate}% (${conversionsWithLinks.length}/${client.conversions.length} conversions linked to specific links)`)
      }
    })
    
    console.log(`\n\n${'='.repeat(60)}`)
    console.log('📋 Summary')
    console.log(`${'='.repeat(60)}`)
    
    const clientsWithStripe = clients.filter(c => c.stripeWebhookSecret !== null).length
    const clientsWithDomain = clients.filter(c => c.customDomain !== null).length
    const totalConversions = clients.reduce((sum, c) => sum + c.conversions.length, 0)
    const totalRevenue = clients.reduce((sum, c) => {
      return sum + c.conversions.reduce((s, conv) => s + conv.amountPaid, 0) / 100
    }, 0)
    
    console.log(`\n✅ Clients with Stripe configured: ${clientsWithStripe}/${clients.length}`)
    console.log(`✅ Clients with custom domain: ${clientsWithDomain}/${clients.length}`)
    console.log(`💰 Total conversions: ${totalConversions}`)
    console.log(`💵 Total revenue tracked: $${totalRevenue.toFixed(2)}`)
    
    if (clientsWithStripe < clients.length) {
      console.log(`\n⚠️  WARNING: Some clients are missing Stripe webhook configuration!`)
      console.log(`   Revenue tracking will NOT work for clients without webhook secrets.`)
      console.log(`   Clients need to:`)
      console.log(`   1. Go to Stripe Dashboard → Webhooks`)
      console.log(`   2. Add endpoint: ${process.env.APP_BASE_URL || 'https://clipsonaffiliates.com'}/api/stripe/webhook`)
      console.log(`   3. Select events: invoice.paid, checkout.session.completed`)
      console.log(`   4. Copy the signing secret and add it to the client setup form`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkStripeConfig()
