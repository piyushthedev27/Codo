/**
 * API route for tracking dashboard events
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
    
    const event = await request.json()
    const supabase = createClient()
    
    // Store event in database
    const { error } = await supabase
      .from('dashboard_analytics_events')
      .insert({
        user_id: userId,
        session_id: event.sessionId,
        event_type: event.eventType,
        component: event.component,
        action: event.action,
        metadata: event.metadata || {},
        timestamp: event.timestamp
      })
    
    if (error) {
      console.error('Failed to store analytics event:', error)
      return NextResponse.json(
        { error: 'Failed to store event' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
