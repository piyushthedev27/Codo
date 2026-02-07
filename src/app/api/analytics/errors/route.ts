/**
 * API route for tracking errors
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const errorData = await request.json()
    const supabase = createClient()
    
    // Store error
    const { error } = await supabase
      .from('dashboard_errors')
      .insert({
        user_id: userId,
        component: errorData.component,
        error_message: errorData.message,
        error_stack: errorData.stack,
        context: errorData.context || {},
        timestamp: errorData.timestamp
      })
    
    if (error) {
      console.error('Failed to store error:', error)
      return NextResponse.json(
        { error: 'Failed to store error' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
