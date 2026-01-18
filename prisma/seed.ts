import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default client (or get existing)
  let client = await prisma.client.findFirst()
  if (!client) {
    client = await prisma.client.create({
      data: {
        name: 'Default Client',
      },
    })
    console.log('Created client:', client.name)
  } else {
    console.log('Using existing client:', client.name)
  }

  // Create example links
  const link1 = await prisma.link.upsert({
    where: { slug: 'example-product' },
    update: {},
    create: {
      clientId: client.id,
      handle: 'example',
      slug: 'example-product',
      destinationUrl: 'https://example.com/product',
    },
  })

  const link2 = await prisma.link.upsert({
    where: { slug: 'example-signup' },
    update: {},
    create: {
      clientId: client.id,
      handle: 'example',
      slug: 'example-signup',
      destinationUrl: 'https://example.com/signup',
    },
  })

  console.log('Created links:', link1.slug, link2.slug)

  // Create example affiliate
  const affiliate = await prisma.affiliate.upsert({
    where: {
      clientId_code: {
        clientId: client.id,
        code: 'AFF001',
      },
    },
    update: {},
    create: {
      clientId: client.id,
      code: 'AFF001',
      status: 'active',
      payoutPercent: 10.0,
    },
  })

  console.log('Created affiliate:', affiliate.code)

  // Create example campaign
  const campaign = await prisma.campaign.upsert({
    where: { id: 'seed-campaign-id' },
    update: {},
    create: {
      id: 'seed-campaign-id',
      clientId: client.id,
      name: 'Example Campaign',
      destinationUrl: 'https://example.com',
      status: 'active',
    },
  })

  console.log('Created campaign:', campaign.name)

  console.log('Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

