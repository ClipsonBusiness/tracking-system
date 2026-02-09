import { requireAdminAuth } from '@/lib/auth'
import Link from 'next/link'
import SidebarNav from './SidebarNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdminAuth()

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">TRACKING</h1>
        </div>
        <SidebarNav />
        <div className="p-4 border-t border-gray-700">
          <Link
            href="/login"
            className="block text-sm text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

