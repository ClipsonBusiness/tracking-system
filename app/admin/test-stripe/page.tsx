import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import TestStripeInterface from './TestStripeInterface'

export default async function TestStripePage() {
  await requireAdminAuth()

  // Get all clients with Stripe connected
  const clients = await prisma.client.findMany({
    where: {
      OR: [
        { stripeWebhookSecret: { not: null } },
        { stripeAccountId: { not: null } },
      ],
    },
    select: {
      id: true,
      name: true,
      stripeWebhookSecret: true,
      stripeAccountId: true,
    },
  })

  // Get recent conversions to show
  const recentConversions = await prisma.conversion.findMany({
    take: 10,
    orderBy: { paidAt: 'desc' },
    include: {
      client: {
        select: { name: true },
      },
    },
  })

  // Get recent Stripe events
  const recentEvents = await prisma.stripeEvent.findMany({
    take: 10,
    orderBy: { created: 'desc' },
    select: {
      id: true,
      type: true,
      created: true,
    },
  })

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test Stripe Tracking</h1>

        <TestStripeInterface
          clients={clients}
          recentConversions={recentConversions}
          recentEvents={recentEvents}
        />
      </div>
    </div>
  )
}

