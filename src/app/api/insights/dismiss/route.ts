import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { learningInsightsOperations } from '@/lib/database/operations'

/**
 * POST /api/insights/dismiss
 * Dismiss a learning insight
 */
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
    const { insightId } = body

    if (!insightId) {
      return NextResponse.json(
        { error: 'Insight ID is required' },
        { status: 400 }
      )
    }

    // Dismiss the insight
    const dismissedInsight = await learningInsightsOperations.dismiss(insightId)

    if (!dismissedInsight) {
      return NextResponse.json(
        { error: 'Insight not found or could not be dismissed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      insight: dismissedInsight,
      message: 'Insight dismissed successfully'
    })

  } catch (error) {
    console.error('Error dismissing insight:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss insight' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/insights/dismiss
 * Dismiss multiple insights at once
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { insightIds } = body

    if (!insightIds || !Array.isArray(insightIds) || insightIds.length === 0) {
      return NextResponse.json(
        { error: 'Insight IDs array is required' },
        { status: 400 }
      )
    }

    // Dismiss multiple insights
    const dismissedInsights = []
    const errors = []

    for (const insightId of insightIds) {
      try {
        const dismissed = await learningInsightsOperations.dismiss(insightId)
        if (dismissed) {
          dismissedInsights.push(dismissed)
        } else {
          errors.push(`Insight ${insightId} not found`)
        }
      } catch (error) {
        errors.push(`Failed to dismiss insight ${insightId}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      dismissedCount: dismissedInsights.length,
      dismissedInsights,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully dismissed ${dismissedInsights.length} insights`
    })

  } catch (error) {
    console.error('Error dismissing multiple insights:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss insights' },
      { status: 500 }
    )
  }
}