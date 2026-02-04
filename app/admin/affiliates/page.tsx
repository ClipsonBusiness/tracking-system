import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import AffiliateForm from './AffiliateForm'
import AffiliateList from './AffiliateList'
import ApplyCommissionButton from './ApplyCommissionButton'

export default async function AdminAffiliatesPage() {
  await requireAdminAuth()
  const clients = await prisma.client.findMany()
  const affiliates = await prisma.affiliate.findMany({
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  })

  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Affiliates
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage affiliate accounts and commissions</p>
        </div>
        {affiliates.length > 0 && <ApplyCommissionButton affiliates={affiliates} />}
      </div>
      
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Create New Affiliate</h2>
        <AffiliateForm clients={clients} />
      </div>
      
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Existing Affiliates</h2>
        </div>
        <div className="p-6">
          <AffiliateList affiliates={affiliates} baseUrl={baseUrl} />
        </div>
      </div>
    </div>
  )
}

