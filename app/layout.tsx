import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tracking System',
  description: 'Tracked Links + Affiliate Attribution for Stripe Subscriptions',
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
