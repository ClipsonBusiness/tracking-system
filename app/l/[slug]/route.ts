import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashIP, getIPFromHeaders, getCountryFromHeaders } from '@/lib/utils'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    const link = await prisma.link.findUnique({
      where: { slug },
    })

    if (!link) {
      return new NextResponse('Link not found', { status: 404 })
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
  } catch (error) {
    console.error('Error in link redirect:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

