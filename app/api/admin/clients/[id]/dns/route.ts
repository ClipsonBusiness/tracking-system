import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await requireAdminAuth()

  try {
    const body = await request.json()
    const { customDomain, dnsType, dnsValue, dnsName, dnsTtl, notes, dnsScreenshot } = body

    if (!customDomain) {
      return NextResponse.json(
        { error: 'Custom domain is required' },
        { status: 400 }
      )
    }

    // Update client with custom domain and screenshot
    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        customDomain: customDomain.trim(),
        dnsScreenshot: dnsScreenshot || null, // Store base64 screenshot or null
      },
    })

    // TODO: Store DNS details (dnsType, dnsValue, etc.) in database
    // For now, they're just in the form for reference
    // Consider adding a DNSRecord model or JSON field to Client

    return NextResponse.json({
      success: true,
      client,
      message: 'DNS configuration saved. Custom domain updated.',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save DNS configuration' },
      { status: 500 }
    )
  }
}

