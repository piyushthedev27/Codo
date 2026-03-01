/**
 * Activities API Route
 * 
 * Handles fetching and managing user learning activities
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/database/supabase-client'
import { createEnhancedActivity, sortActivities } from '@/lib/activities/activity-tracker'
import type { LearningActivity } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Fetch learning activities
    const { data: activities, error: activitiesError } = await supabase
      .from('enhanced_activities')
      .select('*')
      .eq('user_id', profile.id)
      .order('activity_timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError)
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      )
    }

    // Convert to enhanced activities
    const enhancedActivities = (activities || []).map((activity: LearningActivity) =>
      createEnhancedActivity(activity)
    )

    // Sort by timestamp
    const sortedActivities = sortActivities(enhancedActivities)

    return NextResponse.json({
      activities: sortedActivities,
      count: sortedActivities.length,
      hasMore: sortedActivities.length === limit
    })

  } catch (error) {
    console.error('Error in activities API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      activity_type,
      title,
      description,
      xp_earned,
      duration_minutes,
      peer_interactions_count = 0,
      voice_coaching_used = false,
      mistakes_made = 0,
      completion_percentage = 100,
      metadata = {}
    } = body

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, current_xp')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Create activity
    const { data: activity, error: activityError } = await supabase
      .from('enhanced_activities')
      .insert({
        user_id: profile.id,
        activity_type,
        title,
        description,
        xp_earned,
        duration_minutes,
        peer_interactions_count,
        voice_coaching_used,
        mistakes_made,
        completion_percentage,
        metadata,
        activity_timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (activityError) {
      console.error('Error creating activity:', activityError)
      return NextResponse.json(
        { error: 'Failed to create activity' },
        { status: 500 }
      )
    }

    // Update user XP
    const { error: xpError } = await supabase
      .from('user_profiles')
      .update({
        current_xp: (profile.current_xp || 0) + xp_earned
      })
      .eq('id', profile.id)

    if (xpError) {
      console.error('Error updating XP:', xpError)
    }

    const enhancedActivity = createEnhancedActivity(activity)

    return NextResponse.json({
      activity: enhancedActivity,
      success: true
    })

  } catch (error) {
    console.error('Error in activities POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
