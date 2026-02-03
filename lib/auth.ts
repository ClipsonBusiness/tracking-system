import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')
  return adminAuth?.value === ADMIN_PASSWORD
}

export async function requireAdminAuth() {
  const isAuthenticated = await checkAdminAuth()
  if (!isAuthenticated) {
    redirect('/login')
  }
}

export async function setAdminAuth(password: string) {
  const cookieStore = await cookies()
  cookieStore.set('admin_auth', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
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
