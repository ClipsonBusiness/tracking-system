import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import CampaignForm from './CampaignForm'
import CampaignList from './CampaignList'

export default async function AdminCampaignsPage() {
  // Dynamically determine base URL from request headers
  const headersList = await headers()
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || 'localhost:3000'
  const baseUrl = process.env.APP_BASE_URL || `${protocol}://${host}`
  try {
    const clients = await prisma.client.findMany()
    const campaigns = await prisma.campaign.findMany({
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Campaigns</h1>

        {/* Create Campaign Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Create New Campaign</h2>
          <CampaignForm clients={clients} />
        </div>

        {/* Campaigns List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Existing Campaigns</h2>
          </div>
          <div className="p-6">
            <CampaignList campaigns={campaigns} baseUrl={baseUrl} />
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    console.error('Error loading campaigns:', error)
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Campaigns
          </h1>
          <p className="text-gray-400 text-sm mt-1">Create and manage affiliate campaigns</p>
        </div>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <p className="text-red-400">Error loading campaigns: {error.message}</p>
          <p className="text-sm text-red-300 mt-2">Make sure the database is migrated: npm run db:push</p>
        </div>
      </div>
    )
  }
}

