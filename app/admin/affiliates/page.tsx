import { prisma } from '@/lib/prisma'
import AffiliateForm from './AffiliateForm'
import AffiliateList from './AffiliateList'

export default async function AdminAffiliatesPage() {
  const clients = await prisma.client.findMany()
  const affiliates = await prisma.affiliate.findMany({
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  })

  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000'

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Affiliates</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
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

