import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')
    const domainWithoutWww = cleanDomain.replace(/^www\./, '')

    // Test results
    const results: any = {
      domain: cleanDomain,
      timestamp: new Date().toISOString(),
      tests: {},
      overall: 'unknown',
      recommendations: [],
    }

    // Test 1: Find client by domain
    const allClients = await prisma.client.findMany({
      where: {
        customDomain: { not: null },
      },
      select: {
        id: true,
        name: true,
        customDomain: true,
        stripeWebhookSecret: true,
        stripeAccountId: true,
      },
    })

    const client = allClients.find(
      (c) =>
        c.customDomain &&
        (c.customDomain.toLowerCase().includes(domainWithoutWww.toLowerCase()) ||
          domainWithoutWww.toLowerCase().includes(
            c.customDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '')
          ))
    )

    results.tests.clientFound = {
      passed: !!client,
      clientName: client?.name || null,
      customDomain: client?.customDomain || null,
    }

    if (!client) {
      results.recommendations.push('No client found with this domain. Check if domain is configured in client settings.')
      results.overall = 'failed'
      return NextResponse.json(results)
    }

    // Test 2: Check JavaScript snippet
    try {
      const url = `https://www.${domainWithoutWww}/`
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ClipsonAffiliates/1.0; +https://clipsonaffiliates.com)',
        },
        redirect: 'follow',
      })

      if (response.ok) {
        const html = await response.text()
        const hasComment = html.includes('Clipson Affiliate Tracking') || html.includes('Clipson Tracking')
        const hasCookieSetting = html.includes('document.cookie') && html.includes('link_slug')
        const hasExactPattern = html.includes('link_slug=') && html.includes('encodeURIComponent(refParam)')
        const hasBeaconCall = html.includes('navigator.sendBeacon') && html.includes('/track?ref=')

        results.tests.scriptInstalled = {
          passed: hasComment && hasCookieSetting && hasExactPattern,
          details: {
            hasComment,
            hasCookieSetting,
            hasExactPattern,
            hasBeaconCall,
          },
        }

        if (!results.tests.scriptInstalled.passed) {
          results.recommendations.push('JavaScript tracking snippet not detected. Install it from the client setup page.')
        }
      } else {
        results.tests.scriptInstalled = {
          passed: false,
          error: `Failed to fetch website: ${response.status}`,
        }
      }
    } catch (error: any) {
      results.tests.scriptInstalled = {
        passed: false,
        error: error.message,
      }
    }

    // Test 3: Check Stripe webhook configuration
    results.tests.stripeWebhook = {
      passed: !!client.stripeWebhookSecret,
      hasWebhookSecret: !!client.stripeWebhookSecret,
      hasStripeAccountId: !!client.stripeAccountId,
    }

    if (!client.stripeWebhookSecret) {
      results.recommendations.push('Stripe webhook secret not configured. Add it in the client setup page.')
    }

    // Test 4: Check for recent clicks (indicates tracking is working)
    const recentClicks = await prisma.click.findMany({
      where: {
        clientId: client.id,
        ts: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      take: 1,
    })

    results.tests.clickTracking = {
      passed: recentClicks.length > 0,
      recentClicksCount: recentClicks.length,
    }

    if (recentClicks.length === 0) {
      results.recommendations.push('No clicks recorded in the last 7 days. Test a tracking link to verify click tracking works.')
    }

    // Test 5: Check for recent conversions
    const recentConversions = await prisma.conversion.findMany({
      where: {
        clientId: client.id,
        paidAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      take: 5,
    })

    results.tests.salesTracking = {
      passed: recentConversions.length > 0,
      recentConversionsCount: recentConversions.length,
      conversions: recentConversions.map((c) => ({
        amount: c.amountPaid / 100,
        currency: c.currency,
        paidAt: c.paidAt.toISOString(),
        hasLink: !!c.linkId,
      })),
    }

    // Test 6: Check for links
    const links = await prisma.link.findMany({
      where: {
        clientId: client.id,
      },
      take: 5,
      select: {
        slug: true,
        destinationUrl: true,
      },
    })

    results.tests.linksExist = {
      passed: links.length > 0,
      linksCount: links.length,
      sampleLinks: links.map((l) => ({
        slug: l.slug,
        trackingUrl: `https://${cleanDomain}/?ref=${l.slug}`,
      })),
    }

    // Determine overall status
    const allTests = [
      results.tests.clientFound?.passed,
      results.tests.scriptInstalled?.passed,
      results.tests.stripeWebhook?.passed,
      results.tests.clickTracking?.passed,
    ]

    const passedTests = allTests.filter((t) => t === true).length
    const totalTests = allTests.filter((t) => t !== undefined).length

    if (passedTests === totalTests) {
      results.overall = 'passed'
    } else if (passedTests > 0) {
      results.overall = 'partial'
    } else {
      results.overall = 'failed'
    }

    // Add summary
    results.summary = {
      passedTests,
      totalTests,
      status: results.overall,
    }

    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
