import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function LinkInBioPage({
  params,
  searchParams,
}: {
  params: { handle: string }
  searchParams?: { client?: string }
}) {
  const handle = params.handle

  // If custom domain is used, filter by client
  // Otherwise show all links with this handle
  const links = await prisma.link.findMany({
    where: { handle },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  })

  if (links.length === 0) {
    notFound()
  }

  // Get client from custom domain if available
  // This ensures each client's link-in-bio only shows their links
  // For now, we show all links with the handle, but this can be enhanced

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          @{handle}
        </h1>
        <div className="space-y-4">
          {links.map((link) => {
            // Use clean URL (no /l/ prefix) or custom domain if available
            const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000'
            const customDomain = link.client?.customDomain
            const linkUrl = customDomain && customDomain.trim() !== ''
              ? `https://${customDomain}/${link.slug}`
              : `${baseUrl.replace(/\/l$/, '')}/${link.slug}`
            
            return (
              <a
                key={link.id}
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-center text-lg font-semibold text-blue-600 hover:text-blue-700"
              >
                {link.destinationUrl.length > 50 
                  ? link.destinationUrl.substring(0, 50) + '...'
                  : link.destinationUrl}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

