/**
 * API route for storing performance metrics
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const metric = await request.json()
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
      console.error('User profile not found for performance metrics:', profileError)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Store performance metric
    const { error } = await supabase
      .from('dashboard_performance_metrics')
      .insert({
        user_id: userProfile.id,
        component: metric.component,
        load_time: metric.loadTime,
        render_time: metric.renderTime,
        api_response_time: metric.apiResponseTime,
        error_count: metric.errorCount,
        timestamp: metric.timestamp
      })

    if (error) {
      console.error('Failed to store performance metric:', error)
      return NextResponse.json(
        { error: 'Failed to store metric' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Performance metrics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
