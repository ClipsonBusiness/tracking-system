// Script to add city column to clicks table
// Run with: node scripts/add-city-column.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addCityColumn() {
  try {
    console.log('Adding city column to clicks table...')
    
    // Use raw SQL to add the column
    await prisma.$executeRaw`ALTER TABLE clicks ADD COLUMN IF NOT EXISTS city TEXT;`
    
    console.log('✅ City column added successfully!')
    
    // Verify it was added
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clicks' AND column_name = 'city'
    `
    
    if (result.length > 0) {
      console.log('✅ Verified: city column exists')
      console.log('Column details:', result[0])
    } else {
      console.log('⚠️  Warning: Could not verify column was added')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Column already exists - that\'s okay!')
    } else {
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

addCityColumn()
