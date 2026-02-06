/**
 * API Route: Generate Lesson
 * Generates AI-powered lessons with synthetic peer interactions
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateLesson, type LessonGenerationRequest } from '@/lib/ai/lesson-generation'
import { userProfileOperations, aiPeerOperations } from '@/lib/database/operations'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { topic, duration = 15, includeVoiceCoaching = true } = body

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    // Get user profile and AI peers
    const userProfile = await userProfileOperations.getByClerkId(userId)
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const aiPeers = await aiPeerOperations.getByUserId(userProfile.id)

    // Prepare lesson generation request
    const lessonRequest: LessonGenerationRequest = {
      topic,
      skillLevel: userProfile.skill_level,
      learningStyle: userProfile.preferred_learning_style as 'visual' | 'practical' | 'mixed',
      duration,
      userDomain: userProfile.primary_domain,
      aiPeers,
      includeVoiceCoaching: includeVoiceCoaching && userProfile.voice_coaching_enabled
    }

    // Generate lesson
    const lesson = await generateLesson(lessonRequest)

    return NextResponse.json({
      success: true,
      lesson
    })

  } catch (error) {
    console.error('Error generating lesson:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate lesson',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const demo = searchParams.get('demo')

    if (demo === 'true') {
      // Return demo lessons list
      const { getDemoLessons } = await import('@/lib/ai/lesson-generation')
      const demoLessons = getDemoLessons()
      
      return NextResponse.json({
        success: true,
        lessons: demoLessons
      })
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error fetching lessons:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}