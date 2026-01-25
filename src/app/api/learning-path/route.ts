/**
 * API endpoint for managing adaptive learning paths
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { 
  getLearningPathSummary,
  updateLearningPathFromAnalysis
} from '@/lib/utils/learning-path-updater'
import { analyzeMistakePatterns } from '@/lib/utils/mistake-pattern-tracker'
import { supabase } from '@/lib/database/supabase-client'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const summary = searchParams.get('summary')

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

    if (summary === 'true') {
      // Return summary data for dashboard
      const summaryData = await getLearningPathSummary(userProfile.id)
      return NextResponse.json({
        success: true,
        data: summaryData
      })
    }

    // Return full learning path data
    // This would typically fetch from a learning_paths table
    // For now, we'll return the summary with additional details
    const summaryData = await getLearningPathSummary(userProfile.id)
    
    return NextResponse.json({
      success: true,
      data: {
        ...summaryData,
        message: 'Full learning path data would be returned here in a complete implementation'
      }
    })

  } catch (error) {
    console.error('Error getting learning path:', error)
    return NextResponse.json(
      { error: 'Failed to get learning path' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

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

    switch (action) {
      case 'refresh':
        // Refresh learning path based on current mistake analysis
        const mistakeAnalysis = await analyzeMistakePatterns(userProfile.id)
        const updatedPath = await updateLearningPathFromAnalysis(userProfile.id, mistakeAnalysis)
        
        return NextResponse.json({
          success: true,
          data: {
            message: 'Learning path refreshed successfully',
            adaptiveAdjustments: updatedPath.adaptiveAdjustments.slice(-3),
            newRecommendations: updatedPath.recommendedLessons.slice(0, 5),
            currentFocus: updatedPath.currentFocus
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error updating learning path:', error)
    return NextResponse.json(
      { error: 'Failed to update learning path' },
      { status: 500 }
    )
  }
}