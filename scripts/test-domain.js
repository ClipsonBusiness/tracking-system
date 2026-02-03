// Test script to check if lowbackability.com is configured correctly
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testDomain() {
  try {
    console.log('🔍 Checking lowbackability.com configuration...\n')
    
    // Find client with lowbackability.com
    const client = await prisma.client.findFirst({
      where: {
        customDomain: {
          contains: 'lowbackability',
          mode: 'insensitive',
        },
      },
      include: {
        campaigns: {
          take: 1,
        },
        links: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!client) {
      console.log('❌ No client found with lowbackability.com domain')
      console.log('\n📋 All clients with custom domains:')
      const allClients = await prisma.client.findMany({
        where: { customDomain: { not: null } },
        select: { id: true, name: true, customDomain: true },
      })
      allClients.forEach(c => {
        console.log(`  - ${c.name}: ${c.customDomain}`)
      })
      return
    }

    console.log('✅ Client found:')
    console.log(`   Name: ${client.name}`)
    console.log(`   Domain: ${client.customDomain}`)
    console.log(`   Stripe Webhook Secret: ${client.stripeWebhookSecret ? '✅ Set' : '❌ Not set'}`)
    console.log(`   Stripe Account ID: ${client.stripeAccountId || 'Not set'}`)
    console.log(`   Client Access Token: ${client.clientAccessToken ? '✅ Set' : '❌ Not set'}`)
    
    console.log(`\n📊 Campaigns: ${client.campaigns.length}`)
    client.campaigns.forEach(campaign => {
      console.log(`   - ${campaign.name}: ${campaign.destinationUrl}`)
    })

    console.log(`\n🔗 Links: ${client.links.length}`)
    if (client.links.length > 0) {
      console.log('   Recent links:')
      client.links.forEach(link => {
        console.log(`   - ${link.slug} → ${link.destinationUrl}`)
        console.log(`     Test URL: https://${client.customDomain}/?ref=${link.slug}`)
      })
    } else {
      console.log('   ⚠️  No links found for this client')
    }

    // Check if JavaScript redirect is needed
    console.log('\n📝 Setup Status:')
    if (client.customDomain) {
      console.log('   ✅ Custom domain is configured')
      console.log('   ⚠️  Client needs to add JavaScript redirect code to their website')
      console.log('   📋 JavaScript code should redirect ?ref= parameters to tracking server')
    }

    // Test URL format
    if (client.links.length > 0) {
      const testLink = client.links[0]
      console.log('\n🧪 Test URLs:')
      console.log(`   With ?ref=: https://${client.customDomain}/?ref=${testLink.slug}`)
      console.log(`   Direct slug: https://${client.customDomain}/${testLink.slug}`)
      console.log(`   Tracking server: https://clipsonaffiliates.com/?ref=${testLink.slug}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDomain()
