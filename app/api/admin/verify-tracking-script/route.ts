import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()

    const searchParams = request.nextUrl.searchParams
    const domain = searchParams.get('domain')

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter is required' },
        { status: 400 }
      )
    }

    // Clean domain
    let cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')
    if (!cleanDomain.startsWith('www.')) {
      cleanDomain = `www.${cleanDomain}`
    }

    const url = `https://${cleanDomain}/`

    try {
      // Fetch the website
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ClipsonAffiliates/1.0; +https://clipsonaffiliates.com)',
        },
        redirect: 'follow',
      })

      if (!response.ok) {
        return NextResponse.json({
          domain,
          found: false,
          error: `Failed to fetch website: ${response.status} ${response.statusText}`,
        })
      }

      const html = await response.text()

      // Check for the tracking script
      // Look for key indicators:
      // 1. Comment: "Clipson Affiliate Tracking"
      // 2. Cookie-based version: "Cookie-Based" or "Stripe Compatible"
      // 3. Cookie setting: "link_slug"
      // 4. Domain check: hostname check for the domain

      const hasComment = html.includes('Clipson Affiliate Tracking') || 
                        html.includes('Clipson Tracking')
      const hasCookieBased = html.includes('Cookie-Based') || 
                            html.includes('Stripe Compatible') ||
                            html.includes('link_slug')
      const hasDomainCheck = html.includes(cleanDomain.replace('www.', '')) ||
                            html.includes(cleanDomain)
      const hasCookieSetting = html.includes('document.cookie') && 
                              (html.includes('link_slug') || html.includes('linkSlug'))

      // More specific check - look for the exact pattern
      const hasExactPattern = html.includes('link_slug=') && 
                             html.includes('encodeURIComponent(refParam)')

      const found = hasComment && hasCookieBased && hasCookieSetting && hasExactPattern

      // Extract the script if found
      let scriptSnippet = null
      if (found) {
        // Try to extract the script block
        const scriptMatch = html.match(/<script[^>]*>[\s\S]*?Clipson[\s\S]*?link_slug[\s\S]*?<\/script>/i)
        if (scriptMatch) {
          scriptSnippet = scriptMatch[0].substring(0, 500) // First 500 chars
        }
      }

      return NextResponse.json({
        domain,
        url,
        found,
        details: {
          hasComment,
          hasCookieBased,
          hasDomainCheck,
          hasCookieSetting,
          hasExactPattern,
        },
        scriptSnippet: scriptSnippet ? `${scriptSnippet}...` : null,
        status: found ? '✅ Script detected!' : '❌ Script not found',
        message: found
          ? 'The tracking script appears to be present on your website.'
          : 'The tracking script was not detected. Please verify it was added correctly.',
      })
    } catch (error: any) {
      return NextResponse.json({
        domain,
        found: false,
        error: `Error fetching website: ${error.message}`,
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
