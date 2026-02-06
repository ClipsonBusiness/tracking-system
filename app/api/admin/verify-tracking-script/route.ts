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

    // Clean domain - try both www and non-www versions
    let cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')
    const domainWithoutWww = cleanDomain.replace(/^www\./, '')
    
    // Try www version first, then non-www
    let url = `https://www.${domainWithoutWww}/`
    let triedNonWww = false

    try {
      // Fetch the website - try www version first
      let response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ClipsonAffiliates/1.0; +https://clipsonaffiliates.com)',
        },
        redirect: 'follow',
      })

      // If www version fails, try non-www
      if (!response.ok && !triedNonWww) {
        url = `https://${domainWithoutWww}/`
        triedNonWww = true
        response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ClipsonAffiliates/1.0; +https://clipsonaffiliates.com)',
          },
          redirect: 'follow',
        })
      }

      if (!response.ok) {
        return NextResponse.json({
          domain,
          found: false,
          error: `Failed to fetch website: ${response.status} ${response.statusText}`,
          url,
        })
      }

      const html = await response.text()

      // Check for the tracking script
      // Look for key indicators:
      // 1. Comment: "Clipson Affiliate Tracking"
      // 2. Cookie-based version: "Cookie-Based" or "Stripe Compatible"
      // 3. Cookie setting: "link_slug"
      // 4. Domain check: hostname check for the domain
      // 5. Beacon call: navigator.sendBeacon or fetch to /track

      const hasComment = html.includes('Clipson Affiliate Tracking') || 
                        html.includes('Clipson Tracking')
      const hasCookieBased = html.includes('Cookie-Based') || 
                            html.includes('Stripe Compatible')
      const hasDomainCheck = html.includes(domainWithoutWww) ||
                            html.includes(`'${domainWithoutWww}'`) ||
                            html.includes(`"${domainWithoutWww}"`) ||
                            html.includes(`www.${domainWithoutWww}`)
      // Check for cookie setting - support both old (link_slug) and new (ca_affiliate_id) cookie names
      const hasCookieSetting = html.includes('document.cookie') && 
                              (html.includes('link_slug') || html.includes('linkSlug') || 
                               html.includes('ca_affiliate_id'))
      
      // More specific check - look for the exact pattern (support both cookie names)
      const hasExactPattern = (html.includes('link_slug=') || html.includes('ca_affiliate_id=')) && 
                             html.includes('encodeURIComponent(refParam)')
      
      // Check for beacon call to tracking server
      const hasBeaconCall = html.includes('navigator.sendBeacon') && 
                           (html.includes('/track?ref=') || html.includes('/track?ref='))

      // Script is detected if it has the comment, cookie setting, and exact pattern
      // Domain check is helpful but not required (script might be minified)
      const found = hasComment && hasCookieSetting && hasExactPattern

      // Extract the script if found
      let scriptSnippet = null
      if (found) {
        // Try to extract the script block (support both cookie names)
        const scriptMatch = html.match(/<script[^>]*>[\s\S]*?Clipson[\s\S]*?(?:link_slug|ca_affiliate_id)[\s\S]*?<\/script>/i)
        if (scriptMatch) {
          scriptSnippet = scriptMatch[0].substring(0, 500) // First 500 chars
        }
      }

      return NextResponse.json({
        domain,
        url, // Return the URL that was checked
        found,
        details: {
          hasComment,
          hasCookieBased,
          hasDomainCheck,
          hasCookieSetting,
          hasExactPattern,
          hasBeaconCall,
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
