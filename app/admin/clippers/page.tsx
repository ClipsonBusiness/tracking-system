import { prisma } from '@/lib/prisma'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Clippers</h1>
          <p className="text-gray-400 mt-1">
            Manage clippers and view their dashboard codes
          </p>
        </div>
      </div>

      <ClipperList clippers={filteredClippers} initialSearch={searchQuery} />
    </div>
  )
}

