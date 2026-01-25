/**
 * API endpoint for managing mistake patterns
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { 
  getUserMistakePatterns, 
  getMistakePatternsSummary,
  markMistakeResolved 
} from '@/lib/utils/mistake-pattern-tracker'
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
    const resolved = searchParams.get('resolved')
    const language = searchParams.get('language')
    const limit = searchParams.get('limit')
    const sortBy = searchParams.get('sortBy')
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
      const summaryData = await getMistakePatternsSummary(userProfile.id)
      return NextResponse.json({
        success: true,
        data: summaryData
      })
    }

    // Get mistake patterns with filters
    const options: any = {}
    if (resolved !== null) options.resolved = resolved === 'true'
    if (language) options.language = language
    if (limit) options.limit = parseInt(limit)
    if (sortBy) options.sortBy = sortBy as 'frequency' | 'recent' | 'created'

    const patterns = await getUserMistakePatterns(userProfile.id, options)

    return NextResponse.json({
      success: true,
      data: patterns
    })

  } catch (error) {
    console.error('Error getting mistake patterns:', error)
    return NextResponse.json(
      { error: 'Failed to get mistake patterns' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { patternId, action, resolutionNotes } = body

    if (!patternId || !action) {
      return NextResponse.json(
        { error: 'Pattern ID and action are required' },
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

    // Verify the pattern belongs to the user
    const { data: pattern, error: patternError } = await supabase
      .from('mistake_patterns')
      .select('id, user_id')
      .eq('id', patternId)
      .eq('user_id', userProfile.id)
      .single()

    if (patternError || !pattern) {
      return NextResponse.json(
        { error: 'Mistake pattern not found' },
        { status: 404 }
      )
    }

    let updatedPattern
    switch (action) {
      case 'resolve':
        updatedPattern = await markMistakeResolved(patternId, resolutionNotes)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: updatedPattern
    })

  } catch (error) {
    console.error('Error updating mistake pattern:', error)
    return NextResponse.json(
      { error: 'Failed to update mistake pattern' },
      { status: 500 }
    )
  }
}