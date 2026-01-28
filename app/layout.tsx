import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClipSon Affiliates - Professional Affiliate Tracking Platform',
  description: 'Tracked Links • Conversion Attribution • Stripe Integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

