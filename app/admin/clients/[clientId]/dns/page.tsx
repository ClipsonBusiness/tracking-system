import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DNSConfigForm from './DNSConfigForm'

export default async function ClientDNSPage({
  params,
}: {
  params: { clientId: string }
}) {
  await requireAdminAuth()

  const client = await prisma.client.findUnique({
    where: { id: params.clientId },
    select: {
      id: true,
      name: true,
      customDomain: true,
    },
  })

  if (!client) {
    redirect('/admin/clients')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">DNS Configuration</h1>
          <p className="text-gray-400 mt-1">Manage DNS settings for {client.name}</p>
        </div>
        <a
          href={`/admin/clients/${client.id}/dashboard`}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          ← Back to Dashboard
        </a>
      </div>

      <DNSConfigForm client={client} />
    </div>
  )
}

