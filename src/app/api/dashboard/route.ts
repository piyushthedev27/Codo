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

    // Calculate weekly progress (mock data for now)
    const weeklyProgress = {
      xpEarned: Math.floor(Math.random() * 500) + 100,
      lessonsCompleted: Math.floor(Math.random() * 10) + 2,
      challengesAttempted: challengeStats.total,
      voiceSessionsUsed: Math.floor(Math.random() * 5) + 1
    }

    // Enhanced recent activities
    const enhancedActivities = [
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
      },
      {
        id: 'activity-3',
        type: 'collaboration' as const,
        title: 'Collaborated: "Build a Todo App"',
        description: 'With Alex & Jordan • Yesterday',
        xpEarned: 200,
        peerInvolved: 'alex',
        timestamp: 'Yesterday'
      },
      {
        id: 'activity-4',
        type: 'practice' as const,
        title: 'Practice: Solved 5 algorithm challenges',
        description: '2 days ago',
        xpEarned: 100,
        timestamp: '2 days ago'
      }
    ]

    // Enhanced stats for new dashboard
    const enhancedStats = generateEnhancedStats(
      profile,
      knowledgeGraph,
      enhancedActivities
    )

    // Mock recommended lessons
    const recommendedLessons = [
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
      recentActivities: enhancedActivities,
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
      recommendedLessons
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