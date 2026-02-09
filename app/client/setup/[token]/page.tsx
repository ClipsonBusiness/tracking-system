import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import ClientSetupForm from './ClientSetupForm'

export default async function ClientSetupPage({
  params,
}: {
  params: { token: string }
}) {
  const token = params.token

  if (!token) {
    redirect('/client/login?error=missing_token')
  }

  // Find client by access token - with error handling
  let client
  try {
    client = await prisma.client.findUnique({
      where: { clientAccessToken: token },
      select: {
        id: true,
        name: true,
        customDomain: true,
        stripeWebhookSecret: true,
        stripeAccountId: true,
        campaigns: {
          select: {
            id: true,
            name: true,
            destinationUrl: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })
  } catch (err: any) {
    console.error('Database error in client setup page:', err)
    // Check if it's a table missing error
    if (err?.code === 'P2021' || err?.message?.includes('does not exist')) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-8 shadow-xl">
              <h1 className="text-2xl font-bold text-yellow-400 mb-4">Database Setup Required</h1>
              <p className="text-gray-300 mb-4">
                The database tables need to be created. Please push the database schema first.
              </p>
              <form action="/api/admin/push-schema" method="POST">
                <button
                  type="submit"
                  className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  🔧 Push Database Schema
                </button>
              </form>
            </div>
          </div>
        </div>
      )
    }
    // For other errors, show generic error
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Setup Error</h1>
            <p className="text-gray-300 mb-4">
              There was an error loading the setup page. Please try again or contact support.
            </p>
            <a
              href="/client/login"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!client) {
    redirect('/client/login?error=invalid_token')
  }

  const latestCampaign = client.campaigns[0] || null

  // Get base URL from request headers (works in production)
  let appBaseUrl
  try {
    const headersList = await headers()
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    const host = headersList.get('host') || headersList.get('x-forwarded-host') || 'localhost:3000'
    appBaseUrl = process.env.APP_BASE_URL || `${protocol}://${host}`
  } catch (err) {
    console.error('Error getting headers:', err)
    appBaseUrl = process.env.APP_BASE_URL || 'https://www.clipsonaffiliates.com'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {client.name}! 👋
          </h1>
          <p className="text-gray-400 mb-8">
            Complete your setup to start tracking link clicks
          </p>

          <ClientSetupForm
            clientId={client.id}
            clientName={client.name}
            existingCustomDomain={client.customDomain}
            existingStripeWebhookSecret={client.stripeWebhookSecret}
            existingStripeAccountId={client.stripeAccountId}
            campaign={latestCampaign}
            token={token}
            appBaseUrl={appBaseUrl}
          />
        </div>
      </div>
    </div>
  )
}

