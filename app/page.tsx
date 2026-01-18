import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold text-white mb-4">
          TRACKING
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Tracked Links + Affiliate Attribution for Stripe Subscriptions
        </p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

