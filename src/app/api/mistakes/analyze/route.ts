/**
 * API endpoint for analyzing coding mistakes and updating learning paths
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { parseError } from '@/lib/utils/error-parsing'
import { generateMicroLesson } from '@/lib/utils/micro-lesson-generator'
import { trackMistake, analyzeMistakePatterns } from '@/lib/utils/mistake-pattern-tracker'
import { updateLearningPathFromMistake } from '@/lib/utils/learning-path-updater'
import { supabase } from '@/lib/database/supabase-client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
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
      errorMessage,
      codeContext,
      language = 'javascript',
      lineNumber,
      columnNumber
    } = body

    if (!errorMessage) {
      return NextResponse.json(
        { error: 'Error message is required' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Parse the error
    const parsedError = parseError(
      errorMessage,
      codeContext,
      language,
      lineNumber,
      columnNumber
    )

    // Track the mistake pattern
    const mistakePattern = await trackMistake(userProfile.id, parsedError)

    // Generate micro-lesson if needed
    let microLesson = null
    if (parsedError.microLessonNeeded) {
      microLesson = generateMicroLesson(parsedError)
    }

    // Update learning path based on the mistake
    const updatedLearningPath = await updateLearningPathFromMistake(
      userProfile.id,
      parsedError,
      mistakePattern
    )

    // Get updated mistake analysis
    const mistakeAnalysis = await analyzeMistakePatterns(userProfile.id)

    return NextResponse.json({
      success: true,
      data: {
        parsedError,
        mistakePattern,
        microLesson,
        learningPathUpdates: {
          newRecommendations: updatedLearningPath.recommendedLessons.slice(0, 3),
          adaptiveAdjustments: updatedLearningPath.adaptiveAdjustments.slice(-1),
          currentFocus: updatedLearningPath.currentFocus
        },
        mistakeAnalysis: {
          totalMistakes: mistakeAnalysis.totalMistakes,
          mostCommonErrors: mistakeAnalysis.mostCommonErrors.slice(0, 5),
          improvementAreas: mistakeAnalysis.improvementAreas,
          progressTrend: mistakeAnalysis.progressTrend
        }
      }
    })

  } catch (error) {
    console.error('Error analyzing mistake:', error)
    return NextResponse.json(
      { error: 'Failed to analyze mistake' },
      { status: 500 }
    )
  }
}

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
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get comprehensive mistake analysis
    const mistakeAnalysis = await analyzeMistakePatterns(userProfile.id)

    return NextResponse.json({
      success: true,
      data: mistakeAnalysis
    })

  } catch (error) {
    console.error('Error getting mistake analysis:', error)
    return NextResponse.json(
      { error: 'Failed to get mistake analysis' },
      { status: 500 }
    )
  }
}