import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  await requireAdminAuth()
  
  try {
    const { invoiceId, linkSlug } = await request.json()
    
    if (!invoiceId || !linkSlug) {
      return NextResponse.json(
        { error: 'Missing invoiceId or linkSlug' },
        { status: 400 }
      )
    }
    
    // Find the conversion
    const conversion = await prisma.conversion.findUnique({
      where: { stripeInvoiceId: invoiceId },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    })
    
    if (!conversion) {
      return NextResponse.json(
        { error: 'Conversion not found' },
        { status: 404 }
      )
    }
    
    // Find the link by slug
    const link = await prisma.link.findUnique({
      where: { slug: linkSlug },
      select: { id: true, slug: true },
    })
    
    if (!link) {
      return NextResponse.json(
        { error: `Link with slug "${linkSlug}" not found` },
        { status: 404 }
      )
    }
    
    // Update the conversion with the linkId
    const updated = await prisma.conversion.update({
      where: { id: conversion.id },
      data: { linkId: link.id },
    })
    
    return NextResponse.json({
      success: true,
      message: `Conversion ${conversion.id} linked to link ${link.slug}`,
      conversion: {
        id: updated.id,
        linkId: updated.linkId,
        amountPaid: updated.amountPaid,
        currency: updated.currency,
      },
    })
  } catch (err: any) {
    console.error('Error fixing conversion:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to fix conversion' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  await requireAdminAuth()
  
  try {
    const searchParams = request.nextUrl.searchParams
    const invoiceId = searchParams.get('invoiceId')
    const linkSlug = searchParams.get('linkSlug')
    
    if (!invoiceId && !linkSlug) {
      // Get all orphan conversions (no linkId)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const orphans = await prisma.conversion.findMany({
        where: {
          linkId: null,
          paidAt: { gte: sevenDaysAgo },
        },
        include: {
          client: {
            select: { name: true },
          },
        },
        orderBy: { paidAt: 'desc' },
        take: 20,
      })
      
      return NextResponse.json({
        orphans: orphans.map(c => ({
          id: c.id,
          invoiceId: c.stripeInvoiceId,
          amountPaid: c.amountPaid,
          currency: c.currency,
          affiliateCode: c.affiliateCode,
          paidAt: c.paidAt,
          client: c.client.name,
        })),
      })
    }
    
    if (invoiceId) {
      const conversion = await prisma.conversion.findUnique({
        where: { stripeInvoiceId: invoiceId },
        include: {
          link: {
            select: { slug: true },
          },
          client: {
            select: { name: true },
          },
        },
      })
      
      return NextResponse.json({ conversion })
    }
    
    if (linkSlug) {
      const link = await prisma.link.findUnique({
        where: { slug: linkSlug },
        include: {
          conversions: {
            orderBy: { paidAt: 'desc' },
            take: 10,
          },
          _count: {
            select: { conversions: true },
          },
        },
      })
      
      if (!link) {
        return NextResponse.json({ 
          error: `Link with slug "${linkSlug}" not found`,
          link: null,
        })
      }
      
      // Get all conversions for this link (not just 10)
      const allConversions = await prisma.conversion.findMany({
        where: { linkId: link.id },
        orderBy: { paidAt: 'desc' },
      })
      
      const totalRevenue = allConversions.reduce((sum, c) => sum + c.amountPaid, 0) / 100
      
      return NextResponse.json({ 
        link: {
          id: link.id,
          slug: link.slug,
          conversionCount: allConversions.length,
          totalRevenue,
          conversions: allConversions.map(c => ({
            id: c.id,
            amountPaid: c.amountPaid,
            currency: c.currency,
            paidAt: c.paidAt,
            affiliateCode: c.affiliateCode,
            stripeInvoiceId: c.stripeInvoiceId,
          })),
        },
      })
    }
    
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  } catch (err: any) {
    console.error('Error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to query' },
      { status: 500 }
    )
  }
}
