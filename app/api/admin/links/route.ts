import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  await requireAdminAuth()

  try {
    const body = await request.json()
    const { clientId, handle, slug, destinationUrl } = body

    if (!clientId || !destinationUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId and destinationUrl are required' },
        { status: 400 }
      )
    }

    // Auto-generate slug if not provided
    let finalSlug = slug
    if (!finalSlug || finalSlug.trim() === '') {
      // Generate a short, readable slug (5-6 characters, lowercase letters only)
      // This creates codes like: fhkeo, abcde, xyzab
      const chars = 'abcdefghijklmnopqrstuvwxyz'
      const length = 5 // Short and clean
      
      finalSlug = Array.from({ length }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      ).join('')
      
      // Ensure uniqueness
      let exists = true
      let attempts = 0
      while (exists && attempts < 100) {
        const existing = await prisma.link.findUnique({ where: { slug: finalSlug } })
        if (!existing) {
          exists = false
        } else {
          // Try again with a new random code
          finalSlug = Array.from({ length }, () => 
            chars[Math.floor(Math.random() * chars.length)]
          ).join('')
          attempts++
        }
      }
      
      // If we still have conflicts after 100 attempts, add a number
      if (exists) {
        const baseSlug = finalSlug
        let counter = 1
        while (exists && counter < 1000) {
          finalSlug = `${baseSlug}${counter}`
          const existing = await prisma.link.findUnique({ where: { slug: finalSlug } })
          if (!existing) {
            exists = false
          } else {
            counter++
          }
        }
      }
    }

    // Auto-generate handle if not provided (use a default or extract from URL)
    let finalHandle = handle
    if (!finalHandle || finalHandle.trim() === '') {
      try {
        const url = new URL(destinationUrl)
        finalHandle = url.hostname.replace('www.', '').split('.')[0] || 'default'
      } catch {
        finalHandle = 'default'
      }
    }

    const link = await prisma.link.create({
      data: {
        clientId,
        handle: finalHandle,
        slug: finalSlug,
        destinationUrl,
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
      { error: error.message || 'Failed to create link' },
      { status: 500 }
    )
  }
}

