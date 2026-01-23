import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import GetStartedGuide from './GetStartedGuide'

export default async function GetStartedPage({
  searchParams,
}: {
  searchParams: { token?: string }
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
      stripeWebhookSecret: true,
      stripeConnectedAt: true,
      customDomain: true,
    },
  })

  if (!client) {
    redirect('/client/login?error=invalid_token')
  }

  const isStripeConnected = !!client.stripeWebhookSecret
  
  // Get base URL from request headers (works in production)
  const headersList = await headers()
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || 'localhost:3000'
  const appBaseUrl = process.env.APP_BASE_URL || `${protocol}://${host}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {client.name}! 👋
          </h1>
          <p className="text-gray-400 mb-8">
            Let&apos;s get you set up in just a few minutes
          </p>

          <GetStartedGuide
            clientId={client.id}
            clientName={client.name}
            isStripeConnected={isStripeConnected}
            appBaseUrl={appBaseUrl}
            customDomain={client.customDomain}
            token={token}
          />
        </div>
      </div>
    </div>
  )
}

