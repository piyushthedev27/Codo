import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { learningInsightsOperations } from '@/lib/database/operations'
import { analyzeUserLearningPatterns } from '@/lib/utils/pattern-detection'
import { generateProactiveRecommendations } from '@/lib/utils/proactive-recommendations'

/**
 * GET /api/insights
 * Get user's learning insights and recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeRecommendations = searchParams.get('recommendations') === 'true'
    const includeDismissed = searchParams.get('dismissed') === 'true'

    // Get existing insights from database
    const existingInsights = await learningInsightsOperations.getActiveByUserId(userId)
    
    // Filter out dismissed insights unless specifically requested
    const activeInsights = includeDismissed 
      ? existingInsights 
      : existingInsights.filter(insight => !insight.dismissed)

    let recommendations: any[] = []
    let patterns: any[] = []

    if (includeRecommendations) {
      try {
        // Generate fresh pattern analysis and recommendations
        const patternAnalysis = await analyzeUserLearningPatterns(userId)
        patterns = patternAnalysis.patterns
        
        // Generate new insights from patterns if needed
        const newInsights = patternAnalysis.insights
        
        // Save new insights to database
        for (const newInsight of newInsights) {
          try {
            // Check if similar insight already exists
            const existingSimilar = existingInsights.find(existing => 
              existing.insight_type === newInsight.insight_type &&
              existing.title === newInsight.title &&
              !existing.dismissed
            )
            
            if (!existingSimilar) {
              await learningInsightsOperations.create(userId, newInsight)
            }
          } catch (error) {
            console.warn('Failed to save new insight:', error)
          }
        }
        
        // Generate proactive recommendations
        recommendations = await generateProactiveRecommendations(userId)
      } catch (error) {
        console.warn('Failed to generate recommendations:', error)
        recommendations = []
        patterns = []
      }
    }

    // Get updated insights after potentially adding new ones
    const finalInsights = includeRecommendations 
      ? await learningInsightsOperations.getActiveByUserId(userId)
      : activeInsights

    const filteredFinalInsights = includeDismissed 
      ? finalInsights 
      : finalInsights.filter(insight => !insight.dismissed)

    return NextResponse.json({
      success: true,
      insights: filteredFinalInsights,
      recommendations: includeRecommendations ? recommendations : undefined,
      patterns: includeRecommendations ? patterns : undefined,
      meta: {
        totalInsights: filteredFinalInsights.length,
        activeInsights: filteredFinalInsights.filter(i => !i.dismissed).length,
        dismissedInsights: filteredFinalInsights.filter(i => i.dismissed).length,
        recommendationsCount: recommendations.length,
        patternsCount: patterns.length
      }
    })

  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/insights
 * Create a new learning insight
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
    const {
      insight_type,
      title,
      message,
      action_recommended,
      priority = 'medium',
      expires_at,
      metadata = {}
    } = body

    if (!insight_type || !title || !message) {
      return NextResponse.json(
        { error: 'insight_type, title, and message are required' },
        { status: 400 }
      )
    }

    const newInsight = await learningInsightsOperations.create(userId, {
      insight_type,
      title,
      message,
      action_recommended,
      priority,
      dismissed: false,
      expires_at,
      metadata
    })

    return NextResponse.json({
      success: true,
      insight: newInsight,
      message: 'Insight created successfully'
    })

  } catch (error) {
    console.error('Error creating insight:', error)
    return NextResponse.json(
      { error: 'Failed to create insight' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/insights
 * Trigger fresh insight generation and analysis
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Force regeneration of insights and recommendations
    const patternAnalysis = await analyzeUserLearningPatterns(userId)
    const recommendations = await generateProactiveRecommendations(userId)

    // Save new insights to database
    const savedInsights = []
    for (const newInsight of patternAnalysis.insights) {
      try {
        const saved = await learningInsightsOperations.create(userId, newInsight)
        savedInsights.push(saved)
      } catch (error) {
        console.warn('Failed to save insight during regeneration:', error)
      }
    }

    // Get all current insights
    const allInsights = await learningInsightsOperations.getActiveByUserId(userId)
    const activeInsights = allInsights.filter(insight => !insight.dismissed)

    return NextResponse.json({
      success: true,
      insights: activeInsights,
      recommendations,
      patterns: patternAnalysis.patterns,
      newInsightsGenerated: savedInsights.length,
      message: `Generated ${savedInsights.length} new insights and ${recommendations.length} recommendations`
    })

  } catch (error) {
    console.error('Error regenerating insights:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate insights' },
      { status: 500 }
    )
  }
}