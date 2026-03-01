/**
 * API Route: Lesson Progress
 * Manages lesson progress tracking and updates
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'
import {
  getLessonProgress,
  updateLessonProgress,
  initializeLessonProgress,
  completeLessonSection,
  completePeerInteraction,
  recordVoiceCoachingUsage,
  recordLessonMistake,
  resumeLesson
} from '@/lib/lessons/progress-tracking'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: lessonId } = await params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Get the internal Supabase user ID (UUID)
    const supabase = await createServerClient()
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const userId = userProfile.id

    if (action === 'resume') {
      const resumeData = await resumeLesson(userId, lessonId)
      if (!resumeData) {
        return NextResponse.json(
          { error: 'Lesson not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        ...resumeData
      })
    }

    // Get current progress
    let progress = await getLessonProgress(userId, lessonId)

    // If progress doesn't exist, we might want to try initializing it
    // But we need totalSections for that, which GET doesn't usually have
    // So we'll return a special flag or handle it in POST

    if (!progress) {
      return NextResponse.json({
        success: true,
        progress: null,
        message: 'No progress found'
      })
    }

    return NextResponse.json({
      success: true,
      progress
    })

  } catch (error) {
    console.error('Error getting lesson progress:', error)

    return NextResponse.json(
      { error: 'Failed to get lesson progress' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: lessonId } = await params
    const body = await request.json()
    const { action, ...data } = body

    // Get the internal Supabase user ID (UUID)
    const supabase = await createServerClient()
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const userId = userProfile.id

    let updatedProgress = null

    switch (action) {
      case 'complete_section':
        updatedProgress = await completeLessonSection(
          userId,
          lessonId,
          data.sectionId,
          data.timeSpent || 0,
          data.xpReward || 10
        )
        break

      case 'complete_interaction':
        updatedProgress = await completePeerInteraction(
          userId,
          lessonId,
          data.interactionId,
          data.xpReward || 25
        )
        break

      case 'record_voice_usage':
        updatedProgress = await recordVoiceCoachingUsage(
          userId,
          lessonId,
          data.timeSpent || 1
        )
        break

      case 'record_mistake':
        updatedProgress = await recordLessonMistake(
          userId,
          lessonId,
          data.mistakeCount || 1
        )
        break

      case 'update_progress':
        updatedProgress = await updateLessonProgress(userId, lessonId, data)
        break

      case 'initialize':
        updatedProgress = await initializeLessonProgress(
          userId,
          lessonId,
          data.totalSections || 1
        )
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    if (!updatedProgress) {
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      progress: updatedProgress
    })

  } catch (error) {
    console.error('Error updating lesson progress:', error)

    return NextResponse.json(
      { error: 'Failed to update lesson progress' },
      { status: 500 }
    )
  }
}