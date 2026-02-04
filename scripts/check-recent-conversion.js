const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkRecentConversion() {
  try {
    // Find link by slug "mflp"
    const link = await prisma.link.findFirst({
      where: { slug: 'mflp' },
      include: {
        client: {
          select: { name: true },
        },
        clipper: {
          select: { name: true, dashboardCode: true },
        },
      },
    })

    if (!link) {
      console.log('❌ Link "mflp" not found')
      return
    }

    console.log(`\n✅ Found link: ${link.slug}`)
    console.log(`   Client: ${link.client.name}`)
    console.log(`   Clipper: ${link.clipper?.name || 'N/A'}`)
    console.log(`   Dashboard Code: ${link.clipper?.dashboardCode || 'N/A'}`)

    // Check recent clicks (last hour)
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    const recentClicks = await prisma.click.count({
      where: {
        linkId: link.id,
        ts: { gte: oneHourAgo },
      },
    })

    console.log(`\n📊 Recent Activity (last hour):`)
    console.log(`   Clicks: ${recentClicks}`)

    // Check recent conversions (last hour)
    const recentConversions = await prisma.conversion.findMany({
      where: {
        linkId: link.id,
        paidAt: { gte: oneHourAgo },
      },
      orderBy: { paidAt: 'desc' },
    })

    console.log(`   Conversions: ${recentConversions.length}`)

    if (recentConversions.length > 0) {
      console.log(`\n💰 Recent Sales:`)
      recentConversions.forEach((conv, i) => {
        const timeAgo = Math.round((new Date() - conv.paidAt) / 1000)
        console.log(`   ${i + 1}. $${(conv.amountPaid / 100).toFixed(2)} ${conv.currency.toUpperCase()} - ${timeAgo}s ago`)
      })
    } else {
      console.log(`\n⏳ No conversions yet in the last hour`)
      console.log(`   (This is normal if the webhook hasn't arrived yet)`)
    }

    // Check ALL conversions for this link
    const allConversions = await prisma.conversion.findMany({
      where: { linkId: link.id },
      orderBy: { paidAt: 'desc' },
      take: 5,
    })

    if (allConversions.length > 0) {
      console.log(`\n📈 All-Time Sales (last 5):`)
      allConversions.forEach((conv, i) => {
        console.log(`   ${i + 1}. $${(conv.amountPaid / 100).toFixed(2)} ${conv.currency.toUpperCase()} - ${new Date(conv.paidAt).toLocaleString()}`)
      })
    }

    // Check recent webhook events (last hour)
    const recentEvents = await prisma.stripeEvent.findMany({
      where: {
        created: { gte: oneHourAgo },
        type: { in: ['invoice.paid', 'checkout.session.completed'] },
      },
      orderBy: { created: 'desc' },
      take: 5,
    })

    if (recentEvents.length > 0) {
      console.log(`\n🔔 Recent Webhook Events (last hour):`)
      recentEvents.forEach((event, i) => {
        const timeAgo = Math.round((new Date() - event.created) / 1000)
        console.log(`   ${i + 1}. ${event.type} - ${timeAgo}s ago`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRecentConversion()
