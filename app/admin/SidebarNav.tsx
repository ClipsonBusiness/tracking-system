'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SidebarNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin/links', label: 'Links' },
    { href: '/admin/campaigns', label: 'Campaigns' },
    { href: '/admin/affiliates', label: 'Affiliates' },
    { href: '/admin/analytics', label: 'Statistics' },
    { href: '/admin/clients', label: 'Clients' },
  ]

  return (
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

