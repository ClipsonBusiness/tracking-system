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
    const { name, customDomain, password } = body

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(customDomain !== undefined && { customDomain: customDomain?.trim() || null }),
        ...(password !== undefined && { password: password?.trim() || null }),
      },
    })

    return NextResponse.json(client)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update client' },
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
    // Prisma will cascade delete campaigns, links, clicks, etc. due to onDelete: Cascade
    await prisma.client.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Client deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete client' },
      { status: 500 }
    )
  }
}

