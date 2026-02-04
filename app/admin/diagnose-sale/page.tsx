import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DiagnoseSalePage({
  searchParams,
}: {
  searchParams: { linkSlug?: string; clipperCode?: string }
}) {
  await requireAdminAuth()

  const linkSlug = searchParams.linkSlug
  const clipperCode = searchParams.clipperCode || 'mflp'

  // Find link by slug OR by clipper dashboard code
  let link = null
  let allClipperLinks: any[] = []

  if (linkSlug) {
    link = await prisma.link.findFirst({
      where: { slug: linkSlug },
      include: {
        client: {
          select: { id: true, name: true, stripeWebhookSecret: true },
        },
        clipper: {
          select: { name: true, dashboardCode: true },
        },
        clicks: {
          orderBy: { ts: 'desc' },
          take: 5,
        },
      },
    })
  }

  // Also find all links for this clipper
  const clipper = await prisma.clipper.findFirst({
    where: { dashboardCode: clipperCode.toUpperCase() },
    include: {
      links: {
        include: {
          client: {
            select: { id: true, name: true, stripeWebhookSecret: true },
          },
          clicks: {
            orderBy: { ts: 'desc' },
            take: 3,
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (clipper) {
    allClipperLinks = clipper.links
    // If no link found by slug, use first link from clipper
    if (!link && allClipperLinks.length > 0) {
      link = allClipperLinks[0]
    }
  }

  // Get recent conversions for this client (last 24 hours)
  const oneDayAgo = new Date()
  oneDayAgo.setHours(oneDayAgo.getHours() - 24)

  const recentConversions = link
    ? await prisma.conversion.findMany({
        where: {
          clientId: link.client.id,
          paidAt: { gte: oneDayAgo },
        },
        include: {
          link: {
            select: { slug: true },
          },
        },
        orderBy: { paidAt: 'desc' },
      })
    : []

  // Get recent webhook events (last 24 hours)
  const recentEvents = await prisma.stripeEvent.findMany({
    where: {
      created: { gte: oneDayAgo },
      type: { in: ['invoice.paid', 'checkout.session.completed'] },
    },
    orderBy: { created: 'desc' },
    take: 10,
  })

  // Get all conversions for this link
  const linkConversions = link
    ? await prisma.conversion.findMany({
        where: { linkId: link.id },
        orderBy: { paidAt: 'desc' },
      })
    : []

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Diagnose Sale Issue</h1>

        {/* Clipper Info */}
        {clipper && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Clipper Information</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-400">Name:</span>{' '}
                <span className="text-white">{clipper.discordUsername || 'N/A'}</span>
              </p>
              <p>
                <span className="text-gray-400">Dashboard Code:</span>{' '}
                <span className="text-white font-mono">{clipper.dashboardCode}</span>
              </p>
              <p>
                <span className="text-gray-400">Total Links:</span>{' '}
                <span className="text-white">{allClipperLinks.length}</span>
              </p>
            </div>

            {/* All Links for This Clipper */}
            {allClipperLinks.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-white mb-2">All Links for This Clipper:</h3>
                <div className="space-y-2">
                  {allClipperLinks.map((l) => (
                    <div key={l.id} className="text-sm text-gray-300 bg-gray-700/50 p-3 rounded">
                      <div className="flex items-center justify-between">
                        <span>
                          <span className="font-mono text-blue-400">{l.slug}</span>
                          <span className="text-gray-500 ml-2">({l.client.name})</span>
                        </span>
                        <span className="text-gray-500">
                          {l.clicks.length} click(s)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!link ? (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-300 mb-2">❌ Link Not Found</h2>
            <p className="text-red-400">
              {linkSlug
                ? `Link with slug "${linkSlug}" does not exist in the database.`
                : `No links found for clipper with code "${clipperCode}".`}
            </p>
            {clipper && allClipperLinks.length === 0 && (
              <p className="text-yellow-400 mt-2">
                This clipper exists but has no links yet.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Link Info */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Link Information</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-400">Slug:</span>{' '}
                  <span className="text-white font-mono">{link.slug}</span>
                </p>
                <p>
                  <span className="text-gray-400">Client:</span>{' '}
                  <span className="text-white">{link.client.name}</span>
                </p>
                <p>
                  <span className="text-gray-400">Clipper:</span>{' '}
                  <span className="text-white">
                    {link.clipper?.name || 'N/A'} ({link.clipper?.dashboardCode || 'N/A'})
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Stripe Configured:</span>{' '}
                  <span className={link.client.stripeWebhookSecret ? 'text-green-400' : 'text-red-400'}>
                    {link.client.stripeWebhookSecret ? '✅ Yes' : '❌ No'}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Total Clicks:</span>{' '}
                  <span className="text-white">{link.clicks.length}</span>
                </p>
              </div>
            </div>

            {/* Recent Clicks */}
            {link.clicks.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Clicks (Last 5)</h2>
                <div className="space-y-2">
                  {link.clicks.map((click, i) => (
                    <div key={click.id} className="text-sm text-gray-300 bg-gray-700/50 p-3 rounded">
                      <div className="flex items-center justify-between">
                        <span>
                          {i + 1}. {new Date(click.ts).toLocaleString()}
                        </span>
                        <span className="text-gray-500">{click.country || 'Unknown'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conversions for This Link */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Conversions for This Link: {linkConversions.length}
              </h2>
              {linkConversions.length > 0 ? (
                <div className="space-y-2">
                  {linkConversions.map((conv, i) => (
                    <div key={conv.id} className="text-sm text-gray-300 bg-gray-700/50 p-3 rounded">
                      <div className="flex items-center justify-between">
                        <span>
                          ${(conv.amountPaid / 100).toFixed(2)} {conv.currency.toUpperCase()}
                        </span>
                        <span className="text-gray-500">
                          {new Date(conv.paidAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-yellow-400">⚠️ No conversions found for this link</p>
              )}
            </div>

            {/* Recent Conversions for Client */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Recent Conversions for Client (Last 24h): {recentConversions.length}
              </h2>
              {recentConversions.length > 0 ? (
                <div className="space-y-2">
                  {recentConversions.map((conv, i) => (
                    <div
                      key={conv.id}
                      className={`text-sm p-3 rounded ${
                        conv.linkId === link.id
                          ? 'bg-green-900/30 border border-green-700 text-green-300'
                          : conv.linkId
                          ? 'bg-gray-700/50 text-gray-300'
                          : 'bg-yellow-900/30 border border-yellow-700 text-yellow-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span>
                          ${(conv.amountPaid / 100).toFixed(2)} {conv.currency.toUpperCase()}
                        </span>
                        <span className="text-gray-500">
                          {new Date(conv.paidAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs">
                        {conv.linkId === link.id ? (
                          <span className="text-green-400">✅ Attributed to this link</span>
                        ) : conv.linkId ? (
                          <span className="text-gray-400">
                            Attributed to: {conv.link?.slug || 'Unknown'}
                          </span>
                        ) : (
                          <span className="text-yellow-400">⚠️ No link attributed (orphan)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-yellow-400">
                  ⚠️ No conversions found for this client in the last 24 hours
                </p>
              )}
            </div>

            {/* Recent Webhook Events */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Recent Webhook Events (Last 24h): {recentEvents.length}
              </h2>
              {recentEvents.length > 0 ? (
                <div className="space-y-2">
                  {recentEvents.map((event, i) => (
                    <div key={event.id} className="text-sm text-gray-300 bg-gray-700/50 p-3 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{event.type}</span>
                        <span className="text-gray-500">
                          {new Date(event.created).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <p className="text-red-400">
                    ❌ <strong>No webhook events received!</strong>
                  </p>
                  <p className="text-red-300 text-sm mt-2">
                    This means Stripe is not sending webhooks to your server. Check:
                  </p>
                  <ul className="text-red-300 text-sm mt-2 list-disc list-inside space-y-1">
                    <li>Is the webhook configured in Stripe Dashboard?</li>
                    <li>Is the webhook URL correct?</li>
                    <li>Is the webhook secret correct?</li>
                    <li>Are the events (invoice.paid) selected?</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Diagnosis Summary */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Diagnosis</h2>
              <div className="space-y-2 text-sm">
                {!link.client.stripeWebhookSecret ? (
                  <p className="text-red-400">
                    ❌ <strong>Issue:</strong> Stripe webhook secret not configured for this client
                  </p>
                ) : recentEvents.length === 0 ? (
                  <p className="text-red-400">
                    ❌ <strong>Issue:</strong> No webhook events received. Stripe is not sending
                    webhooks to your server.
                  </p>
                ) : recentConversions.length === 0 ? (
                  <p className="text-yellow-400">
                    ⚠️ <strong>Issue:</strong> Webhooks received but no conversions created. Check
                    server logs for errors.
                  </p>
                ) : linkConversions.length === 0 ? (
                  <p className="text-yellow-400">
                    ⚠️ <strong>Issue:</strong> Conversions exist but none are attributed to this
                    link. The fallback matching may have failed.
                  </p>
                ) : (
                  <p className="text-green-400">
                    ✅ <strong>Status:</strong> Everything looks good! Conversions are being tracked.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
