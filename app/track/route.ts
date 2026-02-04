import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashIP, getIPFromHeaders, getCountryFromHeaders, getCountryFromIP, getCityFromHeaders, getCityFromIP } from '@/lib/utils'
import { cookies } from 'next/headers'

// Route handler for tracking links with ?ref= query parameters
// Handles: tracking-server.com/track?ref=xxxx
// Can be called directly (redirects) or via beacon (just records click)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Check for ?ref= parameter
    const refParam = searchParams.get('ref')
    
    if (!refParam) {
      return new NextResponse('Missing ref parameter', { status: 400 })
    }

    const actualSlug = refParam
    
    // Check if this is a beacon request (from JavaScript snippet)
    // Beacons typically have specific headers or we can check for redirect=false
    const isBeacon = searchParams.get('beacon') === 'true' || 
                     request.headers.get('user-agent')?.includes('beacon') ||
                     request.headers.get('purpose') === 'prefetch'
    
    // Debug logging
    console.log('Track route hit with ref:', { actualSlug, isBeacon })
    
    // Find link by slug (direct lookup, no custom domain filtering needed here)
    const link = await prisma.link.findFirst({
      where: { slug: actualSlug },
      select: { id: true, clientId: true, destinationUrl: true, slug: true },
    })
    
    if (!link) {
      console.log('Link not found for slug:', actualSlug)
      return new NextResponse('Link not found', { status: 404 })
    }

    console.log('Found link by slug:', actualSlug)
    
    // If beacon request, just record click and return OK (no redirect)
    if (isBeacon) {
      await recordClick(request, link)
      return new NextResponse('OK', { status: 200 })
    }
    
    // Otherwise, redirect to destination (direct link visit)
    return handleLinkRedirect(request, link)
  } catch (error) {
    console.error('Error in track route redirect:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Extract click recording logic to a separate function
async function recordClick(
  request: NextRequest,
  link: { id: string; clientId: string; destinationUrl: string; slug: string }
) {
  const searchParams = request.nextUrl.searchParams
  const cookieStore = await cookies()
  
  // Get affiliate code if present
  const affFromQuery = searchParams.get('aff')
  const affFromCookie = cookieStore.get('aff_code')?.value
  let affiliateCode: string | null = affFromQuery || affFromCookie || null

  // Capture click analytics
  const headers = request.headers
  const ip = getIPFromHeaders(headers)
  const ipHash = ip ? hashIP(ip) : null
  
  // Try to get country from headers first, then fallback to IP lookup
  let country = getCountryFromHeaders(headers)
  if (!country && ip) {
    country = await getCountryFromIP(ip)
  }
  
  // Try to get city from headers first, then fallback to IP lookup
  let city = getCityFromHeaders(headers)
  if (!city && ip) {
    city = await getCityFromIP(ip)
  }
  
  const referer = headers.get('referer') || null
  const userAgent = headers.get('user-agent') || null

  // Extract UTM parameters
  const utmSource = searchParams.get('utm_source') || null
  const utmMedium = searchParams.get('utm_medium') || null
  const utmCampaign = searchParams.get('utm_campaign') || null

  // Store click
  try {
    await prisma.click.create({
      data: {
        linkId: link.id,
        clientId: link.clientId,
        referer,
        userAgent,
        ipHash,
        country,
        city,
        utmSource,
        utmMedium,
        utmCampaign,
        affiliateCode,
      },
    })
    console.log('Click stored successfully for link:', link.id)
  } catch (err) {
    console.error('Error storing click:', err)
    throw err
  }
}

async function handleLinkRedirect(
  request: NextRequest,
  link: { id: string; clientId: string; destinationUrl: string; slug: string }
) {
  const searchParams = request.nextUrl.searchParams
  const cookieStore = await cookies()
  
  // Get affiliate code from query param or cookie
  const affFromQuery = searchParams.get('aff')
  const affFromCookie = cookieStore.get('aff_code')?.value

  let affiliateCode: string | null = affFromQuery || affFromCookie || null

  // If affiliate code from query param, set cookie with 60-day expiry
  if (affFromQuery) {
    cookieStore.set('aff_code', affFromQuery, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60, // 60 days
    })
    affiliateCode = affFromQuery
  }

  // Store link slug in cookie for conversion attribution
  // This allows us to attribute sales to the specific clipper link
  if (link.slug) {
    cookieStore.set('link_slug', link.slug, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60, // 60 days
    })
  }

  // Record the click (reuse the function)
  try {
    await recordClick(request, link)
  } catch (err) {
    console.error('Error storing click:', err)
    // Continue with redirect even if click storage fails
  }

  // Redirect to destination
  return NextResponse.redirect(link.destinationUrl, { status: 302 })
}

