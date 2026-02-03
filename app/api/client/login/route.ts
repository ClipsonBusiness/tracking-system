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
      // Normal username/password login
      if (!username) {
        return NextResponse.json(
          { error: 'Username is required' },
          { status: 400 }
        )
      }

      // Find client by name (case-insensitive)
      const clientByName = await prisma.client.findFirst({
        where: {
          name: {
            equals: username,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          name: true,
          password: true,
        },
      })

      if (!clientByName) {
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        )
      }

      // Check if password is set and matches
      if (!clientByName.password) {
        return NextResponse.json(
          { error: 'No password set for this account. Please contact your administrator.' },
          { status: 401 }
        )
      }

      if (clientByName.password !== password) {
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        )
      }

      client = clientByName
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
