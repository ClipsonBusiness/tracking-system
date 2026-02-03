const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixCampaignStatus() {
  try {
    console.log('Checking campaigns...')
    
    // Get all campaigns
    const allCampaigns = await prisma.campaign.findMany({
      select: {
        id: true,
        name: true,
        status: true,
      },
    })

    console.log(`Found ${allCampaigns.length} total campaigns`)
    
    // Find campaigns with null status
    const nullStatusCampaigns = allCampaigns.filter(c => c.status === null)
    console.log(`Found ${nullStatusCampaigns.length} campaigns with null status`)
    
    if (nullStatusCampaigns.length > 0) {
      console.log('Campaigns with null status:')
      nullStatusCampaigns.forEach(c => {
        console.log(`  - ${c.name} (${c.id})`)
      })
      
      // Update all null status campaigns to 'inactive'
      const result = await prisma.campaign.updateMany({
        where: {
          status: null,
        },
        data: {
          status: 'inactive',
        },
      })
      
      console.log(`\n✅ Updated ${result.count} campaigns to 'inactive'`)
    }
    
    // Show summary
    const activeCampaigns = allCampaigns.filter(c => c.status === 'active')
    const inactiveCampaigns = allCampaigns.filter(c => c.status === 'inactive')
    
    console.log('\n📊 Campaign Status Summary:')
    console.log(`  Active: ${activeCampaigns.length}`)
    console.log(`  Inactive: ${inactiveCampaigns.length}`)
    console.log(`  Null: ${nullStatusCampaigns.length - (nullStatusCampaigns.length > 0 ? result.count : 0)}`)
    
    if (activeCampaigns.length > 0) {
      console.log('\n✅ Active campaigns (visible in clipper portal):')
      activeCampaigns.forEach(c => {
        console.log(`  - ${c.name}`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCampaignStatus()
