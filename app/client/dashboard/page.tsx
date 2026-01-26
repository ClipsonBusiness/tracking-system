import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StripeConnect from './StripeConnect'
import StripeConnectManual from './StripeConnectManual'
import ClientDetailsForm from './ClientDetailsForm'

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string; success?: string }
}) {
  const token = searchParams.token

  if (!token) {
    redirect('/client/login')
  }

  // Find client by access token
  const client = await prisma.client.findUnique({
    where: { clientAccessToken: token },
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
    redirect('/client/login?error=invalid_token')
  }

  // Connected if they have either account ID (OAuth) or webhook secret (manual)
  const isStripeConnected = !!(client.stripeAccountId || client.stripeWebhookSecret)

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

            {/* DNS Configuration Section */}
            <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">DNS Configuration</h2>
                <Link
                  href={`/client/dns?token=${token}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  {client.customDomain ? 'Edit DNS' : 'Configure DNS'}
                </Link>
              </div>
              {client.customDomain ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Custom Domain:</span>
                    <span className="text-white font-mono">{client.customDomain}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Link Format:</span>
                    <span className="text-white font-mono">{client.customDomain}/xxxxx</span>
                  </div>
                  <p className="text-xs text-green-400 mt-2">✅ Custom domain configured</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 text-sm mb-2">
                    Configure your custom domain to use professional tracking links
                  </p>
                  <p className="text-xs text-gray-500">
                    Example: yourdomain.com/xxxxx instead of tracking-system.railway.app/xxxxx
                  </p>
                </div>
              )}
            </div>

            {/* Client Details Section */}
            <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
              <h2 className="text-xl font-semibold text-white mb-4">Your Details</h2>
              <ClientDetailsForm
                clientId={client.id}
                currentName={client.name}
                currentCustomDomain={client.customDomain}
                token={token}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

