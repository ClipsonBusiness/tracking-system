import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ClientDNSConfig from './ClientDNSConfig'

export default async function ClientDNSPage({
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
      dnsScreenshot: true,
    },
  })

  if (!client) {
    redirect('/client/login?error=invalid_token')
  }

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
          <h1 className="text-3xl font-bold text-white">DNS Configuration</h1>
          <p className="text-gray-400 mt-1">Configure your custom domain for tracking links</p>
        </div>

        <ClientDNSConfig client={client} token={token} />
      </div>
    </div>
  )
}

