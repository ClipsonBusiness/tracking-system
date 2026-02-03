import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await requireAdminAuth()

  try {
    const body = await request.json()
    const { name, destinationUrl, customDomain, commissionPercent, status } = body

    const updateData: {
      name?: string
      destinationUrl?: string
      customDomain?: string | null
      commissionPercent?: number | null
      status?: string
    } = {}

    if (name !== undefined) updateData.name = name
    if (destinationUrl !== undefined) updateData.destinationUrl = destinationUrl
    if (customDomain !== undefined) updateData.customDomain = customDomain?.trim() || null
    if (commissionPercent !== undefined) {
      updateData.commissionPercent = commissionPercent === null || commissionPercent === '' 
        ? null 
        : parseFloat(commissionPercent.toString())
    }
    if (status !== undefined) updateData.status = status

    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(campaign)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await requireAdminAuth()

  try {
    // Soft delete: Mark campaign as inactive instead of hard deleting
    // This preserves data integrity and immediately hides it from clipper portal
    await prisma.campaign.update({
      where: { id: params.id },
      data: { status: 'inactive' },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}

