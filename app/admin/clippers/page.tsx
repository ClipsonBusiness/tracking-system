import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import ClipperList from './ClipperList'

export default async function AdminClippersPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  await requireAdminAuth()
  const searchQuery = searchParams.search || ''

  try {
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
    }).catch(() => [])

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
            clipper.dashboardCode?.toLowerCase().includes(searchLower)
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
  } catch (error: any) {
    console.error('Error loading clippers:', error)
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
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <p className="text-red-400 font-semibold mb-2">Error loading clippers: {error.message}</p>
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
    )
  }
}

