import Link from 'next/link'
import Logo from '@/components/Logo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Logo size="xl" className="rounded-2xl" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          ClipSon Affiliates
        </h1>
        <p className="text-xl text-gray-300 mb-2">
          Professional Affiliate Tracking Platform
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Tracked Links • Conversion Attribution • Stripe Integration
        </p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

