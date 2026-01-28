import { createHash } from 'crypto'

export function hashIP(ip: string): string {
  const salt = process.env.IP_SALT || 'default-salt-change-me'
  return createHash('sha256').update(ip + salt).digest('hex')
}

export function getCountryFromHeaders(headers: Headers): string | null {
  // Try Vercel geolocation header first (if available)
  const vercelCountry = headers.get('x-vercel-ip-country')
  if (vercelCountry && vercelCountry !== 'XX') {
    return vercelCountry
  }

  // Try Cloudflare header (if using Cloudflare)
  const cfCountry = headers.get('cf-ipcountry')
  if (cfCountry && cfCountry !== 'XX') {
    return cfCountry
  }

  // Try Vercel IP country code (alternative header)
  const vercelCountryCode = headers.get('x-vercel-ip-country-code')
  if (vercelCountryCode && vercelCountryCode !== 'XX') {
    return vercelCountryCode
  }

  // Fallback: Try to get country from IP using free API (async, will be null for now)
  // This requires async function, so we'll handle it in the route handler if needed
  return null
}

// Async function to get country from IP using free API (fallback)
export async function getCountryFromIP(ip: string): Promise<string | null> {
  if (!ip) return null

  try {
    // Use ipapi.co free tier (1,000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/country_code/`, {
      headers: {
        'User-Agent': 'ClipSon-Affiliates-Tracker/1.0',
      },
    })

    if (response.ok) {
      const country = await response.text()
      const trimmedCountry = country.trim()
      if (trimmedCountry && trimmedCountry !== 'XX' && trimmedCountry.length === 2) {
        return trimmedCountry
      }
    }
  } catch (error) {
    console.error('Error fetching country from IP:', error)
  }

  return null
}

export function getIPFromHeaders(headers: Headers): string | null {
  // Try various headers for IP detection
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  return null
}

