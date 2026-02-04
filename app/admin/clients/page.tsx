import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { headers } from 'next/headers'
import { requireAdminAuth } from '@/lib/auth'
import ClientSetupLink from './ClientSetupLink'
import ClientLoginInfo from './ClientLoginInfo'

export default async function ClientsPage() {
  await requireAdminAuth()
  // Get all clients with their campaigns and access tokens
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      password: true,
      customDomain: true,
      clientAccessToken: true,
      stripeWebhookSecret: true,
      stripeAccountId: true,
      campaigns: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Get recent conversions and events for each client (for verification)
  const clientsWithStats = await Promise.all(
    clients.map(async (client) => {
      const recentConversions = await prisma.conversion.findMany({
        where: { clientId: client.id },
        take: 10,
        orderBy: { paidAt: 'desc' },
        include: {
          link: {
            select: { slug: true },
          },
        },
      })

      // Count orphan conversions (no linkId)
      const orphanCount = await prisma.conversion.count({
        where: {
          clientId: client.id,
          linkId: null,
          paidAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
        },
      })

      // Get recent webhook events (we show all recent events since we can't reliably filter by client)
      // The conversions are the real indicator of whether tracking is working
      const recentEvents = await prisma.stripeEvent.findMany({
        take: 5,
        orderBy: { created: 'desc' },
        select: {
          id: true,
          type: true,
          created: true,
        },
      })

      return {
        ...client,
        recentConversions,
        recentEvents,
        orphanCount,
      }
    })
  )

  // Get base URL for setup links
  const headersList = await headers()
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || 'localhost:3000'
  const baseUrl = process.env.APP_BASE_URL || `${protocol}://${host}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Clients
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage your client accounts</p>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 gap-6">
        {clientsWithStats.map((client) => (
          <div
            key={client.id}
            className="bg-gray-800 rounded-lg border border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{client.name}</h2>
                <div className="flex items-center gap-4 mt-2">
                  {client.customDomain && (
                    <p className="text-sm text-gray-400">
                      Domain: <span className="text-blue-400">{client.customDomain}</span>
                    </p>
                  )}
                  {/* Stripe Configuration Status */}
                  <div className="flex items-center gap-2">
                    {client.stripeWebhookSecret ? (
                      <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded border border-green-700">
                        ✅ Stripe Configured
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded border border-yellow-700">
                        ⚠️ Stripe Not Configured
                      </span>
                    )}
                    {/* Show if actually receiving webhooks */}
                    {client.stripeWebhookSecret && client.recentConversions.length > 0 && (
                      <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded border border-blue-700">
                        🟢 Active ({client.recentConversions.length} recent)
                      </span>
                    )}
                  </div>
                </div>
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

            {/* Client Login Information */}
            <div className="mb-4">
              <ClientLoginInfo
                clientName={client.name}
                password={client.password}
                clientAccessToken={client.clientAccessToken}
                baseUrl={baseUrl}
                clientId={client.id}
              />
            </div>

            {/* Client Setup Link - Only show if setup not complete */}
            {(!client.stripeWebhookSecret && !client.stripeAccountId) && (
              <div className="mb-4">
                <ClientSetupLink 
                  clientId={client.id}
                  clientName={client.name}
                  clientAccessToken={client.clientAccessToken}
                  baseUrl={baseUrl}
                  isSetupComplete={false}
                />
              </div>
            )}

            {/* Stripe Verification Section */}
            {client.stripeWebhookSecret && (
              <div className="mb-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <h3 className="text-sm font-semibold text-white mb-3">📊 Sales Tracking Status</h3>
                <div className="space-y-3">
                  {/* Recent Conversions */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">
                      Recent Conversions: <span className="text-white font-medium">{client.recentConversions.length}</span>
                    </p>
                    {client.recentConversions.length > 0 ? (
                      <div className="space-y-1">
                        {client.recentConversions.map((conv) => (
                          <div key={conv.id} className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded">
                            <div className="flex items-center justify-between">
                              <span>
                                ${(conv.amountPaid / 100).toFixed(2)} {conv.currency.toUpperCase()}
                              </span>
                              <span className="text-gray-500">
                                {conv.link?.slug ? `Link: ${conv.link.slug}` : 'No link matched'}
                              </span>
                              <span className="text-gray-500">
                                {new Date(conv.paidAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-yellow-400 italic">
                        No conversions yet. Sales will appear here once customers make purchases.
                      </p>
                    )}
                  </div>

                  {/* Recent Webhook Events */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">
                      Recent Webhook Events: <span className="text-white font-medium">{client.recentEvents.length}</span>
                    </p>
                    {client.recentEvents.length > 0 ? (
                      <div className="space-y-1">
                        {client.recentEvents.map((event) => (
                          <div key={event.id} className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded">
                            <div className="flex items-center justify-between">
                              <span className="font-mono">{event.type}</span>
                              <span className="text-gray-500">
                                {new Date(event.created).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-yellow-400 italic">
                        No webhook events received yet. Make sure webhook is configured in Stripe Dashboard.
                      </p>
                    )}
                  </div>

                  {/* Orphan Conversions Warning */}
                  {client.orphanCount > 0 && (
                    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
                      <p className="text-xs text-yellow-400 mb-2">
                        ⚠️ {client.orphanCount} conversion(s) without link attribution
                      </p>
                      <button
                        onClick={async () => {
                          const response = await fetch('/api/admin/auto-fix-orphans', {
                            method: 'POST',
                          })
                          const data = await response.json()
                          if (data.success) {
                            alert(`Fixed ${data.fixed} conversion(s)!`)
                            window.location.reload()
                          } else {
                            alert('Error fixing conversions')
                          }
                        }}
                        className="text-xs px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
                      >
                        🔧 Auto-Fix Now
                      </button>
                    </div>
                  )}

                  {/* Status Summary */}
                  <div className="pt-2 border-t border-gray-600">
                    {client.recentConversions.length > 0 ? (
                      <p className="text-xs text-green-400">
                        ✅ <strong>Working!</strong> Sales are being tracked successfully.
                        {client.orphanCount === 0 && ' All conversions properly attributed.'}
                      </p>
                    ) : client.recentEvents.length > 0 ? (
                      <p className="text-xs text-yellow-400">
                        ⚠️ Webhooks received but no conversions yet. This is normal if no purchases have been made.
                      </p>
                    ) : (
                      <p className="text-xs text-yellow-400">
                        ⚠️ No webhook events received. Verify webhook is configured in Stripe Dashboard.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

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

