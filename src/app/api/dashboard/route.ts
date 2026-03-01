/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import {
  userProfileOperations,
  aiPeerOperations,
  knowledgeGraphOperations,
  learningInsightsOperations,
  challengeAttemptOperations,
  testDatabaseConnection,
  initializeUserData
} from '@/lib/database/operations'
import { supabase } from '@/lib/database/supabase-client'
import {
  userLearningStatsOperations,
  userAIPeersOperations,
  peerMessagesOperations,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  learningTracksOperations as _learningTracksOperations,
  userTrackProgressOperations,
  lessonRecommendationsOperations,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  enhancedActivitiesOperations as _enhancedActivitiesOperations
} from '@/lib/database/dashboard-operations'
import { generateEnhancedStats } from '@/lib/utils/stats-calculations'
import type { DashboardData } from '@/types/database'

// ============================================================================
// Enhanced Stats Data Fetching Functions (Requirement 23.1)
// ============================================================================

async function fetchEnhancedStats(userId: string, profile: any, knowledgeGraph: any[]) {
  try {
    // Get or create learning stats
    let stats = await userLearningStatsOperations.getByUserId(userId)

    if (!stats) {
      // Initialize stats for new users
      const completedNodes = knowledgeGraph.filter(n => n.status === 'mastered').length
      const progressPercentage = knowledgeGraph.length > 0
        ? Math.round((completedNodes / knowledgeGraph.length) * 100)
        : 0

      stats = await userLearningStatsOperations.createOrUpdate(userId, {
        learning_progress_percentage: progressPercentage,
        lessons_completed_count: completedNodes,
        current_streak_days: profile.learning_streak,
        best_streak_days: profile.learning_streak,
        skills_mastered_count: completedNodes,
        recent_skills_mastered: knowledgeGraph
          .filter(n => n.status === 'mastered')
          .slice(0, 3)
          .map(n => n.concept)
      })
    }

    return {
      learningProgress: {
        percentage: stats.learning_progress_percentage,
        lessonsCompleted: stats.lessons_completed_count,
        weeklyLessons: stats.weekly_lessons_completed,
        trend: stats.progress_trend,
        trendText: getTrendText(stats.progress_trend, stats.weekly_lessons_completed, stats.previous_week_lessons)
      },
      currentStreak: {
        days: stats.current_streak_days,
        bestStreak: stats.best_streak_days,
        milestoneMessage: stats.streak_milestone_message,
        trend: stats.current_streak_days >= stats.best_streak_days ? 'up' : 'stable'
      },
      skillsMastered: {
        count: stats.skills_mastered_count,
        recentSkills: stats.recent_skills_mastered,
        monthlyProgress: stats.monthly_skills_acquired,
        trend: stats.skills_trend
      },
      codingTime: {
        thisWeekMinutes: stats.coding_time_this_week_minutes,
        dailyAverage: stats.daily_average_minutes,
        previousWeek: stats.previous_week_minutes,
        trend: stats.coding_time_trend,
        trendText: getTimeTrendText(stats.coding_time_trend, stats.coding_time_this_week_minutes, stats.previous_week_minutes)
      }
    }
  } catch (error) {
    console.error('Error fetching enhanced stats:', error)
    return null
  }
}

function getTrendText(trend: string, current: number, previous: number): string {
  if (trend === 'up') {
    const increase = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 100
    return `+${increase}% this week`
  } else if (trend === 'down') {
    const decrease = previous > 0 ? Math.round(((previous - current) / previous) * 100) : 0
    return `-${decrease}% this week`
  }
  return 'Steady progress'
}

function getTimeTrendText(trend: string, current: number, previous: number): string {
  if (trend === 'up') {
    const increase = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 100
    return `+${increase}% vs last week`
  } else if (trend === 'down') {
    const decrease = previous > 0 ? Math.round(((previous - current) / previous) * 100) : 0
    return `-${decrease}% vs last week`
  }
  return 'Consistent pace'
}

// ============================================================================
// AI Peer Status and Messages Retrieval (Requirement 23.2)
// ============================================================================

async function fetchAIPeerStatus(userId: string) {
  try {
    return await userAIPeersOperations.getByUserId(userId)
  } catch (error) {
    console.error('Error fetching AI peer status:', error)
    return []
  }
}

