/**
 * API route for storing session engagement metrics
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const metrics = await request.json()
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerClient()

    // Get the internal Supabase user ID (UUID)
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (profileError || !userProfile) {
      console.error('User profile not found for session analytics:', profileError)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Store session metrics
    const { error } = await supabase
      .from('dashboard_analytics_sessions')
      .insert({
        user_id: userProfile.id,
        session_id: metrics.sessionId,
        time_spent: metrics.timeSpent,
        components_viewed: metrics.componentsViewed,
        interactions_count: metrics.interactionsCount,
        navigation_path: metrics.navigationPath,
        feature_usage: metrics.featureUsage,
        timestamp: metrics.timestamp
      })

    if (error) {
      console.error('Failed to store session metrics:', error)
      return NextResponse.json(
        { error: 'Failed to store metrics' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session metrics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
