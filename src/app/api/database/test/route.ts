import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/lib/database/operations'

export async function GET() {
  try {
    const result = await testDatabaseConnection()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}