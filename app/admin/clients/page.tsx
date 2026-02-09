import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ClientsPage() {
  // Get all clients with their campaigns
  const clients = await prisma.client.findMany({
    include: {
      campaigns: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Clients</h1>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 gap-6">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-gray-800 rounded-lg border border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{client.name}</h2>
                {client.customDomain && (
                  <p className="text-sm text-gray-400 mt-1">
                    Domain: <span className="text-blue-400">{client.customDomain}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/clients/${client.id}/edit`}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  ✏️ Edit
                </Link>
                <Link
                  href={`/admin/clients/${client.id}/dns`}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  ⚙️ DNS
                </Link>
              </div>
            </div>

            {/* Campaigns Grid */}
            {client.campaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {client.campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="bg-gray-700 rounded-lg border border-gray-600 p-4 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-white">
                        {campaign.name}
                      </h3>
                    </div>
                    
                    <div className="space-y-2">
                      {campaign.destinationUrl && (
                        <p className="text-xs text-gray-400 truncate">
                          {campaign.destinationUrl}
                        </p>
                      )}
                      
                      <Link
                        href={`/admin/clients/${client.id}/dashboard?campaignId=${campaign.id}`}
                        className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg transition-colors font-medium"
                      >
                        Admin Dashboard
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-400 text-center">
                  No campaigns yet. Create campaigns in the Campaigns section.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <p className="text-gray-400">No clients found.</p>
        </div>
      )}
    </div>
  )
}

