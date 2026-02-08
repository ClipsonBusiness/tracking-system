import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { requireAdminAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()
    
    console.log('📊 Pushing database schema...')
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'DATABASE_URL environment variable is not set. Please configure your database connection in Railway.',
        },
        { status: 500 }
      )
    }
    
    // Capture output for better error messages
    let output = ''
    try {
      const result = execSync('npx prisma db push --skip-generate --accept-data-loss', { 
        encoding: 'utf-8',
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      output = result.toString()
      console.log('Schema push output:', output)
    } catch (execError: any) {
      output = execError.stdout?.toString() || execError.stderr?.toString() || execError.message || ''
      console.error('Schema push error:', output)
      throw execError
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database schema pushed successfully!',
      output: output.substring(0, 500) // Limit output size
    })
  } catch (error: any) {
    console.error('Error pushing schema:', error)
    const errorMessage = error.stdout?.toString() || error.stderr?.toString() || error.message || 'Unknown error'
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to push schema: ${errorMessage.substring(0, 500)}`,
        details: error.toString().substring(0, 1000)
      },
      { status: 500 }
    )
  }
}
