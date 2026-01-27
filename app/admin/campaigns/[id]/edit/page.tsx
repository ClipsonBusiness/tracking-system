import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CampaignEditForm from './CampaignEditForm'

export default async function EditCampaignPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdminAuth()

  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      client: {
        select: { id: true, name: true },
      },
    },
  })

  if (!campaign) {
    redirect('/admin/campaigns')
  }

  const clients = await prisma.client.findMany()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Campaign</h1>
          <p className="text-gray-400 mt-1">Update campaign information</p>
        </div>
        <Link
          href="/admin/campaigns"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          ← Back to Campaigns
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <CampaignEditForm campaign={campaign} clients={clients} />
      </div>
    </div>
  )
}

