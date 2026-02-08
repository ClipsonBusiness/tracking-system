import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

// SECURITY: Require ADMIN_PASSWORD to be set in production
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'admin')

// SECURITY: Generate a secure session token instead of storing password
function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export async function checkAdminAuth(): Promise<boolean> {
  // SECURITY: In production, require ADMIN_PASSWORD to be set
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSWORD) {
    console.error('SECURITY ERROR: ADMIN_PASSWORD must be set in production!')
    return false
  }
  
  const cookieStore = await cookies()
  
  // SECURITY: Clear old admin_auth cookie if it exists (migration from old system)
  const oldCookie = cookieStore.get('admin_auth')
  if (oldCookie) {
    cookieStore.set('admin_auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    return false // Force re-login with new system
  }
  
  const sessionToken = cookieStore.get('admin_session')?.value
  
  if (!sessionToken) {
    return false
  }
  
  try {
    // Check session in database (works across serverless instances)
    const session = await prisma.adminSession.findUnique({
      where: { token: sessionToken },
    })
    
    if (!session) {
      return false
    }
    
    // Check if expired
    if (session.expiresAt < new Date()) {
      // Delete expired session
      await prisma.adminSession.delete({
        where: { token: sessionToken },
      }).catch(() => {}) // Ignore errors
      return false
    }
    
    return true
  } catch (error: any) {
    // If table doesn't exist, fall back to cookie-only check
    if (error?.code === 'P2021' || error?.message?.includes('does not exist') || error?.message?.includes('relation') || error?.message?.includes('table')) {
      console.warn('⚠️ admin_sessions table missing, using cookie-only auth. Run: npx prisma db push')
      // If cookie exists, allow access (fallback mode)
      return true
    }
    console.error('Error checking admin auth:', error)
    return false
  }
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
  const expiresAt = new Date(Date.now() + (60 * 60 * 24 * 7 * 1000)) // 7 days
  
  // Store session in database (works across serverless instances)
  try {
    await prisma.adminSession.create({
      data: {
        token: sessionToken,
        expiresAt: expiresAt,
      },
    })
    
    // Clean up expired sessions periodically (run async, don't wait)
    prisma.adminSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    }).catch(() => {}) // Ignore errors
    
    console.log('✅ Admin session stored in database')
  } catch (error: any) {
    console.error('Error storing admin session:', error)
    // Log more details about the error
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    })
    
    // Check if it's a table doesn't exist error
    if (error?.code === 'P2021' || error?.message?.includes('does not exist') || error?.message?.includes('relation') || error?.message?.includes('table')) {
      console.error('❌ CRITICAL: admin_sessions table does not exist!')
      console.error('Please run: npx prisma db push')
      // Still set the cookie so login can work, but warn about it
      const cookieStore = await cookies()
      cookieStore.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
      console.warn('⚠️ Using cookie-only session (database table missing). Run: npx prisma db push')
      return
    }
    
    // If it's a unique constraint violation - session token already exists (very unlikely)
    if (error?.code === 'P2002') {
      console.error('Session token collision - generating new token')
      // Retry with a new token
      const newToken = generateSessionToken()
      try {
        await prisma.adminSession.create({
          data: {
            token: newToken,
            expiresAt: expiresAt,
          },
        })
        const cookieStore = await cookies()
        cookieStore.set('admin_session', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
        console.log('✅ Admin session stored with new token')
        return
      } catch (retryError) {
        // If retry also fails, fall back to cookie-only
        console.error('Retry also failed, using cookie-only session')
        const cookieStore = await cookies()
        cookieStore.set('admin_session', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
        return
      }
    }
    
    // For other errors, still try to set cookie as fallback
    console.error('Database session storage failed, using cookie-only fallback')
    const cookieStore = await cookies()
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    // Don't throw - allow login to proceed with cookie-only session
    return
  }
  
  const cookieStore = await cookies()
  
  // SECURITY: Clear old admin_auth cookie if it exists (migration from old system)
  const oldCookie = cookieStore.get('admin_auth')
  if (oldCookie) {
    cookieStore.set('admin_auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    })
  }
  
  // Set new secure session cookie
  cookieStore.set('admin_session', sessionToken, {
    httpOnly: true, // Prevents JavaScript access - cookie is invisible to JS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // Changed from 'strict' to 'lax' to allow redirects after login
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/', // Changed from '/admin' to '/' to ensure cookie is available on all routes
  })
  
  console.log('✅ Admin session cookie set')
}

export async function clearAdminAuth() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('admin_session')?.value
  
  // Delete session from database
  if (sessionToken) {
    await prisma.adminSession.deleteMany({
      where: { token: sessionToken },
    }).catch(() => {}) // Ignore errors
  }
  
  // Delete cookie with same settings as when it was set
  cookieStore.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/', // Match the path used when setting the cookie
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
