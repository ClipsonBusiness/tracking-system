import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import TestStripeInterface from './TestStripeInterface'

export default async function TestStripePage() {
  await requireAdminAuth()

  try {
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
    }).catch(() => [])

    // Get recent conversions to show
    const recentConversions = await prisma.conversion.findMany({
      take: 10,
      orderBy: { paidAt: 'desc' },
      include: {
        client: {
          select: { name: true },
        },
      },
    }).catch(() => [])

    // Get recent Stripe events
    const recentEvents = await prisma.stripeEvent.findMany({
      take: 10,
      orderBy: { created: 'desc' },
      select: {
        id: true,
        type: true,
        created: true,
      },
    }).catch(() => [])

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
  } catch (error: any) {
    console.error('Error loading test stripe page:', error)
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Test Stripe Tracking</h1>
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <p className="text-red-400 font-semibold mb-2">Error loading page: {error.message}</p>
            <p className="text-sm text-red-300 mb-4">The database tables don&apos;t exist yet. Click the button below to create them.</p>
            <form action="/api/admin/push-schema" method="POST">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                🔧 Push Database Schema
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

