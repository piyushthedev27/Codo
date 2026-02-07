/**
 * API route for storing performance metrics
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
    
    const metric = await request.json()
    const supabase = createClient()
    
    // Store performance metric
    const { error } = await supabase
      .from('dashboard_performance_metrics')
      .insert({
        user_id: userId,
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
