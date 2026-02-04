import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import JavaScriptRedirectGuide from './JavaScriptRedirectGuide'

export default async function JavaScriptRedirectPage({
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
      customDomain: true,
    },
  })

  if (!client) {
    redirect('/client/login?error=invalid_token')
  }

  if (!client.customDomain) {
    redirect(`/client/dashboard?token=${token}`)
  }

  // Get base URL from request headers (works in production)
  const headersList = await headers()
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || 'localhost:3000'
  const trackingServerUrl = process.env.APP_BASE_URL || `${protocol}://${host}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <a
            href={`/client/dashboard?token=${token}`}
            className="text-blue-400 hover:text-blue-300 text-sm inline-block mb-4"
          >
            ← Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold text-white">Cookie-Based Tracking Setup</h1>
          <p className="text-gray-400 mt-1">
            No DNS changes needed! Add this script to your website
          </p>
        </div>

        <JavaScriptRedirectGuide
          customDomain={client.customDomain}
          trackingServerUrl={trackingServerUrl}
        />
      </div>
    </div>
  )
}