async function fetchRecentMessages(userId: string, limit: number = 10) {
  try {
    return await peerMessagesOperations.getRecentByUserId(userId, limit)
  } catch (error) {
    console.error('Error fetching recent messages:', error)
    return []
  }
}



// ============================================================================
// Learning Path and Milestone Data (Requirement 23.3)
// ============================================================================

async function fetchLearningPathData(userId: string) {
  try {
    return await userTrackProgressOperations.getCurrentTrack(userId)
  } catch (error) {
    console.error('Error fetching learning path data:', error)
    return null
  }
}

async function fetchMilestoneData(profileCurrentXp: number, profileCurrentLevel: number, trackId: string) {
  try {
    const xpPerLevel = 1000
    const xpInCurrentLevel = profileCurrentXp % xpPerLevel
    const xpNeeded = xpPerLevel - xpInCurrentLevel
    // Return a milestone object shaped from the profile's XP/level progression
    return {
      type: 'level_up',
      title: `Reach Level ${profileCurrentLevel + 1}`,
      description: 'Keep completing lessons to level up your profile',
      xpRequired: xpPerLevel,
      xpCurrent: xpInCurrentLevel,
      xpNeeded,
      trackId
    }
  } catch (error) {
    console.error('Error computing milestone data:', error)
    return null
  }
}

// ============================================================================
// Lesson Recommendation Generation (Requirement 23.4)
// ============================================================================

async function fetchLessonRecommendations(userId: string, limit: number = 3) {
  try {
    return await lessonRecommendationsOperations.getActiveByUserId(userId, limit)
  } catch (error) {
    console.error('Error fetching lesson recommendations:', error)
    return []
  }
}

// ============================================================================
// Enhanced Activity Feed with XP and Peer Involvement (Requirement 23.5)
// ============================================================================

async function fetchEnhancedActivities(userId: string, limit: number = 10) {
  try {
    // Fetch recent activities
    const { data: recentActivities } = await supabase
      .from('enhanced_activities')
      .select('*')
      .eq('user_id', userId)
      .order('activity_timestamp', { ascending: false })
      .limit(limit)

    return recentActivities || []
  } catch (error) {
    console.error('Error fetching enhanced activities:', error)
    return []
  }
}

