const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixYrcpzConversion() {
  try {
    console.log('🔍 Checking for conversions with affiliateCode="yrcpz"...\n')
    
    // Find link with slug yrcpz
    const link = await prisma.link.findUnique({
      where: { slug: 'yrcpz' },
      select: { id: true, slug: true },
    })
    
    if (!link) {
      console.error('❌ Link with slug "yrcpz" not found!')
      return
    }
    
    console.log(`✅ Found link: ${link.slug} (ID: ${link.id})\n`)
    
    // Find all conversions with affiliateCode yrcpz or without linkId
    const recentConversions = await prisma.conversion.findMany({
      where: {
        OR: [
          { affiliateCode: 'yrcpz' },
          { linkId: null },
        ],
      },
      include: {
        client: {
          select: { name: true },
        },
        link: {
          select: { slug: true },
        },
      },
      orderBy: { paidAt: 'desc' },
      take: 10,
    })
    
    console.log(`📊 Found ${recentConversions.length} recent conversions:\n`)
    
    for (const conv of recentConversions) {
      const hasLink = conv.linkId ? '✅' : '❌'
      const linkSlug = conv.link?.slug || 'NO LINK'
      const shouldFix = !conv.linkId && (conv.affiliateCode === 'yrcpz' || !conv.linkId)
      
      console.log(`${hasLink} $${(conv.amountPaid / 100).toFixed(2)} ${conv.currency.toUpperCase()}`)
      console.log(`   Invoice: ${conv.stripeInvoiceId}`)
      console.log(`   Link: ${linkSlug} (ID: ${conv.linkId || 'null'})`)
      console.log(`   Affiliate Code: ${conv.affiliateCode || 'null'}`)
      console.log(`   Client: ${conv.client.name}`)
      console.log(`   Paid: ${new Date(conv.paidAt).toLocaleString()}`)
      
      if (shouldFix) {
        console.log(`   🔧 FIXING: Linking to ${link.slug}...`)
        await prisma.conversion.update({
          where: { id: conv.id },
          data: { linkId: link.id },
        })
        console.log(`   ✅ FIXED!`)
      }
      console.log('')
    }
    
    // Check conversions specifically for this link
    const linkConversions = await prisma.conversion.findMany({
      where: { linkId: link.id },
      orderBy: { paidAt: 'desc' },
    })
    
    const totalRevenue = linkConversions.reduce((sum, c) => sum + c.amountPaid, 0) / 100
    
    console.log(`\n💰 Total conversions for link "yrcpz": ${linkConversions.length}`)
    console.log(`💰 Total revenue: $${totalRevenue.toFixed(2)}\n`)
    
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await prisma.$disconnect()
  }
}

fixYrcpzConversion()
