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
    const { customDomain } = body

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        customDomain: customDomain || null,
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

