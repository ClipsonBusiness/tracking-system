import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashIP, getIPFromHeaders, getCountryFromHeaders, getCountryFromIP, getCityFromHeaders, getCityFromIP } from '@/lib/utils'
import { cookies } from 'next/headers'

// Catch-all route for custom domain tracking
// Handles: lowbackability.com/xxxxx
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    // Get the host from the request
    const host = request.headers.get('host') || ''
    const hostname = host.split(':')[0] // Remove port if present
    
    // Get the slug from the path
    // Support both /slug and /ref=xxxx formats
    const pathSlug = params.slug?.[0] || ''
    const searchParams = request.nextUrl.searchParams
    
    // Check if it's a ref= format (e.g., /ref=xxxx) - primary format for clippers
    let actualSlug = pathSlug
    if (pathSlug.startsWith('ref=')) {
      actualSlug = pathSlug.replace('ref=', '')
    } else if (searchParams.has('ref')) {
      // Also support ?ref=xxxx format
      actualSlug = searchParams.get('ref') || pathSlug
    }
    // Otherwise, use the path directly as the slug (clean format: /xxxxx for backward compatibility)
    
    // Debug logging
    console.log('Catch-all route hit:', { hostname, pathSlug, actualSlug, slugArray: params.slug })
    
    if (!actualSlug) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Find client by custom domain (case-insensitive match for SQLite)
    // SQLite doesn't support case-insensitive mode, so we do it manually
    const allClients = await prisma.client.findMany({
      where: {
        customDomain: { not: null },
      },
    })
    const foundClient = allClients.find(
      c => c.customDomain?.toLowerCase() === hostname.toLowerCase()
    ) || null

    // If no custom domain match, try direct slug lookup
    // This allows clean URLs on your tracking server domain
    // e.g., yourserver.com/pynhl instead of yourserver.com/l/pynhl
    if (!foundClient) {
      console.log('No custom domain match, trying direct slug lookup for:', actualSlug)
      const directLink = await prisma.link.findFirst({
        where: { slug: actualSlug },
        select: { 
          id: true, 
          clientId: true, 
          destinationUrl: true, 
          slug: true,
          campaign: {
            select: { destinationUrl: true }
          }
        },
      })
      
      if (directLink) {
        console.log('Found link by slug:', actualSlug)
        // Use link's destinationUrl or fallback to campaign's destinationUrl
        const destinationUrl = directLink.destinationUrl || directLink.campaign?.destinationUrl
        if (!destinationUrl) {
          return new NextResponse('Link has no destination URL', { status: 404 })
        }
        return handleLinkRedirect(request, { ...directLink, destinationUrl })
      }
      
      return new NextResponse('Not found', { status: 404 })
    }

    // Find link by slug for this client
    const link = await prisma.link.findFirst({
      where: {
        slug: actualSlug,
        clientId: foundClient.id,
      },
      select: { 
        id: true, 
        clientId: true, 
        destinationUrl: true, 
        slug: true,
        campaign: {
          select: { destinationUrl: true }
        }
      },
    })
    
    console.log('Link lookup:', { actualSlug, clientId: foundClient.id, found: !!link })

    if (!link) {
      return new NextResponse('Link not found', { status: 404 })
    }

    // Use link's destinationUrl or fallback to campaign's destinationUrl
    const destinationUrl = link.destinationUrl || link.campaign?.destinationUrl
    if (!destinationUrl) {
      return new NextResponse('Link has no destination URL', { status: 404 })
    }

    return handleLinkRedirect(request, { ...link, destinationUrl })
  } catch (error) {
    console.error('Error in custom domain link redirect:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

async function handleLinkRedirect(
  request: NextRequest,
  link: { id: string; clientId: string | null; destinationUrl: string; slug: string }
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

  // Store link slug in cookie for conversion attribution
  // This allows us to attribute sales to the specific clipper link
  cookieStore.set('link_slug', link.slug, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 60, // 60 days
  })

  // Capture click analytics
  const headers = request.headers
  const ip = getIPFromHeaders(headers)
  const ipHash = ip ? hashIP(ip) : null
  
  // Try to get country from headers first, then fallback to IP lookup
  let country = getCountryFromHeaders(headers)
  if (!country && ip) {
    // Fallback to IP-based geolocation if headers don't provide country
    country = await getCountryFromIP(ip)
  }
  
  // Try to get city from headers first, then fallback to IP lookup
  let city = getCityFromHeaders(headers)
  if (!city && ip) {
    // Fallback to IP-based geolocation if headers don't provide city
    city = await getCityFromIP(ip)
  }
  
  const referer = headers.get('referer') || null
  const userAgent = headers.get('user-agent') || null

  // Extract UTM parameters
  const utmSource = searchParams.get('utm_source') || null
  const utmMedium = searchParams.get('utm_medium') || null
  const utmCampaign = searchParams.get('utm_campaign') || null

  // Store click - await to ensure it's saved before redirect
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
    // Continue with redirect even if click storage fails
  }

  // Redirect to destination
  return NextResponse.redirect(link.destinationUrl, { status: 302 })
}

