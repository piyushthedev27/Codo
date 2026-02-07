import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { 
  userProfileOperations, 
  aiPeerOperations, 
  knowledgeGraphOperations,
  learningInsightsOperations,
  challengeAttemptOperations,
  testDatabaseConnection,
  initializeUserData
} from '@/lib/database/operations'
import {
  userLearningStatsOperations,
  userAIPeersOperations,
  peerMessagesOperations,
  learningTracksOperations,
  userTrackProgressOperations,
  lessonRecommendationsOperations,
  enhancedActivitiesOperations
} from '@/lib/database/dashboard-operations'
import { generateEnhancedStats } from '@/lib/utils/stats-calculations'
import type { DashboardData } from '@/types/database'

// Demo data for fallback
const createDemoData = (userId?: string): DashboardData => {
  const demoProfile = {
    id: 'demo-profile',
    clerk_user_id: userId || 'demo',
    email: 'demo@example.com',
    first_name: 'Demo',
    last_name: 'User',
    skill_level: 'beginner' as const,
    learning_goal: 'learning' as const,
    primary_domain: 'javascript',
    current_xp: 350,
    current_level: 1,
    learning_streak: 3,
    voice_coaching_enabled: true,
    preferred_learning_style: 'mixed',
    timezone: 'UTC',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  const demoKnowledgeGraph = [
    {
      id: 'node-1',
      user_id: 'demo-profile',
      concept: 'Variables & Data Types',
      category: 'Programming',
      prerequisites: [],
      status: 'mastered' as const,
      position: { x: 100, y: 100 },
      connections: ['node-2'],
      mastery_percentage: 100,
      estimated_duration_minutes: 30,
      difficulty_level: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'node-2',
      user_id: 'demo-profile',
      concept: 'Functions',
      category: 'Programming',
      prerequisites: ['node-1'],
      status: 'in_progress' as const,
      position: { x: 200, y: 100 },
      connections: ['node-3'],
      mastery_percentage: 65,
      estimated_duration_minutes: 45,
      difficulty_level: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'node-3',
      user_id: 'demo-profile',
      concept: 'Arrays & Objects',
      category: 'Programming',
      prerequisites: ['node-2'],
      status: 'locked' as const,
      position: { x: 300, y: 100 },
      connections: [],
      mastery_percentage: 0,
      estimated_duration_minutes: 60,
      difficulty_level: 3,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]

  const demoActivities = [
    {
      id: 'activity-1',
      type: 'lesson_completed' as const,
      title: 'Completed: "React Hooks Deep Dive"',
      description: 'With Sarah • 2 hours ago',
      xpEarned: 150,
      peerInvolved: 'sarah',
      rating: 5,
      timestamp: '2 hours ago'
    },
    {
      id: 'activity-2',
      type: 'achievement' as const,
      title: 'Achieved: "10 Day Streak" Badge',
      description: '5 hours ago • Celebrated with all peers!',
      xpEarned: 100,
      timestamp: '5 hours ago'
    }
  ]

  return {
  profile: demoProfile,
  aiPeers: [
    {
      id: 'peer-1',
      user_id: 'demo-profile',
      name: 'Sarah',
      personality: 'curious',
      skill_level: 'beginner',
      avatar_url: '/images/avatars/sarah-3d.png',
      common_mistakes: ['Array method confusion', 'Variable scope issues'],
      interaction_style: 'Asks thoughtful questions and seeks clarification',
      backstory: 'A curious learner who loves understanding the "why" behind code',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'peer-2',
      user_id: 'demo-profile',
      name: 'Alex',
      personality: 'analytical',
      skill_level: 'intermediate',
      avatar_url: '/images/avatars/alex-3d.png',
      common_mistakes: ['Async/await mixing', 'Performance optimization'],
      interaction_style: 'Methodical and detail-oriented, likes to compare approaches',
      backstory: 'An analytical thinker who enjoys breaking down complex problems',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'peer-3',
      user_id: 'demo-profile',
      name: 'Jordan',
      personality: 'supportive',
      skill_level: 'advanced',
      avatar_url: '/images/avatars/jordan-3d.png',
      common_mistakes: ['Architecture decisions', 'Code organization'],
      interaction_style: 'Encouraging and helpful, provides guidance and mentorship',
      backstory: 'A supportive mentor who helps others learn from mistakes',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  knowledgeGraph: demoKnowledgeGraph,
  recentActivities: demoActivities,
  activeInsights: [],
  currentStreak: 3,
  weeklyProgress: {
    xpEarned: 250,
    lessonsCompleted: 4,
    challengesAttempted: 2,
    voiceSessionsUsed: 1
  },
  upcomingMilestones: {
    nextLevel: {
      current: 1,
      next: 2,
      xpNeeded: 650
    },
    nextConcept: demoKnowledgeGraph[2]
  },
  // Enhanced dashboard data
  enhancedStats: generateEnhancedStats(demoProfile, demoKnowledgeGraph, demoActivities),
  recommendedLessons: [
    {
      id: 'lesson-1',
      title: 'Advanced React Patterns',
      duration: '2.5 hours',
      difficulty: 'intermediate',
      description: 'Master hooks, context, and custom patterns...',
      recommendedBy: 'sarah',
      thumbnail: '/lessons/react-advanced.png'
    },
    {
      id: 'lesson-2',
      title: 'Data Structures Masterclass',
      duration: '3 hours',
      difficulty: 'advanced',
      description: 'Trees, graphs, and hash tables...',
      recommendedBy: 'alex',
      thumbnail: '/lessons/data-structures.png'
    },
    {
      id: 'lesson-3',
      title: 'System Design Fundamentals',
      duration: '4 hours',
      difficulty: 'advanced',
      description: 'Scalability, databases, caching...',
      recommendedBy: 'jordan',
      thumbnail: '/lessons/system-design.png'
    }
  ]
}
}

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

async function fetchAIPeerStatus(userId: string, aiPeers: any[]) {
  try {
    const peerStatuses = await userAIPeersOperations.getByUserId(userId)
    
    // Initialize peer relationships if they don't exist
    if (peerStatuses.length === 0 && aiPeers.length > 0) {
      for (const peer of aiPeers) {
        await userAIPeersOperations.createOrUpdate(userId, peer.id, {
          status: 'online',
          specialty_area: getSpecialtyForPeer(peer.name),
          skill_level_stars: getStarsForSkillLevel(peer.skill_level)
        })
      }
      return await userAIPeersOperations.getByUserId(userId)
    }
    
    return peerStatuses
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

function getSpecialtyForPeer(peerName: string): string {
  const specialties: Record<string, string> = {
    'Sarah': 'React Hooks & State Management',
    'Alex': 'Algorithms & Data Structures',
    'Jordan': 'System Design & Architecture'
  }
  return specialties[peerName] || 'General Programming'
}

function getStarsForSkillLevel(skillLevel: string): number {
  const stars: Record<string, number> = {
    'beginner': 2,
    'intermediate': 3,
    'advanced': 5
  }
  return stars[skillLevel] || 3
}

// ============================================================================
// Learning Path and Milestone Data (Requirement 23.3)
// ============================================================================

async function fetchLearningPathData(userId: string) {
  try {
    const currentTrack = await userTrackProgressOperations.getCurrentTrack(userId)
    
    if (!currentTrack) {
      // Create a default track for new users
      const tracks = await learningTracksOperations.getAll()
      if (tracks.length > 0) {
        const defaultTrack = tracks[0]
        await userTrackProgressOperations.createOrUpdate(userId, defaultTrack.id, {
          status: 'in_progress',
          progress_percentage: 0,
          started_at: new Date().toISOString()
        })
        return await userTrackProgressOperations.getCurrentTrack(userId)
      }
    }
    
    return currentTrack
  } catch (error) {
    console.error('Error fetching learning path data:', error)
    return null
  }
}

async function fetchMilestoneData(userId: string, trackId?: string) {
  try {
    if (!trackId) return null
    
    // Get track progress to find next milestone
    const progress = await userTrackProgressOperations.getCurrentTrack(userId)
    
    if (progress && progress.next_milestone_id) {
      // In a real implementation, we'd fetch the milestone details
      // For now, return mock milestone data
      return {
        id: progress.next_milestone_id,
        title: 'Complete 10 Lessons',
        description: 'Finish 10 lessons in your current track',
        progress: progress.progress_percentage,
        reward: {
          xp: 500,
          badge: 'Learning Champion',
          unlockedContent: ['Advanced React Patterns']
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching milestone data:', error)
    return null
  }
}

// ============================================================================
// Lesson Recommendation Generation (Requirement 23.4)
// ============================================================================

async function fetchLessonRecommendations(userId: string, aiPeers: any[], limit: number = 3) {
  try {
    let recommendations = await lessonRecommendationsOperations.getActiveByUserId(userId, limit)
    
    // Generate recommendations if none exist
    if (recommendations.length === 0 && aiPeers.length > 0) {
      const mockRecommendations = [
        {
          user_id: userId,
          lesson_id: null,
          title: 'Advanced React Patterns',
          description: 'Master hooks, context, and custom patterns for building scalable React applications',
          duration_minutes: 150,
          difficulty_level: 'intermediate' as const,
          recommended_by_peer_id: aiPeers[0]?.id,
          recommendation_reason: 'Based on your recent progress with React basics',
          relevance_score: 0.95,
          thumbnail_url: '/lessons/react-advanced.png',
          topic_tags: ['React', 'Hooks', 'Patterns'],
          learning_objectives: ['Master custom hooks', 'Understand context API', 'Build reusable components'],
          prerequisites: ['React Basics', 'JavaScript ES6'],
          is_active: true,
          is_completed: false,
          user_rating: null,
          expires_at: null,
          completed_at: null
        },
        {
          user_id: userId,
          lesson_id: null,
          title: 'Data Structures Masterclass',
          description: 'Deep dive into trees, graphs, and hash tables with practical implementations',
          duration_minutes: 180,
          difficulty_level: 'advanced' as const,
          recommended_by_peer_id: aiPeers[1]?.id,
          recommendation_reason: 'Perfect for strengthening your algorithm skills',
          relevance_score: 0.88,
          thumbnail_url: '/lessons/data-structures.png',
          topic_tags: ['Algorithms', 'Data Structures', 'Problem Solving'],
          learning_objectives: ['Implement tree structures', 'Master graph algorithms', 'Optimize with hash tables'],
          prerequisites: ['Arrays & Objects', 'Recursion'],
          is_active: true,
          is_completed: false,
          user_rating: null,
          expires_at: null,
          completed_at: null
        },
        {
          user_id: userId,
          lesson_id: null,
          title: 'System Design Fundamentals',
          description: 'Learn to design scalable systems with databases, caching, and load balancing',
          duration_minutes: 240,
          difficulty_level: 'advanced' as const,
          recommended_by_peer_id: aiPeers[2]?.id,
          recommendation_reason: 'Great next step for your learning journey',
          relevance_score: 0.82,
          thumbnail_url: '/lessons/system-design.png',
          topic_tags: ['System Design', 'Architecture', 'Scalability'],
          learning_objectives: ['Design distributed systems', 'Implement caching strategies', 'Handle high traffic'],
          prerequisites: ['Backend Development', 'Databases'],
          is_active: true,
          is_completed: false,
          user_rating: null,
          expires_at: null,
          completed_at: null
        }
      ]
      
      // Create recommendations in database
      for (const rec of mockRecommendations) {
        try {
          await lessonRecommendationsOperations.create(rec)
        } catch (error) {
          console.error('Error creating recommendation:', error)
        }
      }
      
      recommendations = await lessonRecommendationsOperations.getActiveByUserId(userId, limit)
    }
    
    return recommendations
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
    let activities = await enhancedActivitiesOperations.getRecentByUserId(userId, limit)
    
    // Generate sample activities if none exist
    if (activities.length === 0) {
      const sampleActivities = [
        {
          user_id: userId,
          activity_type: 'lesson_completed' as const,
          title: 'Completed: "React Hooks Deep Dive"',
          description: 'With Sarah • 2 hours ago',
          xp_earned: 150,
          bonus_xp: 25,
          xp_multiplier: 1.0,
          peer_involved_id: null,
          peer_contribution_type: 'teaching' as const,
          category: 'lesson',
          background_color: 'bg-blue-50 dark:bg-blue-900/20',
          icon_name: 'BookOpen',
          priority_level: 1,
          duration_minutes: 45,
          completion_quality: 0.92,
          mistakes_made: 2,
          achievement_badge: null,
          achievement_tier: null,
          celebration_shown: false,
          activity_timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: userId,
          activity_type: 'achievement' as const,
          title: 'Achieved: "10 Day Streak" Badge',
          description: '5 hours ago • Celebrated with all peers!',
          xp_earned: 100,
          bonus_xp: 50,
          xp_multiplier: 1.5,
          peer_involved_id: null,
          peer_contribution_type: null,
          category: 'achievement',
          background_color: 'bg-yellow-50 dark:bg-yellow-900/20',
          icon_name: 'Trophy',
          priority_level: 2,
          duration_minutes: 0,
          completion_quality: 1.0,
          mistakes_made: 0,
          achievement_badge: '10-day-streak',
          achievement_tier: 'gold' as const,
          celebration_shown: true,
          activity_timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: userId,
          activity_type: 'collaboration' as const,
          title: 'Collaborated: "Build a Todo App"',
          description: 'With Alex & Jordan • Yesterday',
          xp_earned: 200,
          bonus_xp: 30,
          xp_multiplier: 1.0,
          peer_involved_id: null,
          peer_contribution_type: 'collaboration' as const,
          category: 'collaboration',
          background_color: 'bg-green-50 dark:bg-green-900/20',
          icon_name: 'Users',
          priority_level: 1,
          duration_minutes: 90,
          completion_quality: 0.88,
          mistakes_made: 5,
          achievement_badge: null,
          achievement_tier: null,
          celebration_shown: false,
          activity_timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      // Create activities in database
      for (const activity of sampleActivities) {
        try {
          await enhancedActivitiesOperations.create(activity)
        } catch (error) {
          console.error('Error creating activity:', error)
        }
      }
      
      activities = await enhancedActivitiesOperations.getRecentByUserId(userId, limit)
    }
    
    return activities
  } catch (error) {
    console.error('Error fetching enhanced activities:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    // First test database connection
    const dbTest = await testDatabaseConnection()
    if (!dbTest.success) {
      console.warn('Database connection failed:', dbTest.message)
      // Return demo data if database is not available
      return NextResponse.json({
        success: true,
        data: createDemoData(),
        demo: true,
        message: 'Using demo data - database connection failed'
      })
    }

    // Try to get user authentication
    let userId: string | null = null
    try {
      const authResult = await auth()
      userId = authResult.userId
    } catch (authError) {
      console.warn('Authentication failed:', authError)
      // Return demo data if auth is not available
      return NextResponse.json({
        success: true,
        data: createDemoData(),
        demo: true,
        message: 'Using demo data - authentication not available'
      })
    }
    
    if (!userId) {
      return NextResponse.json({
        success: true,
        data: createDemoData(),
        demo: true,
        message: 'Using demo data - user not authenticated'
      })
    }

    // Try to get or create user profile
    let profile
    try {
      profile = await userProfileOperations.getByClerkId(userId)
      
      // If profile doesn't exist, try to create it
      if (!profile) {
        console.log('Profile not found, attempting to create for user:', userId)
        
        const initResult = await initializeUserData(userId, {
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          skillLevel: 'beginner',
          learningGoal: 'learning',
          primaryDomain: 'web-development',
          preferredLearningStyle: 'mixed',
          voiceCoachingEnabled: true
        })

        if (initResult.success && initResult.profile) {
          profile = initResult.profile
        } else {
          console.warn('Failed to initialize user data, using demo data:', initResult.error)
          return NextResponse.json({
            success: true,
            data: createDemoData(userId),
            demo: true,
            message: 'Using demo data - failed to initialize user profile'
          })
        }
      }
    } catch (profileError) {
      console.warn('Failed to get/create user profile, using demo data:', profileError)
      return NextResponse.json({
        success: true,
        data: createDemoData(userId),
        demo: true,
        message: 'Using demo data - profile operations failed'
      })
    }

    // Try to get additional data, but fall back to demo if any step fails
    let aiPeers, knowledgeGraph, activeInsights, challengeStats

    try {
      aiPeers = await aiPeerOperations.getByUserId(profile.id)
      knowledgeGraph = await knowledgeGraphOperations.getByUserId(profile.id)
      activeInsights = await learningInsightsOperations.getActiveByUserId(profile.id)
      challengeStats = await challengeAttemptOperations.getUserStats(profile.id)
    } catch (dataError) {
      console.warn('Failed to get user data, using demo data:', dataError)
      return NextResponse.json({
        success: true,
        data: createDemoData(userId),
        demo: true,
        message: 'Using demo data - failed to load user data'
      })
    }

    // ============================================================================
    // Fetch Enhanced Dashboard Data (Requirements 23.1-23.5)
    // ============================================================================

    // Fetch enhanced stats (Requirement 23.1)
    const enhancedStatsData = await fetchEnhancedStats(profile.id, profile, knowledgeGraph)

    // Fetch AI peer status and messages (Requirement 23.2)
    const peerStatuses = await fetchAIPeerStatus(profile.id, aiPeers)
    const recentMessages = await fetchRecentMessages(profile.id, 10)

    // Fetch learning path and milestone data (Requirement 23.3)
    const currentTrack = await fetchLearningPathData(profile.id)
    const nextMilestone = currentTrack ? await fetchMilestoneData(profile.id, currentTrack.track_id) : null

    // Fetch lesson recommendations (Requirement 23.4)
    const recommendations = await fetchLessonRecommendations(profile.id, aiPeers, 3)

    // Fetch enhanced activities (Requirement 23.5)
    const enhancedActivitiesData = await fetchEnhancedActivities(profile.id, 10)

    // Calculate weekly progress (mock data for now)
    const weeklyProgress = {
      xpEarned: Math.floor(Math.random() * 500) + 100,
      lessonsCompleted: Math.floor(Math.random() * 10) + 2,
      challengesAttempted: challengeStats.total,
      voiceSessionsUsed: Math.floor(Math.random() * 5) + 1
    }

    // Transform enhanced activities to dashboard format
    const recentActivities = enhancedActivitiesData.map(activity => ({
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
    const recommendedLessons = recommendations.map(rec => ({
      id: rec.id,
      title: rec.title,
      duration: `${Math.floor(rec.duration_minutes / 60)} hours`,
      difficulty: rec.difficulty_level,
      description: rec.description || '',
      recommendedBy: rec.recommended_by_peer_id ? 
        aiPeers.find(p => p.id === rec.recommended_by_peer_id)?.name.toLowerCase() || 'sarah' : 
        'sarah',
      thumbnail: rec.thumbnail_url || '/lessons/default.png'
    }))

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
      enhancedStats,
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
    
    // Always return demo data as fallback
    return NextResponse.json({
      success: true,
      data: createDemoData(),
      demo: true,
      message: `Using demo data - ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
}