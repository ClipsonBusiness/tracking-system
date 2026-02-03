import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setClientAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, token } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    let client

    // If token is provided, authenticate using token + password
    if (token) {
      const clientByToken = await prisma.client.findUnique({
        where: { clientAccessToken: token },
        select: {
          id: true,
          name: true,
          password: true,
        },
      })

      if (!clientByToken) {
        return NextResponse.json(
          { error: 'Invalid access link' },
          { status: 401 }
        )
      }

      // Verify password matches
      if (!clientByToken.password || clientByToken.password !== password) {
        return NextResponse.json(
          { error: 'Invalid login code' },
          { status: 401 }
        )
      }

      client = clientByToken
    } else {
      // Password-only login (no username needed)
      // Find client by password
      const clientsByPassword = await prisma.client.findMany({
        where: {
          password: password, // Exact match
        },
        select: {
          id: true,
          name: true,
          password: true,
        },
      })

      if (clientsByPassword.length === 0) {
        return NextResponse.json(
          { error: 'Invalid login code' },
          { status: 401 }
        )
      }

      // If multiple clients have the same password, that's a security issue
      if (clientsByPassword.length > 1) {
        console.error(`Security warning: Multiple clients share the same password: ${password}`)
        return NextResponse.json(
          { error: 'Multiple accounts found with this password. Please contact your administrator to set a unique password.' },
          { status: 401 }
        )
      }

      client = clientsByPassword[0]
    }

    // Set authentication cookie
    await setClientAuth(client.id)

    return NextResponse.json({ success: true, clientName: client.name })
  } catch (error) {
    console.error('Client login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
