/**
 * API route for storing session engagement metrics
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
    
    const metrics = await request.json()
    const supabase = createClient()
    
    // Store session metrics
    const { error } = await supabase
      .from('dashboard_analytics_sessions')
      .insert({
        user_id: userId,
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
