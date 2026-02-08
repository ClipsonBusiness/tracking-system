import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { requireAdminAuth } from '@/lib/auth'
import CampaignForm from './CampaignForm'
import CampaignList from './CampaignList'
import FixCampaignStatusButton from './FixCampaignStatusButton'

export default async function AdminCampaignsPage() {
  await requireAdminAuth()
  
  // Dynamically determine base URL from request headers
  const headersList = await headers()
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || 'localhost:3000'
  const baseUrl = process.env.APP_BASE_URL || `${protocol}://${host}`
  try {
    const clients = await prisma.client.findMany().catch(() => [])
    // Get ALL campaigns (including inactive) for admin view
    const allCampaigns = await prisma.campaign.findMany({
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }).catch(() => [])
    
    // Separate active and inactive
    const campaigns = allCampaigns.filter(c => c.status === 'active')
    const inactiveCampaigns = allCampaigns.filter(c => c.status === 'inactive' || c.status === null)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Campaigns</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your affiliate campaigns</p>
          </div>
          <FixCampaignStatusButton />
        </div>

        {/* Create Campaign Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Create New Campaign</h2>
          <CampaignForm clients={clients} />
        </div>

        {/* Campaigns List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Active Campaigns ({campaigns.length})</h2>
            {inactiveCampaigns.length > 0 && (
              <p className="text-sm text-yellow-400 mt-1">
                ⚠️ {inactiveCampaigns.length} inactive campaign(s) hidden (not shown in clipper portal)
              </p>
            )}
          </div>
          <div className="p-6">
            <CampaignList campaigns={campaigns} baseUrl={baseUrl} />
          </div>
        </div>
        
        {/* Show inactive campaigns for debugging */}
        {inactiveCampaigns.length > 0 && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-gray-400">Inactive Campaigns ({inactiveCampaigns.length})</h2>
              <p className="text-sm text-gray-500 mt-1">These are hidden from the clipper portal</p>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {inactiveCampaigns.map((campaign) => (
                  <div key={campaign.id} className="p-3 bg-gray-700 rounded border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{campaign.name}</p>
                        <p className="text-xs text-gray-400">Status: {campaign.status || 'null'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
          <p className="text-red-400 font-semibold mb-2">Error loading campaigns: {error.message}</p>
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

