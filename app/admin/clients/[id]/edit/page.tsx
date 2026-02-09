import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClientEditForm from './ClientEditForm'

export default async function ClientEditPage({
  params,
}: {
  params: { id: string }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Client</h1>
          <p className="text-gray-400 mt-1">Update client information</p>
        </div>
        <a
          href="/admin/clients"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          ← Back to Clients
        </a>
      </div>

      <ClientEditForm client={client} />
    </div>
  )
}
