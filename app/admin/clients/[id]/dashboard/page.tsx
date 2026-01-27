import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import GenerateClientLink from './GenerateClientLink'
import LinkCard from './LinkCard'

export default async function ClientDashboardPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { campaignId?: string }
}) {
  const clientId = params.id
  const campaignId = searchParams.campaignId

  // Get client with campaigns
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      campaigns: true,
    },
  })

  if (!client) {
    redirect('/admin/clients')
  }

  // Get links for this client, optionally filtered by campaign
  const links = await prisma.link.findMany({
    where: {
      clientId,
      ...(campaignId && { campaignId }),
    },
    include: {
      campaign: true,
      clipper: {
        select: {
          id: true,
          dashboardCode: true,
          discordUsername: true,
          socialMediaPage: true,
        },
      },
      _count: {
        select: { clicks: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get clicks stats
  const totalClicks = await prisma.click.count({
    where: { clientId },
  })

  // Group links by handle (page name)
  const linksByHandle = links.reduce((acc, link) => {
    const handle = link.handle || 'default'
    if (!acc[handle]) {
      acc[handle] = []
    }
    acc[handle].push(link)
    return acc
  }, {} as Record<string, typeof links>)

  const selectedCampaign = campaignId
    ? client.campaigns.find((c) => c.id === campaignId)
    : null

  // Dynamically determine base URL from request headers
  const headersList = await headers()
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || 'localhost:3000'
  const baseUrl = process.env.APP_BASE_URL || `${protocol}://${host}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/clients"
            className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block"
          >
            ← Back to Clients
          </Link>
          <h1 className="text-3xl font-bold text-white">{client.name} Dashboard</h1>
          {selectedCampaign && (
            <p className="text-gray-400 mt-1">Campaign: {selectedCampaign.name}</p>
          )}
        </div>
      </div>

      {/* Generate Client Dashboard Link */}
      {selectedCampaign && (
        <GenerateClientLink
          clientId={client.id}
          campaignId={selectedCampaign.id}
          campaignName={selectedCampaign.name}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Links</p>
              <p className="text-2xl font-bold text-white mt-1">{links.length}</p>
            </div>
            <div className="text-3xl">🔗</div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Clicks</p>
              <p className="text-2xl font-bold text-white mt-1">
                {totalClicks.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">👆</div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pages</p>
              <p className="text-2xl font-bold text-white mt-1">
                {Object.keys(linksByHandle).length}
              </p>
            </div>
            <div className="text-3xl">📄</div>
          </div>
        </div>
      </div>

      {/* Campaign Filter */}
      {client.campaigns.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/admin/clients/${clientId}/dashboard`}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !campaignId
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All Campaigns
            </Link>
            {client.campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/admin/clients/${clientId}/dashboard?campaignId=${campaign.id}`}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  campaignId === campaign.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {campaign.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Links by Page */}
      {/* DNS Configuration Button */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">DNS Configuration</h3>
            <p className="text-sm text-gray-400 mt-1">
              {client.customDomain 
                ? `Custom domain: ${client.customDomain}` 
                : 'No custom domain configured'}
            </p>
          </div>
          <a
            href={`/admin/clients/${client.id}/dns`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Configure DNS
          </a>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(linksByHandle).map(([handle, pageLinks]) => {
          const pageClicks = pageLinks.reduce(
            (sum, link) => sum + link._count.clicks,
            0
          )
          const customDomain = client.customDomain

          return (
            <div
              key={handle}
              className="bg-gray-800 rounded-lg border border-gray-700"
            >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Page: {handle}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {pageLinks.length} link{pageLinks.length !== 1 ? 's' : ''} •{' '}
                      {pageClicks.toLocaleString()} click{pageClicks !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Link-in-Bio URL:</p>
                    <code className="text-xs text-blue-400">
                      {customDomain
                        ? `https://${customDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/p/${handle}`
                        : `${baseUrl}/p/${handle}`}
                    </code>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {pageLinks.map((link) => {
                    // Clean custom domain
                    let cleanCustomDomain = customDomain
                    if (cleanCustomDomain) {
                      cleanCustomDomain = cleanCustomDomain.replace(/^https?:\/\//, '')
                      cleanCustomDomain = cleanCustomDomain.replace(/\/+$/, '')
                      cleanCustomDomain = cleanCustomDomain.replace(/^\/+/, '')
                    }
                    
                    // If custom domain exists, it's the working URL (since JS redirect is set up)
                    // Railway URL is the fallback
                    const customDomainUrl = cleanCustomDomain
                      ? `https://${cleanCustomDomain}/?ref=${link.slug}`
                      : null
                    const railwayUrl = `${baseUrl}/?ref=${link.slug}`
                    // Custom domain is the working URL if it exists, otherwise use Railway
                    const workingUrl = customDomainUrl || railwayUrl

                    return (
                      <LinkCard
                        key={link.id}
                        link={link}
                        customDomainUrl={customDomainUrl}
                        workingUrl={workingUrl}
                        railwayUrl={railwayUrl}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {links.length === 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <p className="text-gray-400">
            {campaignId
              ? 'No links found for this campaign.'
              : 'No links found for this client.'}
          </p>
        </div>
      )}
    </div>
  )
}

