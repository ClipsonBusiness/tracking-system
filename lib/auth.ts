import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHash, randomBytes } from 'crypto'

// SECURITY: Require ADMIN_PASSWORD to be set in production
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'admin')

// SECURITY: Generate a secure session token instead of storing password
function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

// SECURITY: Create a hash of the password + session token for verification
function createAuthHash(password: string, sessionToken: string): string {
  return createHash('sha256').update(`${password}:${sessionToken}`).digest('hex')
}

// Store active sessions in memory (in production, use Redis or database)
const activeSessions = new Map<string, { expiresAt: number }>()

export async function checkAdminAuth(): Promise<boolean> {
  // SECURITY: In production, require ADMIN_PASSWORD to be set
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSWORD) {
    console.error('SECURITY ERROR: ADMIN_PASSWORD must be set in production!')
    return false
  }
  
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('admin_session')?.value
  
  if (!sessionToken) {
    return false
  }
  
  // Check if session exists and is not expired
  const session = activeSessions.get(sessionToken)
  if (!session || session.expiresAt < Date.now()) {
    activeSessions.delete(sessionToken)
    return false
  }
  
  return true
}

export async function requireAdminAuth() {
  const isAuthenticated = await checkAdminAuth()
  if (!isAuthenticated) {
    redirect('/login')
  }
}

export async function setAdminAuth(password: string) {
  // SECURITY: Don't store password in cookie - use session token instead
  const sessionToken = generateSessionToken()
  const expiresAt = Date.now() + (60 * 60 * 24 * 7 * 1000) // 7 days
  
  // Store session (in production, use Redis or database)
  activeSessions.set(sessionToken, { expiresAt })
  
  // Clean up expired sessions periodically
  if (activeSessions.size > 1000) {
    const now = Date.now()
    for (const [token, session] of activeSessions.entries()) {
      if (session.expiresAt < now) {
        activeSessions.delete(token)
      }
    }
  }
  
  const cookieStore = await cookies()
  cookieStore.set('admin_session', sessionToken, {
    httpOnly: true, // Prevents JavaScript access - cookie is invisible to JS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // Prevents CSRF attacks - cookie only sent on same-site requests
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/admin', // Only sent for /admin routes, not visible on client domains
  })
}

export async function clearAdminAuth() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('admin_session')?.value
  if (sessionToken) {
    activeSessions.delete(sessionToken)
  }
  cookieStore.delete('admin_session')
}

const CAMPAIGN_MANAGER_PASSWORD = process.env.CAMPAIGN_MANAGER_PASSWORD || 'clipsonadmin'

export async function checkCampaignManagerAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const campaignManagerAuth = cookieStore.get('campaign_manager_auth')
  return campaignManagerAuth?.value === CAMPAIGN_MANAGER_PASSWORD
}

export async function requireCampaignManagerAuth() {
  const isAuthenticated = await checkCampaignManagerAuth()
  if (!isAuthenticated) {
    redirect('/login')
  }
}

// Client authentication
export async function checkClientAuth(): Promise<string | null> {
  const cookieStore = await cookies()
  const clientId = cookieStore.get('client_id')
  return clientId?.value || null
}

export async function requireClientAuth() {
  const clientId = await checkClientAuth()
  if (!clientId) {
    redirect('/client/login')
  }
  return clientId
}

export async function setClientAuth(clientId: string) {
  const cookieStore = await cookies()
  cookieStore.set('client_id', clientId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}
