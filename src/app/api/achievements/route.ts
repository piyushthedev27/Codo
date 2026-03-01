/**
 * Achievements API Route
 * 
 * Handles fetching user achievements and checking for unlocks
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/database/supabase-client'
import {
  getUserAchievements,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkAchievementUnlock as _checkAchievementUnlock,
  getRecentlyUnlockedAchievements
} from '@/lib/activities/achievement-system'
import { createEnhancedActivity } from '@/lib/activities/activity-tracker'
import type { UserProfile, LearningActivity } from '@/types/database'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
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

    // Get unlocked achievement IDs from user metadata
    const unlockedIds = profile.metadata?.unlocked_achievements || []

    // Get all achievements with progress
    const achievements = getUserAchievements(
      profile as UserProfile,
      enhancedActivities,
      unlockedIds
    )

    // Get recently unlocked
    const recentlyUnlocked = getRecentlyUnlockedAchievements(achievements, 24)

    return NextResponse.json({
      achievements,
      recentlyUnlocked,
      totalUnlocked: achievements.filter(a => a.unlocked).length,
      totalAchievements: achievements.length
    })

  } catch (error) {
    console.error('Error in achievements API:', error)
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
    const { achievementId } = body

    if (!achievementId) {
      return NextResponse.json(
        { error: 'Achievement ID required' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get current unlocked achievements
    const unlockedIds = profile.metadata?.unlocked_achievements || []

    // Check if already unlocked
    if (unlockedIds.includes(achievementId)) {
      return NextResponse.json({
        success: false,
        message: 'Achievement already unlocked'
      })
    }

    // Add to unlocked achievements
    const updatedUnlocked = [...unlockedIds, achievementId]

    // Update profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        metadata: {
          ...profile.metadata,
          unlocked_achievements: updatedUnlocked
        }
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Error updating achievements:', updateError)
      return NextResponse.json(
        { error: 'Failed to unlock achievement' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      achievementId,
      message: 'Achievement unlocked!'
    })

  } catch (error) {
    console.error('Error in achievements POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
