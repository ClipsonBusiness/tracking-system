'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

interface Campaign {
  id: string
  name: string
  customDomain: string | null
}

export default function ClipperPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [discordUsername, setDiscordUsername] = useState('')
  const [socialMediaPage, setSocialMediaPage] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<{
    link: string
    campaignName: string
    slug: string
    dashboardCode: string
  } | null>(null)
  const [error, setError] = useState('')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)

  // Check for error in URL params on mount
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'invalid_code') {
      setError('Invalid dashboard code. Please check your code and try again.')
      // Clean up URL by removing error param
      router.replace('/clipper', { scroll: false })
    }
  }, [searchParams, router])

  // Load campaigns on mount
  useEffect(() => {
    fetch('/api/clipper/campaigns')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else if (data.campaigns) {
          setCampaigns(data.campaigns)
        }
      })
      .catch(() => setError('Failed to load campaigns'))
      .finally(() => setLoadingCampaigns(false))
  }, [])

  async function handleGenerateLink() {
    if (!selectedCampaignId) {
      setError('Please select a campaign')
      return
    }

    if (!discordUsername.trim()) {
      setError('Please enter your Discord username')
      return
    }

    if (!socialMediaPage.trim()) {
      setError('Please enter your social media page')
      return
    }

    setGenerating(true)
    setError('')

    try {
      const res = await fetch(`/api/clipper/generate-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          discordUsername: discordUsername.trim(),
          socialMediaPage: socialMediaPage.trim(),
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setGeneratedLink(data)
      } else {
        setError(data.error || 'Failed to generate link')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo size="xl" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            ClipSon Affiliates
          </h1>
          <p className="text-gray-300 text-lg mb-1">Clipper Portal</p>
          <p className="text-gray-400">Generate your unique tracking links</p>
        </div>

        {/* Quick Access to Dashboard */}
        <div className="mb-6 bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">📊 View Your Dashboard</h2>
              <p className="text-sm text-gray-400">Already have a dashboard code? View your analytics</p>
            </div>
            <Link
              href="/clipper/dashboard/enter"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Go to Dashboard →
            </Link>
          </div>
        </div>

        {/* Generate Link Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Generate New Link</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="campaign" className="block text-sm font-medium text-gray-300 mb-2">
                Select Campaign *
              </label>
              <select
                id="campaign"
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                disabled={loadingCampaigns}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
              >
                <option value="">{loadingCampaigns ? 'Loading campaigns...' : 'Choose a campaign...'}</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name} {campaign.customDomain && `(${campaign.customDomain})`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Select the campaign you want to generate a link for
              </p>
            </div>

            <div>
              <label htmlFor="discordUsername" className="block text-sm font-medium text-gray-300 mb-2">
                Discord Username *
              </label>
              <input
                id="discordUsername"
                type="text"
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="e.g., username#1234 or @username"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Your Discord username so we can identify you
              </p>
            </div>

            <div>
              <label htmlFor="socialMediaPage" className="block text-sm font-medium text-gray-300 mb-2">
                Social Media Page *
              </label>
              <input
                id="socialMediaPage"
                type="text"
                value={socialMediaPage}
                onChange={(e) => setSocialMediaPage(e.target.value)}
                placeholder="e.g., @twitterhandle, instagram.com/username, or tiktok.com/@username"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Your Twitter/X, Instagram, TikTok, or other social media handle/URL
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerateLink}
              disabled={generating || !selectedCampaignId || !discordUsername.trim() || !socialMediaPage.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {generating ? 'Generating...' : 'Generate Link'}
            </button>

            {generatedLink && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                  <p className="text-sm text-green-300 mb-2 font-semibold">✅ Link Generated!</p>
                  <p className="text-xs text-green-400 mb-3">Campaign: {generatedLink.campaignName}</p>
                  {generatedLink.link.includes('tracking-system-production') && (
                    <div className="mb-3 p-2 bg-yellow-900/20 border border-yellow-700 rounded">
                      <p className="text-xs text-yellow-300">
                        ⚠️ <strong>Note:</strong> This link uses the Railway domain. For a professional custom domain (e.g., lowbackability.com/xxxxx), set a custom domain in the campaign settings.
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <code className="flex-1 px-3 py-2 bg-gray-800 rounded text-green-400 text-sm break-all">
                      {generatedLink.link}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLink.link)
                        alert('Link copied!')
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-300 mb-2 font-semibold">Your Dashboard Code:</p>
                  <p className="text-xs text-blue-400 mb-3">
                    Save this code to view your analytics dashboard!
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="flex-1 px-3 py-2 bg-gray-800 rounded text-blue-400 text-2xl font-bold text-center tracking-wider">
                      {generatedLink.dashboardCode}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLink.dashboardCode)
                        alert('Dashboard code copied!')
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                    >
                      Copy Code
                    </button>
                  </div>
                  <Link
                    href={`/clipper/dashboard?code=${generatedLink.dashboardCode}`}
                    className="block w-full mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm text-center"
                  >
                    Go to Dashboard →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
