/**
 * API Route: Lesson Progress
 * Manages lesson progress tracking and updates
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  getLessonProgress,
  updateLessonProgress,
  completeLessonSection,
  completePeerInteraction,
  recordVoiceCoachingUsage,
  recordLessonMistake,
  resumeLesson
} from '@/lib/lessons/progress-tracking'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const lessonId = params.id
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

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
    const progress = await getLessonProgress(userId, lessonId)
    if (!progress) {
      return NextResponse.json(
        { error: 'Lesson progress not found' },
        { status: 404 }
      )
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
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const lessonId = params.id
    const body = await request.json()
    const { action, ...data } = body

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