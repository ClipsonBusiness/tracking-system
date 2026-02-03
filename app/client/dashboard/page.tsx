import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireClientAuth, checkClientAuth, setClientAuth } from '@/lib/auth'
import { cookies } from 'next/headers'
import StripeConnect from './StripeConnect'
import StripeConnectManual from './StripeConnectManual'
import ClientDetailsForm from './ClientDetailsForm'

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string; success?: string; campaignId?: string }
}) {
  try {
    // Handle token-based URLs - direct access with token
    const token = searchParams.token
    const campaignId = searchParams.campaignId
    
    let clientId: string | null = null
    
    // If token is provided, authenticate directly with token
    if (token) {
      const client = await prisma.client.findUnique({
        where: { clientAccessToken: token },
        select: { id: true },
      })
      
      if (!client) {
        redirect('/client/login?error=invalid_token')
      }
      
      // Set cookie for future visits
      await setClientAuth(client.id)
      clientId = client.id
      
      // If campaignId is provided, redirect to campaign dashboard immediately
      if (campaignId) {
        redirect(`/client/campaign-dashboard?token=${token}&campaignId=${campaignId}`)
      }
    }

    // Use cookie-based authentication (if no token provided)
    if (!clientId) {
      const clientIdFromCookie = await checkClientAuth()
      clientId = clientIdFromCookie || await requireClientAuth()
    }

    // Find client by ID
    const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      stripeAccountId: true,
      stripeWebhookSecret: true,
      stripeConnectedAt: true,
      customDomain: true,
    },
  })

  if (!client) {
    redirect('/client/login?error=invalid_client')
  }

  // Connected if they have either account ID (OAuth) or webhook secret (manual)
  const isStripeConnected = !!(client.stripeAccountId || client.stripeWebhookSecret)

  // Get client's campaigns
  const campaigns = await prisma.campaign.findMany({
    where: { clientId: client.id },
    include: {
      _count: {
        select: { links: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-2">
            {client.name} Dashboard
          </h1>
          <p className="text-gray-400 mb-8">Manage your tracking and Stripe integration</p>

          {/* Success/Error Messages */}
          {searchParams.success === 'stripe_connected' && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
              <p className="text-green-300 font-medium">✅ Stripe connected successfully!</p>
              <p className="text-green-400 text-sm mt-1">
                Sales tracking is now active. Webhooks have been configured automatically.
              </p>
            </div>
          )}

          {searchParams.error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="text-red-300 font-medium">❌ Error</p>
              <p className="text-red-400 text-sm mt-1">
                {searchParams.error === 'stripe_connection_failed' && 'Stripe connection failed. Please try again.'}
                {searchParams.error === 'invalid_callback' && 'Invalid callback. Please try again.'}
                {searchParams.error === 'connection_failed' && 'Connection failed. Please try again.'}
                {!['stripe_connection_failed', 'invalid_callback', 'connection_failed'].includes(searchParams.error) && searchParams.error}
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Get Started Link */}
            {!isStripeConnected && (
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-blue-300 font-medium mb-1">🚀 New here?</h3>
                    <p className="text-blue-400 text-sm">
                      Follow our step-by-step guide to get started
                    </p>
                  </div>
                  <Link
                    href={`/client/get-started?token=${token}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Get Started →
                  </Link>
                </div>
              </div>
            )}

            {/* Stripe Connection Section */}
            {/* Use manual webhook secret input (no OAuth needed) */}
            <StripeConnectManual
              clientId={client.id}
              isConnected={isStripeConnected}
              connectedAt={client.stripeConnectedAt}
            />
            
            {/* Alternative: OAuth flow (requires STRIPE_CONNECT_CLIENT_ID) */}
            {/* Uncomment if you want to use OAuth instead:
            <StripeConnect
              clientId={client.id}
              isConnected={isStripeConnected}
              connectedAt={client.stripeConnectedAt}
            />
            */}

            {/* Analytics Dashboard Section */}
            <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Analytics Dashboard</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    View total performance across all clippers and campaigns
                  </p>
                </div>
                <Link
                  href="/client/analytics"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  View Analytics →
                </Link>
              </div>
              <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-300">
                  See aggregated totals for clicks, revenue, sales, and traffic sources from all your clippers in one place.
                </p>
              </div>
            </div>

            {/* Campaigns Section */}
            {campaigns.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                <h2 className="text-xl font-semibold text-white mb-4">Your Campaigns</h2>
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <Link
                      key={campaign.id}
                      href={`/client/campaign-dashboard?campaignId=${campaign.id}`}
                      className="block p-4 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">{campaign.name}</h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {campaign._count.links} {campaign._count.links === 1 ? 'link' : 'links'}
                          </p>
                        </div>
                        <span className="text-blue-400">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Client Details Section */}
            <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
              <h2 className="text-xl font-semibold text-white mb-4">Your Details</h2>
              <ClientDetailsForm
                clientId={client.id}
                currentName={client.name}
                currentCustomDomain={client.customDomain}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  } catch (error: any) {
    console.error('Error in ClientDashboardPage:', error)
    
    // Check if it's a database connection error
    const isDbError = error?.message?.includes('Can\'t reach database server') || 
                     error?.message?.includes('database server') ||
                     error?.code === 'P1001'
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg border border-red-700 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Dashboard</h2>
          {isDbError ? (
            <div className="space-y-3">
              <p className="text-gray-400 mb-4">
                Database connection failed. The database server may be down or unreachable.
              </p>
              <div className="bg-red-900/30 border border-red-600 rounded p-3 text-sm text-red-200">
                <p className="font-medium mb-2">🔧 Troubleshooting Steps:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Check Railway dashboard - ensure PostgreSQL service is &quot;Online&quot;</li>
                  <li>Verify DATABASE_URL environment variable is set correctly</li>
                  <li>Check if the database service was paused (Railway pauses inactive services)</li>
                  <li>Try refreshing the page</li>
                </ol>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 mb-4">
              An error occurred while loading your dashboard. Please try refreshing the page.
            </p>
          )}
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded text-sm text-red-300">
              <p className="font-medium">Error details:</p>
              <p className="mt-1">{error.message}</p>
            </div>
          )}
          <div className="flex gap-3">
            <a
              href="/client/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center"
            >
              Back to Login
            </a>
            <a
              href="/"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-center"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    )
  }
}

