import { createHash } from 'crypto'

export function hashIP(ip: string): string {
  const salt = process.env.IP_SALT || 'default-salt-change-me'
  return createHash('sha256').update(ip + salt).digest('hex')
}

export function getCountryFromHeaders(headers: Headers): string | null {
  // Best effort country detection
  // Can be improved later with Cloudflare headers (CF-IPCountry) or other services
  const cfCountry = headers.get('cf-ipcountry')
  if (cfCountry && cfCountry !== 'XX') {
    return cfCountry
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

