'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Campaign {
  id: string
  name: string
  customDomain: string | null
}

export default function ClipperPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [error, setError] = useState('')
  const [generatedLink, setGeneratedLink] = useState<{ link: string; dashboardCode: string } | null>(null)

  useEffect(() => {
    // Load campaigns
    fetch('/api/clipper/campaigns')
      .then(res => res.json())
      .then(data => {
        if (data.campaigns) {
          setCampaigns(data.campaigns)
        }
      })
      .catch(err => console.error('Failed to load campaigns:', err))
      .finally(() => setLoadingCampaigns(false))
  }, [])

  async function handleGenerateLink() {
    if (!selectedCampaignId) {
      setError('Please select a campaign')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/clipper/generate-link?campaignId=${encodeURIComponent(selectedCampaignId)}`)
      const data = await res.json()

      if (res.ok) {
        setGeneratedLink({
          link: data.link,
          dashboardCode: data.dashboardCode,
        })
      } else {
        setError(data.error || 'Failed to generate link')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-2">Clipper Dashboard</h1>
          <p className="text-gray-400 mb-8">Generate your unique tracking link</p>

          <div className="space-y-6">
            {/* Generate Link Section */}
            <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
              <h2 className="text-xl font-semibold text-white mb-4">Get Your Tracking Link</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="campaign" className="block text-sm font-medium text-gray-300 mb-2">
                    Select Campaign
                  </label>
                  <select
                    id="campaign"
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    disabled={loadingCampaigns}
                    className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">{loadingCampaigns ? 'Loading campaigns...' : 'Choose a campaign'}</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name} {campaign.customDomain && `(${campaign.customDomain})`}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGenerateLink}
                  disabled={loading || !selectedCampaignId}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate My Link'}
                </button>

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {generatedLink && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                      <p className="text-sm text-green-300 mb-2 font-semibold">Your Unique Link:</p>
                      <div className="flex items-center gap-2">
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
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                      <p className="text-sm text-blue-300 mb-2 font-semibold">Your Dashboard Code:</p>
                      <p className="text-xs text-blue-400 mb-3">
                        Save this code to view your analytics dashboard!
                      </p>
                      <div className="flex items-center gap-2">
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
                      <button
                        onClick={() => {
                          router.push(`/clipper/dashboard?code=${generatedLink.dashboardCode}`)
                        }}
                        className="w-full mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                      >
                        Go to Dashboard →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dashboard Link */}
            <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
              <h2 className="text-xl font-semibold text-white mb-4">View Your Stats</h2>
              <p className="text-gray-400 mb-4">
                See your clicks, sales, and performance metrics
              </p>
              <button
                onClick={() => router.push('/clipper/dashboard/enter')}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Enter Dashboard Code →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

