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
    const { handle, slug, destinationUrl } = body

    const link = await prisma.link.update({
      where: { id: params.id },
      data: {
        ...(handle && { handle }),
        ...(slug && { slug }),
        ...(destinationUrl && { destinationUrl }),
      },
    })

    return NextResponse.json(link)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update link' },
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
    await prisma.link.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete link' },
      { status: 500 }
    )
  }
}

