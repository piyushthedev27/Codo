/**
 * API route for tracking errors
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const errorData = await request.json()
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
      console.error('User profile not found for error tracking:', profileError)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Store error
    const { error } = await supabase
      .from('dashboard_errors')
      .insert({
        user_id: userProfile.id,
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
