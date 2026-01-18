import { prisma } from '@/lib/prisma'
import CampaignForm from './CampaignForm'
import CampaignList from './CampaignList'

export default async function AdminCampaignsPage() {
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
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Create New Campaign</h2>
          <CampaignForm clients={clients} />
        </div>

        {/* Campaigns List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Existing Campaigns</h2>
          </div>
          <div className="p-6">
            <CampaignList campaigns={campaigns} />
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    console.error('Error loading campaigns:', error)
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Campaigns</h1>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <p className="text-red-400">Error loading campaigns: {error.message}</p>
          <p className="text-sm text-red-300 mt-2">Make sure the database is migrated: npm run db:push</p>
        </div>
      </div>
    )
  }
}

