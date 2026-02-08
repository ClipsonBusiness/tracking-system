import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { requireAdminAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()
    
    console.log('📊 Pushing database schema...')
    execSync('npx prisma db push --skip-generate --accept-data-loss', { 
      stdio: 'inherit',
      env: process.env
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database schema pushed successfully!' 
    })
  } catch (error: any) {
    console.error('Error pushing schema:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to push schema',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
