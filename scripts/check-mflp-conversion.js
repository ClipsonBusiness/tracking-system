const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkMflpConversion() {
  try {
    // Find link by slug "ifhrn" (the one shown in dashboard)
    const link = await prisma.link.findFirst({
      where: { slug: 'ifhrn' },
      include: {
        client: {
          select: { id: true, name: true },
        },
        clipper: {
          select: { name: true, dashboardCode: true },
        },
      },
    })

    if (!link) {
      console.log('❌ Link "ifhrn" not found')
      return
    }

    console.log(`\n✅ Found link: ${link.slug}`)
    console.log(`   Client: ${link.client.name}`)
    console.log(`   Clipper: ${link.clipper?.name || 'N/A'} (${link.clipper?.dashboardCode || 'N/A'})`)
    console.log(`   Link ID: ${link.id}`)

    // Check recent clicks for this link
    const recentClicks = await prisma.click.findMany({
      where: { linkId: link.id },
      orderBy: { ts: 'desc' },
      take: 5,
    })

    console.log(`\n📊 Recent Clicks: ${recentClicks.length}`)
    recentClicks.forEach((click, i) => {
      console.log(`   ${i + 1}. ${new Date(click.ts).toLocaleString()} - ${click.country || 'Unknown'}`)
    })

    // Check ALL conversions for this client (last 24 hours)
    const oneDayAgo = new Date()
    oneDayAgo.setHours(oneDayAgo.getHours() - 24)

    const allConversions = await prisma.conversion.findMany({
      where: {
        clientId: link.client.id,
        paidAt: { gte: oneDayAgo },
      },
      include: {
        link: {
          select: { slug: true },
        },
      },
      orderBy: { paidAt: 'desc' },
    })

    console.log(`\n💰 Recent Conversions (last 24 hours): ${allConversions.length}`)
    
    if (allConversions.length > 0) {
      allConversions.forEach((conv, i) => {
        const hasLink = conv.linkId ? '✅' : '❌'
        const linkSlug = conv.link?.slug || 'NO LINK'
        console.log(`   ${i + 1}. ${hasLink} $${(conv.amountPaid / 100).toFixed(2)} ${conv.currency.toUpperCase()}`)
        console.log(`      Link: ${linkSlug} (ID: ${conv.linkId || 'null'})`)
        console.log(`      Time: ${new Date(conv.paidAt).toLocaleString()}`)
        console.log(`      Invoice: ${conv.stripeInvoiceId}`)
      })
    } else {
      console.log('   ⚠️ No conversions found in last 24 hours')
    }

    // Check conversions specifically for this link
    const linkConversions = await prisma.conversion.findMany({
      where: { linkId: link.id },
      orderBy: { paidAt: 'desc' },
    })

    console.log(`\n🔗 Conversions for THIS link: ${linkConversions.length}`)
    if (linkConversions.length > 0) {
      linkConversions.forEach((conv, i) => {
        console.log(`   ${i + 1}. $${(conv.amountPaid / 100).toFixed(2)} ${conv.currency.toUpperCase()} - ${new Date(conv.paidAt).toLocaleString()}`)
      })
    }

    // Check recent webhook events
    const recentEvents = await prisma.stripeEvent.findMany({
      where: {
        created: { gte: oneDayAgo },
        type: { in: ['invoice.paid', 'checkout.session.completed'] },
      },
      orderBy: { created: 'desc' },
      take: 10,
    })

    console.log(`\n🔔 Recent Webhook Events (last 24 hours): ${recentEvents.length}`)
    if (recentEvents.length > 0) {
      recentEvents.forEach((event, i) => {
        const timeAgo = Math.round((new Date() - event.created) / 1000 / 60)
        console.log(`   ${i + 1}. ${event.type} - ${timeAgo} minutes ago`)
      })
    } else {
      console.log('   ⚠️ No webhook events received in last 24 hours')
    }

    // If there's a conversion without a linkId, we can fix it
    const orphanConversions = allConversions.filter(c => !c.linkId && recentClicks.length > 0)
    if (orphanConversions.length > 0) {
      console.log(`\n🔧 Found ${orphanConversions.length} conversion(s) without linkId`)
      console.log('   These can be manually attributed to the most recent click')
      
      orphanConversions.forEach((conv) => {
        const mostRecentClick = recentClicks[0]
        if (mostRecentClick) {
          console.log(`\n   Would update conversion ${conv.id}:`)
          console.log(`   - Set linkId to: ${mostRecentClick.linkId} (${link.slug})`)
          console.log(`   - Conversion amount: $${(conv.amountPaid / 100).toFixed(2)}`)
        }
      })
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMflpConversion()
