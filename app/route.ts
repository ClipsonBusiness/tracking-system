import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashIP, getIPFromHeaders, getCountryFromHeaders } from '@/lib/utils'
import { cookies } from 'next/headers'

// Route handler for root path with ?ref= query parameters
// Handles: tracking-server.com/?ref=xxxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Check for ?ref= parameter
    const refParam = searchParams.get('ref')
    
    if (!refParam) {
      // No ref parameter, rewrite to the page (show homepage)
      // Route handlers override pages, so we need to rewrite internally
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.search = '' // Remove query params for homepage
      return NextResponse.rewrite(url)
    }

    const actualSlug = refParam
    
    // Debug logging
    console.log('Root route hit with ref:', { actualSlug })
    
    // Find link by slug (direct lookup, no custom domain filtering needed here)
    const link = await prisma.link.findFirst({
      where: { slug: actualSlug },
    })
    
    if (!link) {
      console.log('Link not found for slug:', actualSlug)
      // Link not found, show 404 or rewrite to homepage
      return new NextResponse('Link not found', { status: 404 })
    }

    console.log('Found link by slug:', actualSlug)
    return handleLinkRedirect(request, link)
  } catch (error) {
    console.error('Error in root route redirect:', error)
    // On error, rewrite to homepage
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.rewrite(url)
  }
}

async function handleLinkRedirect(
  request: NextRequest,
  link: { id: string; clientId: string; destinationUrl: string }
) {
  // Get affiliate code from query param or cookie
  const searchParams = request.nextUrl.searchParams
  const affFromQuery = searchParams.get('aff')
  const cookieStore = await cookies()
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

  // Capture click analytics
  const headers = request.headers
  const ip = getIPFromHeaders(headers)
  const ipHash = ip ? hashIP(ip) : null
  const country = getCountryFromHeaders(headers)
  const referer = headers.get('referer') || null
  const userAgent = headers.get('user-agent') || null

  // Extract UTM parameters
  const utmSource = searchParams.get('utm_source') || null
  const utmMedium = searchParams.get('utm_medium') || null
  const utmCampaign = searchParams.get('utm_campaign') || null

  // Store click (fire and forget - don't block redirect)
  prisma.click
    .create({
      data: {
        linkId: link.id,
        clientId: link.clientId,
        referer,
        userAgent,
        ipHash,
        country,
        utmSource,
        utmMedium,
        utmCampaign,
        affiliateCode,
      },
    })
    .catch((err) => {
      console.error('Error storing click:', err)
    })

  // Redirect to destination
  return NextResponse.redirect(link.destinationUrl, { status: 302 })
}

