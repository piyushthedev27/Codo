import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { 
  userProfileOperations, 
  aiPeerOperations, 
  knowledgeGraphOperations,
  learningInsightsOperations,
  challengeAttemptOperations 
} from '@/lib/database/operations'
import type { DashboardData } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const profile = await userProfileOperations.getByClerkId(userId)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get AI peers
    const aiPeers = await aiPeerOperations.getByUserId(profile.id)

    // Get knowledge graph
    const knowledgeGraph = await knowledgeGraphOperations.getByUserId(profile.id)

    // Get active insights
    const activeInsights = await learningInsightsOperations.getActiveByUserId(profile.id)

    // Get user challenge stats
    const challengeStats = await challengeAttemptOperations.getUserStats(profile.id)

    // Calculate weekly progress (mock data for now)
    const weeklyProgress = {
      xpEarned: Math.floor(Math.random() * 500) + 100,
      lessonsCompleted: Math.floor(Math.random() * 10) + 2,
      challengesAttempted: challengeStats.total,
      voiceSessionsUsed: Math.floor(Math.random() * 5) + 1
    }

    // Calculate next level info
    const xpPerLevel = 1000
    const currentLevelXP = profile.current_xp % xpPerLevel
    const xpNeeded = xpPerLevel - currentLevelXP

    // Find next concept to unlock
    const nextConcept = knowledgeGraph.find(node => node.status === 'locked') || null

    const dashboardData: DashboardData = {
      profile,
      aiPeers,
      knowledgeGraph,
      recentActivities: [], // Will be implemented later
      activeInsights,
      currentStreak: profile.learning_streak,
      weeklyProgress,
      upcomingMilestones: {
        nextLevel: {
          current: profile.current_level,
          next: profile.current_level + 1,
          xpNeeded
        },
        nextConcept
      }
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}