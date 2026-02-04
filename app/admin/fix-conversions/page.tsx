import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import FixConversionsInterface from './FixConversionsInterface'

export default async function FixConversionsPage() {
  await requireAdminAuth()

  // Get all conversions without linkId from last 7 days
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

  // For each orphan conversion, find potential matching clicks
  const conversionsWithMatches = await Promise.all(
    orphanConversions.map(async (conv) => {
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
            select: { slug: true, clipper: { select: { dashboardCode: true, discordUsername: true } } },
          },
        },
        orderBy: { ts: 'desc' },
      })

      // Serialize dates for client component
      return {
        conversion: {
          ...conv,
          paidAt: conv.paidAt.toISOString(),
        },
        matchingClick: recentClick ? {
          ...recentClick,
          ts: recentClick.ts.toISOString(),
        } : null,
      }
    })
  )

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Fix Orphan Conversions</h1>
        <p className="text-gray-400 mb-6">
          These conversions don&apos;t have a link attributed. They can be matched to the most recent click before purchase.
        </p>

        <FixConversionsInterface conversionsWithMatches={conversionsWithMatches} />
      </div>
    </div>
  )
}
