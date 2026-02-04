const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixOrphanConversions() {
  try {
    // Find all conversions without linkId from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const orphanConversions = await prisma.conversion.findMany({
      where: {
        linkId: null,
        paidAt: { gte: sevenDaysAgo },
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
      orderBy: { paidAt: 'desc' },
    })

    console.log(`\n🔍 Found ${orphanConversions.length} conversion(s) without linkId\n`)

    for (const conv of orphanConversions) {
      console.log(`\n📋 Conversion: $${(conv.amountPaid / 100).toFixed(2)} ${conv.currency.toUpperCase()}`)
      console.log(`   Client: ${conv.client.name}`)
      console.log(`   Paid at: ${new Date(conv.paidAt).toLocaleString()}`)
      console.log(`   Invoice: ${conv.stripeInvoiceId}`)

      // Find the most recent click for this client that happened BEFORE the purchase
      const recentClick = await prisma.click.findFirst({
        where: {
          clientId: conv.clientId,
          ts: {
            lte: conv.paidAt, // Click must be BEFORE purchase
            gte: new Date(conv.paidAt.getTime() - 60 * 24 * 60 * 60 * 1000), // Within 60 days
          },
        },
        include: {
          link: {
            select: { slug: true, clipper: { select: { dashboardCode: true } } },
          },
        },
        orderBy: { ts: 'desc' },
      })

      if (recentClick) {
        console.log(`   ✅ Found matching click:`)
        console.log(`      Link: ${recentClick.link.slug}`)
        console.log(`      Clipper: ${recentClick.link.clipper?.dashboardCode || 'N/A'}`)
        console.log(`      Click time: ${new Date(recentClick.ts).toLocaleString()}`)
        console.log(`      Time before purchase: ${Math.round((conv.paidAt - recentClick.ts) / 1000 / 60)} minutes`)

        // Update the conversion
        await prisma.conversion.update({
          where: { id: conv.id },
          data: { linkId: recentClick.linkId },
        })

        console.log(`   ✅ Updated conversion with linkId: ${recentClick.linkId}`)
      } else {
        console.log(`   ❌ No matching click found (within 60 days before purchase)`)
      }
    }

    console.log(`\n✅ Done! Fixed ${orphanConversions.length} conversion(s)\n`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixOrphanConversions()
