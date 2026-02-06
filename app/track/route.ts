import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashIP, getIPFromHeaders, getCountryFromHeaders, getCountryFromIP, getCityFromHeaders, getCityFromIP } from '@/lib/utils'
import { cookies } from 'next/headers'

// CORS headers for cross-origin beacon requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

// Route handler for tracking links with ?ref= query parameters
// Handles: tracking-server.com/track?ref=xxxx
// Can be called directly (redirects) or via beacon (just records click)
// Supports both GET (direct visits) and POST (beacon requests)
async function handleTrackRequest(request: NextRequest, method: string) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Check for ?ref= parameter
    const refParam = searchParams.get('ref')
    
    if (!refParam) {
      return new NextResponse('Missing ref parameter', { status: 400 })
    }

    const actualSlug = refParam
    
    // POST requests are always beacon requests (from navigator.sendBeacon)
    // GET requests with beacon=true are also beacon requests
    const isBeacon = method === 'POST' || 
                     searchParams.get('beacon') === 'true' || 
                     request.headers.get('user-agent')?.includes('beacon') ||
                     request.headers.get('purpose') === 'prefetch'
    
    // Debug logging
    console.log('Track route hit with ref:', { actualSlug, isBeacon, method })
    
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
      console.log('Beacon request detected, recording click for slug:', actualSlug, 'linkId:', link.id)
      try {
        await recordClick(request, link)
        console.log('✅ Click recorded successfully for slug:', actualSlug)
        // Return with CORS headers to allow cross-origin beacon requests
        return new NextResponse('OK', { 
          status: 200,
          headers: corsHeaders,
        })
      } catch (error) {
        console.error('❌ Error recording click for beacon request:', error)
        // Still return 200 to avoid breaking the beacon
        return new NextResponse('Error recording click', { 
          status: 200,
          headers: corsHeaders,
        })
      }
    }
    
    // Otherwise, redirect to destination (direct link visit)
    return handleLinkRedirect(request, link)
  } catch (error) {
    console.error('Error in track route redirect:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// GET handler (direct visits or GET beacons)
export async function GET(request: NextRequest) {
  return handleTrackRequest(request, 'GET')
}

// POST handler (beacon requests from navigator.sendBeacon)
export async function POST(request: NextRequest) {
  return handleTrackRequest(request, 'POST')
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
    const clickData = {
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
    }
    console.log('Attempting to create click record:', { linkId: link.id, slug: link.slug, clientId: link.clientId })
    const createdClick = await prisma.click.create({
      data: clickData,
    })
    console.log('✅ Click stored successfully:', { clickId: createdClick.id, linkId: link.id, slug: link.slug })
    return createdClick
  } catch (err: any) {
    console.error('❌ Error storing click:', err)
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      meta: err.meta,
      linkId: link.id,
      slug: link.slug,
    })
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

