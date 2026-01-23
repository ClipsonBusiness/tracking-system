'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
  customDomain: string | null
}

export default function DNSConfigForm({ 
  client, 
  initialDomain 
}: { 
  client: Client
  initialDomain?: string 
}) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    customDomain: initialDomain || client.customDomain || '',
    dnsType: 'CNAME',
    dnsValue: 'tracking-system-production-d23c.up.railway.app',
    dnsName: '@',
    dnsTtl: '3600',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/admin/clients/${client.id}/dns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSuccess('DNS configuration saved successfully!')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save DNS configuration')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const railwayUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'tracking-system-production-d23c.up.railway.app'

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">📋 Setup Instructions</h2>
        <ol className="space-y-3 text-sm text-gray-300">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <p className="font-medium">Ask client to add DNS record at their domain registrar</p>
              <p className="text-gray-400 mt-1">They can send you a screenshot or the DNS details</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <p className="font-medium">Enter the DNS record details below</p>
              <p className="text-gray-400 mt-1">This is for your reference and tracking</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <p className="font-medium">Wait for DNS propagation (1-24 hours)</p>
              <p className="text-gray-400 mt-1">Usually works within a few hours</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <div>
              <p className="font-medium">Test the link</p>
              <p className="text-gray-400 mt-1">Visit {formData.customDomain || 'domain.com'}/ref=xxxx to verify</p>
            </div>
          </li>
        </ol>
      </div>

      {/* DNS Record Template */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">📧 Email Template for Client</h2>
        <div className="bg-gray-900 rounded p-4 mb-4">
          <p className="text-xs text-gray-400 mb-2">Copy and send this to your client:</p>
          <div className="bg-black rounded p-4 font-mono text-xs text-green-400 overflow-x-auto">
            <p className="mb-2">Hi,</p>
            <p className="mb-2">To enable custom domain tracking, please add this DNS record:</p>
            <p className="mb-2">---</p>
            <p className="mb-1"><span className="text-gray-500">Type:</span> {formData.dnsType}</p>
            <p className="mb-1"><span className="text-gray-500">Name:</span> {formData.dnsName} (or leave blank for root domain)</p>
            <p className="mb-1"><span className="text-gray-500">Value:</span> {formData.dnsValue}</p>
            <p className="mb-1"><span className="text-gray-500">TTL:</span> {formData.dnsTtl} (or default)</p>
            <p className="mb-2">---</p>
            <p className="mb-2">Once added, please send me a screenshot or confirmation.</p>
            <p>Thanks!</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const text = `Hi,\n\nTo enable custom domain tracking, please add this DNS record:\n\nType: ${formData.dnsType}\nName: ${formData.dnsName} (or leave blank for root domain)\nValue: ${formData.dnsValue}\nTTL: ${formData.dnsTtl} (or default)\n\nOnce added, please send me a screenshot or confirmation.\n\nThanks!`
            navigator.clipboard.writeText(text)
            alert('Email template copied to clipboard!')
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          📋 Copy Email Template
        </button>
      </div>

      {/* DNS Configuration Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">DNS Record Details</h2>
        
        <div>
          <label htmlFor="customDomain" className="block text-sm font-medium text-gray-300 mb-2">
            Custom Domain *
          </label>
          <input
            id="customDomain"
            type="text"
            value={formData.customDomain}
            onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
            placeholder="lowbackability.com"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            The domain your client wants to use (e.g., lowbackability.com)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dnsType" className="block text-sm font-medium text-gray-300 mb-2">
              DNS Type *
            </label>
            <select
              id="dnsType"
              value={formData.dnsType}
              onChange={(e) => setFormData({ ...formData, dnsType: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CNAME">CNAME</option>
              <option value="A">A Record</option>
            </select>
          </div>

          <div>
            <label htmlFor="dnsName" className="block text-sm font-medium text-gray-300 mb-2">
              DNS Name *
            </label>
            <input
              id="dnsName"
              type="text"
              value={formData.dnsName}
              onChange={(e) => setFormData({ ...formData, dnsName: e.target.value })}
              placeholder="@ or leave blank"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Usually &quot;@&quot; for root domain</p>
          </div>
        </div>

        <div>
          <label htmlFor="dnsValue" className="block text-sm font-medium text-gray-300 mb-2">
            DNS Value / Target *
          </label>
          <input
            id="dnsValue"
            type="text"
            value={formData.dnsValue}
            onChange={(e) => setFormData({ ...formData, dnsValue: e.target.value })}
            placeholder="tracking-system-production-d23c.up.railway.app"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Your Railway domain or IP address
          </p>
        </div>

        <div>
          <label htmlFor="dnsTtl" className="block text-sm font-medium text-gray-300 mb-2">
            TTL (Time To Live)
          </label>
          <input
            id="dnsTtl"
            type="text"
            value={formData.dnsTtl}
            onChange={(e) => setFormData({ ...formData, dnsTtl: e.target.value })}
            placeholder="3600"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Usually 3600 (1 hour) or default</p>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Client sent DNS record on Jan 18, 2025. Waiting for propagation..."
            rows={4}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Track status, dates, or any notes about this DNS setup
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save DNS Configuration'}
        </button>
      </form>

      {/* Current Configuration Display */}
      {client.customDomain && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current Configuration</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Domain:</span>
              <span className="text-white font-mono">{client.customDomain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Link Format:</span>
              <span className="text-white font-mono">{client.customDomain}/ref=xxxx</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

