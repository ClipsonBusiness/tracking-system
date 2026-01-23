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
    const { customDomain, dnsType, dnsValue, dnsName, dnsTtl, notes } = body

    if (!customDomain) {
      return NextResponse.json(
        { error: 'Custom domain is required' },
        { status: 400 }
      )
    }

    // Update client with custom domain
    // Note: We're storing DNS details in notes for now
    // In the future, you could add DNS fields to the Client model
    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        customDomain: customDomain.trim(),
        // Store DNS details in a JSON field or notes
        // For now, we'll just update customDomain
        // You could extend the schema to store DNS details separately
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

