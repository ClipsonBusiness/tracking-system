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

  // Find client by access token
  const client = await prisma.client.findUnique({
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

  if (!client) {
    redirect('/client/login?error=invalid_token')
  }

  const latestCampaign = client.campaigns[0] || null

  // Get base URL from request headers (works in production)
  const headersList = await headers()
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || 'localhost:3000'
  const appBaseUrl = process.env.APP_BASE_URL || `${protocol}://${host}`

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

