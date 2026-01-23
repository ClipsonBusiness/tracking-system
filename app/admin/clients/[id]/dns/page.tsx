import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DNSConfigForm from './DNSConfigForm'
import { Suspense } from 'react'

export default async function ClientDNSPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { domain?: string }
}) {
  await requireAdminAuth()

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      customDomain: true,
    },
  })

  if (!client) {
    redirect('/admin/clients')
  }

  // If domain is passed in query, use it (from campaign creation)
  const domainFromQuery = searchParams.domain

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

      <DNSConfigForm client={client} initialDomain={domainFromQuery} />
    </div>
  )
}