export async function GET(_request: NextRequest) {
  try {
    // First test database connection
    const dbTest = await testDatabaseConnection()
    if (!dbTest.success) {
      console.error('Database connection failed:', dbTest.message)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed. Please check your configuration.'
      }, { status: 503 })
    }

    // Try to get user authentication
    let userId: string | null = null
    try {
      const authResult = await auth()
      userId = authResult.userId
    } catch (authError) {
      console.error('Authentication failed:', authError)
      return NextResponse.json({
        success: false,
        error: 'Authentication failed. Please sign in again.'
      }, { status: 401 })
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User not authenticated. Please sign in.'
      }, { status: 401 })
    }

    // Try to get or create user profile
    let profile
    try {
      profile = await userProfileOperations.getByClerkId(userId)

      // If profile doesn't exist, try to create it using real Clerk user data
      if (!profile) {
        console.log('Profile not found, attempting to create for user:', userId)

        // Fetch real user data from Clerk instead of using hardcoded placeholders
        let realEmail = ''
        let realFirstName = ''
        let realLastName = ''
        try {
          const client = await clerkClient()
          const clerkUser = await client.users.getUser(userId)
          realEmail = clerkUser.emailAddresses?.[0]?.emailAddress ?? ''
          realFirstName = clerkUser.firstName ?? ''
          realLastName = clerkUser.lastName ?? ''
        } catch (clerkErr) {
          console.error('Failed to fetch Clerk user data:', clerkErr)
        }

        const initResult = await initializeUserData(userId, {
          email: realEmail,
          firstName: realFirstName,
          lastName: realLastName,
          skillLevel: 'beginner',
          learningGoal: 'learning',
          primaryDomain: 'web-development',
          preferredLearningStyle: 'mixed',
          voiceCoachingEnabled: true
        })

        if (initResult.success && initResult.profile) {
          profile = initResult.profile
        } else {
          console.error('Failed to initialize user data:', initResult.error)
          return NextResponse.json({
            success: false,
            error: 'Failed to initialize user profile. Please try again.'
          }, { status: 500 })
        }
      }
    } catch (profileError) {
      console.error('Failed to get/create user profile:', profileError)
      return NextResponse.json({
        success: false,
        error: 'Failed to load user profile. Please try again.'
      }, { status: 500 })
    }

    // Try to get additional data
    let aiPeers, knowledgeGraph, activeInsights, challengeStats

    try {
      aiPeers = await aiPeerOperations.getByUserId(profile.id)
      knowledgeGraph = await knowledgeGraphOperations.getByUserId(profile.id)
      activeInsights = await learningInsightsOperations.getActiveByUserId(profile.id)
      challengeStats = await challengeAttemptOperations.getUserStats(profile.id)
    } catch (dataError) {
      console.error('Failed to get user data:', dataError)
      return NextResponse.json({
        success: false,
        error: 'Failed to load dashboard data. Please try again.'
      }, { status: 500 })
    }

    // ============================================================================
    // Fetch Enhanced Dashboard Data (Requirements 23.1-23.5)
    // ============================================================================

    // Fetch enhanced stats (Requirement 23.1)
    const enhancedStatsData = await fetchEnhancedStats(profile.id, profile, knowledgeGraph)

    // Fetch AI peer status and messages (Requirement 23.2)
    const peerStatuses = await fetchAIPeerStatus(profile.id)
    const recentMessages = await fetchRecentMessages(profile.id, 10)

    // Fetch learning path and milestone data (Requirement 23.3)
    const currentTrack = await fetchLearningPathData(profile.id)
    const nextMilestone = currentTrack
      ? fetchMilestoneData(profile.current_xp, profile.current_level, currentTrack.track_id)
      : null

    // Fetch lesson recommendations (Requirement 23.4)
    const recommendations = await fetchLessonRecommendations(profile.id, 3)

    // Fetch enhanced activities (Requirement 23.5)
    const enhancedActivitiesData = await fetchEnhancedActivities(profile.id, 10)

    // Calculate weekly progress (derived from database stats)
    const weeklyProgress = {
      xpEarned: 0,
      lessonsCompleted: 0,
      challengesAttempted: challengeStats.total,
      voiceSessionsUsed: 0
    }

    // Transform enhanced activities to dashboard format
    const recentActivities = enhancedActivitiesData.map((activity: any) => ({
      id: activity.id,
      type: activity.activity_type as any,
      title: activity.title,
      description: activity.description || '',
      xpEarned: activity.xp_earned + activity.bonus_xp,
      peerInvolved: activity.peer_involved_id || undefined,
      rating: activity.completion_quality ? Math.round(activity.completion_quality * 5) : undefined,
      timestamp: new Date(activity.activity_timestamp).toLocaleString()
    }))

    // Transform recommendations to dashboard format
    const recommendedLessons = recommendations.map(rec => {
      // Format duration correctly: show minutes for < 60, hours+minutes for >= 60
      const mins = rec.duration_minutes
      let durationLabel: string
      if (mins < 60) {
        durationLabel = `${mins} min`
      } else {
        const h = Math.floor(mins / 60)
        const m = mins % 60
        durationLabel = m > 0 ? `${h}h ${m}m` : `${h}h`
      }
      return {
        id: rec.id,
        title: rec.title,
        duration: durationLabel,
        difficulty: rec.difficulty_level,
        description: rec.description || '',
        recommendedBy: rec.recommended_by_peer_id
          ? aiPeers.find(p => p.id === rec.recommended_by_peer_id)?.name.toLowerCase() || 'sarah'
          : 'sarah',
        thumbnail: rec.thumbnail_url || '/lessons/default.png'
      }
    })

    // Enhanced stats for new dashboard
    const enhancedStats = enhancedStatsData || generateEnhancedStats(
      profile,
      knowledgeGraph,
      recentActivities
    )

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
      recentActivities,
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
      },
      // Enhanced dashboard data
      enhancedStats: enhancedStats as any,
      recommendedLessons,
      // Additional enhanced data
      peerStatuses: peerStatuses as any,
      recentMessages: recentMessages as any,
      currentTrack: currentTrack as any,
      nextMilestone: nextMilestone as any
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      demo: false
    })
  } catch (error) {
    console.error('Dashboard API error:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}