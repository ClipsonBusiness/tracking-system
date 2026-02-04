import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import ClipperList from './ClipperList'

export default async function AdminClippersPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const searchQuery = searchParams.search || ''

  // Get all clippers with their stats
  const allClippers = await prisma.clipper.findMany({
    include: {
      links: {
        include: {
          _count: {
            select: { clicks: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Calculate stats for each clipper
  const clippersWithStats = allClippers.map((clipper) => {
    const totalClicks = clipper.links.reduce(
      (sum, link) => sum + link._count.clicks,
      0
    )
    return {
      ...clipper,
      totalClicks,
      linkCount: clipper.links.length,
    }
  })

  // Filter by search query (Discord username, social media, or dashboard code)
  const filteredClippers = searchQuery
    ? clippersWithStats.filter((clipper) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          clipper.discordUsername?.toLowerCase().includes(searchLower) ||
          clipper.socialMediaPage?.toLowerCase().includes(searchLower) ||
          clipper.dashboardCode.toLowerCase().includes(searchLower)
        )
      })
    : clippersWithStats

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Clippers
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          View and manage clipper accounts
        </p>
      </div>

      <ClipperList clippers={filteredClippers} initialSearch={searchQuery} />
    </div>
  )
}

