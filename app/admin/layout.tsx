import { requireAdminAuth } from '@/lib/auth'
import Link from 'next/link'
import SidebarNav from './SidebarNav'
import Logo from '@/components/Logo'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdminAuth()

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            <div>
              <h1 className="text-xl font-bold text-white">ClipSon</h1>
              <p className="text-xs text-gray-400">Affiliates</p>
            </div>
          </div>
        </div>
        <SidebarNav />
        <div className="p-4 border-t border-gray-700">
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="block w-full text-left text-sm text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </form>
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

