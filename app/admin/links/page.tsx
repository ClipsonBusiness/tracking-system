import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { requireAdminAuth } from '@/lib/auth'
import LinkForm from './LinkForm'
import LinkList from './LinkList'

export default async function AdminLinksPage() {
  try {
    await requireAdminAuth()
    
    // Dynamically determine base URL from request headers
    const headersList = await headers()
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    const host = headersList.get('host') || headersList.get('x-forwarded-host') || 'localhost:3000'
    const baseUrl = process.env.APP_BASE_URL || `${protocol}://${host}`
    const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      customDomain: true,
    },
  })
  const links = await prisma.link.findMany({
    select: {
      id: true,
      clientId: true,
      campaignId: true,
      clipperId: true,
      handle: true,
      slug: true,
      destinationUrl: true,
      createdAt: true,
      client: {
        select: {
          id: true,
          name: true,
          customDomain: true,
        }
      },
      clipper: {
        select: {
          dashboardCode: true,
          discordUsername: true,
          socialMediaPage: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalClicks = await prisma.click.count()
  const clicksToday = await prisma.click.count({
    where: {
      ts: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Links</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="LINKS"
          value={links.length.toString()}
          change={`+${links.filter(l => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return new Date(l.createdAt) >= today
          }).length} today`}
          icon="🔗"
        />
        <SummaryCard
          title="CLICKS"
          value={totalClicks.toLocaleString()}
          change={`+${clicksToday} today`}
          icon="👆"
        />
        <SummaryCard
          title="AFFILIATES"
          value={clients.reduce((acc, c) => acc + 1, 0).toString()}
          change="Active"
          icon="👥"
        />
      </div>

      {/* Create Link Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Create App Link</h2>
        <LinkForm clients={clients.map(c => ({ id: c.id, name: c.name, customDomain: c.customDomain }))} />
      </div>

      {/* Links List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Your Links</h2>
        </div>
        <div className="p-6">
          <LinkList links={links} clients={clients} baseUrl={baseUrl} />
        </div>
      </div>
    </div>
  )
  } catch (error: any) {
    console.error('Error in AdminLinksPage:', error)
    
    // Check if it's a database connection error
    const isDbError = error?.message?.includes('Can\'t reach database server') || 
                     error?.message?.includes('database server') ||
                     error?.code === 'P1001'
    
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Links</h1>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <p className="text-red-400 font-medium mb-2">Error loading links</p>
          {isDbError ? (
            <div className="space-y-3">
              <p className="text-red-300 text-sm">
                Database connection failed. The database server may be down or unreachable.
              </p>
              <div className="bg-red-900/30 border border-red-600 rounded p-3 text-sm text-red-200">
                <p className="font-medium mb-2">🔧 Troubleshooting Steps:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Check Railway dashboard - ensure PostgreSQL service is "Online"</li>
                  <li>Verify DATABASE_URL environment variable is set correctly</li>
                  <li>Check if the database service was paused (Railway pauses inactive services)</li>
                  <li>Try redeploying the application</li>
                </ol>
              </div>
            </div>
          ) : (
            <p className="text-red-300 text-sm">
              {error?.message || 'An error occurred while loading the links page. Please try refreshing.'}
            </p>
          )}
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-4 text-xs text-red-200 overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          )}
        </div>
      </div>
    )
  }
}

function SummaryCard({
  title,
  value,
  change,
  icon,
}: {
  title: string
  value: string
  change: string
  icon: string
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          <p className="text-sm text-gray-400 mt-1">{change}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}

