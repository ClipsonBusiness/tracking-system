import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import ClientSettings from './ClientSettings'

export default async function SettingsPage() {
  await requireAdminAuth()
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      customDomain: true,
      stripeAccountId: true,
      stripeWebhookSecret: true,
      stripeConnectedAt: true,
      clientAccessToken: true,
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Custom Domain Configuration</h2>
          <p className="text-sm text-gray-400 mt-2">
            Configure custom domains for your clients. Links will be accessible at{' '}
            <code className="text-blue-400">https://yourdomain.com/slug</code>
          </p>
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
              <p className="text-sm text-green-300">
                <strong>✅ EASIEST:</strong> Use your tracking server&apos;s domain - no DNS setup needed!
              </p>
              <p className="text-xs text-green-400 mt-1">
                Just deploy and create links: <code>your-app.vercel.app/slug</code> - works immediately, zero setup!
              </p>
            </div>
            <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <p className="text-sm text-yellow-300">
                <strong>Client Has Custom Domain?</strong> No problem! Use one of these (no DNS needed):
              </p>
              <ul className="text-xs text-yellow-400 mt-2 list-disc list-inside space-y-1">
                <li><strong>JavaScript redirect</strong> (easiest) - Client just adds script to their website</li>
                <li><strong>Reverse proxy</strong> (best for servers) - Client adds nginx/apache config</li>
                <li><strong>Cloudflare Worker</strong> (if using Cloudflare) - Client deploys Worker script</li>
                <li><strong>Subdomain</strong> (easiest DNS) - Use links.lowbackability.com</li>
              </ul>
              <p className="text-xs text-yellow-400 mt-2">
                See CLIENT_CUSTOM_DOMAINS.md for scripts and instructions you can provide to clients.
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ClientSettings clients={clients} />
        </div>
      </div>
    </div>
  )
}

