import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashIP, getIPFromHeaders, getCountryFromHeaders, getCountryFromIP, getCityFromHeaders, getCityFromIP } from '@/lib/utils'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    const link = await prisma.link.findUnique({
      where: { slug },
      include: {
        campaign: {
          select: { destinationUrl: true }
        }
      }
    })

    if (!link) {
      return new NextResponse('Link not found', { status: 404 })
    }

    // Use link's destinationUrl or fallback to campaign's destinationUrl
    const destinationUrl = link.destinationUrl || link.campaign?.destinationUrl
    if (!destinationUrl) {
      return new NextResponse('Link has no destination URL', { status: 404 })
    }

    // Get affiliate code from query param or cookie
    const searchParams = request.nextUrl.searchParams
    const affFromQuery = searchParams.get('aff')
    const cookieStore = await cookies()
    const affFromCookie = cookieStore.get('aff_code')?.value

    let affiliateCode: string | null = affFromQuery || affFromCookie || null

    // If affiliate code from query param, set cookie with 60-day expiry
    if (affFromQuery) {
      cookieStore.set('aff_code', affFromQuery, {
        httpOnly: false, // Needs to be readable by JS if needed
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
    return NextResponse.redirect(destinationUrl, { status: 302 })
  } catch (error) {
    console.error('Error in link redirect:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

