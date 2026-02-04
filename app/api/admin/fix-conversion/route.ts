import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()

    const body = await request.json()
    const { conversionId, linkId } = body

    if (!conversionId || !linkId) {
      return NextResponse.json(
        { error: 'Missing conversionId or linkId' },
        { status: 400 }
      )
    }

    // Verify the conversion exists and doesn't have a linkId
    const conversion = await prisma.conversion.findUnique({
      where: { id: conversionId },
      select: { linkId: true },
    })

    if (!conversion) {
      return NextResponse.json(
        { error: 'Conversion not found' },
        { status: 404 }
      )
    }

    if (conversion.linkId) {
      return NextResponse.json(
        { error: 'Conversion already has a linkId' },
        { status: 400 }
      )
    }

    // Verify the link exists
    const link = await prisma.link.findUnique({
      where: { id: linkId },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    // Update the conversion
    await prisma.conversion.update({
      where: { id: conversionId },
      data: { linkId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error fixing conversion:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
