/**
 * API route for tracking dashboard events
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId: clerkUserId } = await auth()
    const supabase = await createServerClient()
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the internal Supabase user ID (UUID) from the clerk user id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (profileError || !userProfile) {
      console.error('User profile not found for analytics tracking:', profileError)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Store event in database
    const { error } = await supabase
      .from('dashboard_analytics_events')
      .insert({
        user_id: userProfile.id,
        session_id: body.sessionId,
        event_type: body.eventType,
        component: body.component,
        action: body.action,
        metadata: body.metadata || {},
        timestamp: body.timestamp
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
