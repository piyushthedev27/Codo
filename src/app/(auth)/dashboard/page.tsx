'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import '@/styles/dashboard-animations.css'
import { 
  Brain, 
  Target, 
  Zap, 
  Users, 
  TrendingUp, 
  Calendar,
  Award,
  BookOpen,
  Mic,
  Code,
  ArrowRight,
  Sparkles,
  AlertCircle,
  MessageCircle,
  Clock,
  Star,
  Trophy,
  Play,
  ExternalLink,
  Settings
} from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { HeroWelcomeSection } from './components/HeroWelcomeSection'
import { generateEnhancedStats } from '@/lib/utils/stats-calculations'
import { DashboardLoadingSkeleton, AIPeerLoadingSkeleton, SkeletonCard } from '@/components/ui/loading'
import { cachedFetch, CACHE_CONFIG } from '@/lib/cache/api-cache'
import type { DashboardData } from '@/types/database'

// Lazy load dashboard components for better performance
const AIPeerCards = dynamic(() => import('./components/AIPeerCards').then(mod => ({ default: mod.AIPeerCards })), {
  loading: () => <AIPeerLoadingSkeleton />
})

const LearningPath = dynamic(() => import('./components/LearningPath').then(mod => ({ default: mod.LearningPath })), {
  loading: () => <SkeletonCard lines={4} />
})

const RecommendedLessons = dynamic(() => import('./components/RecommendedLessons').then(mod => ({ default: mod.RecommendedLessons })), {
  loading: () => <SkeletonCard lines={3} />
})

const EnhancedStatsGrid = dynamic(() => import('./components/EnhancedStatsGrid').then(mod => ({ default: mod.EnhancedStatsGrid })), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} showHeader={false} lines={2} />
      ))}
    </div>
  )
})

// Demo data for when database is not available
const demoData: DashboardData = {
  profile: {
    id: 'demo-profile',
    clerk_user_id: 'demo',
    email: 'demo@example.com',
    first_name: 'Demo',
    last_name: 'User',
    skill_level: 'beginner',
    learning_goal: 'learning',
    primary_domain: 'javascript',
    current_xp: 350,
    current_level: 1,
    learning_streak: 3,
    voice_coaching_enabled: true,
    preferred_learning_style: 'mixed',
    timezone: 'UTC',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
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
  knowledgeGraph: [
    {
      id: 'node-1',
      user_id: 'demo-profile',
      concept: 'Variables & Data Types',
      category: 'Programming',
      prerequisites: [],
      status: 'mastered',
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
      status: 'in_progress',
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
      status: 'locked',
      position: { x: 300, y: 100 },
      connections: [],
      mastery_percentage: 0,
      estimated_duration_minutes: 60,
      difficulty_level: 3,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  recentActivities: [],
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
    nextConcept: {
      id: 'node-3',
      user_id: 'demo-profile',
      concept: 'Arrays & Objects',
      category: 'Programming',
      prerequisites: ['node-2'],
      status: 'locked',
      position: { x: 300, y: 100 },
      connections: [],
      mastery_percentage: 0,
      estimated_duration_minutes: 60,
      difficulty_level: 3,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  }
}

export default function DashboardPage() {
  const { user } = useUser()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingDemoData, setUsingDemoData] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Use cached API fetch with automatic caching
      const result = await cachedFetch<{ data: DashboardData, demo?: boolean }>('/api/dashboard', {}, {
        duration: CACHE_CONFIG.DURATIONS.MEDIUM,
        storage: 'MEMORY'
      })
      
      setDashboardData(result.data)
      setUsingDemoData(result.demo || false)
    } catch (err) {
      console.warn('Dashboard API failed, using demo data:', err)
      setDashboardData(demoData)
      setUsingDemoData(true)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DashboardLoadingSkeleton />
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error || 'Failed to load dashboard data'}
            </p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { profile, aiPeers, knowledgeGraph, weeklyProgress, upcomingMilestones, currentStreak, recentActivities } = dashboardData

  // Calculate knowledge graph stats
  const totalNodes = knowledgeGraph.length
  const completedNodes = knowledgeGraph.filter(node => node.status === 'mastered').length
  const inProgressNodes = knowledgeGraph.filter(node => node.status === 'in_progress').length
  const progressPercentage = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0

  // Generate enhanced stats using the calculation utilities
  const enhancedStats = generateEnhancedStats(
    profile,
    knowledgeGraph,
    recentActivities || []
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

  // Enhanced recent activities with AI peer involvement
  const enhancedActivities = [
    {
      id: 'activity-1',
      type: 'lesson_completed',
      title: 'Completed: "React Hooks Deep Dive"',
      description: 'With Sarah • 2 hours ago',
      xpEarned: 150,
      peerInvolved: 'sarah',
      rating: 5,
      timestamp: '2 hours ago'
    },
    {
      id: 'activity-2',
      type: 'achievement',
      title: 'Achieved: "10 Day Streak" Badge',
      description: '5 hours ago • Celebrated with all peers!',
      xpEarned: 100,
      timestamp: '5 hours ago'
    },
    {
      id: 'activity-3',
      type: 'collaboration',
      title: 'Collaborated: "Build a Todo App"',
      description: 'With Alex & Jordan • Yesterday',
      xpEarned: 200,
      peerInvolved: 'alex',
      timestamp: 'Yesterday'
    },
    {
      id: 'activity-4',
      type: 'practice',
      title: 'Practice: Solved 5 algorithm challenges',
      description: '2 days ago',
      xpEarned: 100,
      timestamp: '2 days ago'
    }
  ]

  return (
    <div className="min-h-screen dashboard-animated-bg">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 mobile-safe-area">
        {/* Demo Data Warning */}
        {usingDemoData && (
          <Card className="mb-4 sm:mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">Demo Mode</span>
              </div>
              <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Database connection failed. Showing demo data. Please check your environment configuration.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Hero Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <HeroWelcomeSection 
            user={user ? { firstName: user.firstName } : undefined}
            profile={profile}
            aiPeers={aiPeers}
            learningProgress={{
              percentage: Math.round(progressPercentage),
              lessonsCompleted: completedNodes,
              totalLessons: totalNodes
            }}
            currentStreak={currentStreak}
          />
        </div>

        {/* Enhanced Stats Cards Grid */}
        <div className="mb-6 sm:mb-8">
          <EnhancedStatsGrid stats={enhancedStats} />
        </div>

        {/* Two Column Layout - Stack on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Column (2/3 width on desktop, full width on mobile) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* AI Peers Section */}
            <AIPeerCards peers={aiPeers} />

            {/* Enhanced Recent Activity */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 card-hover-effect fade-in-delay-2">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    Recent Activity
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                    View All
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </Button>
                </div>
                <CardDescription className="text-sm">
                  Your learning journey with AI peers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {enhancedActivities.map((activity, index) => (
                    <div key={activity.id} className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg smooth-transition card-hover-effect fade-in-delay-${Math.min(index + 1, 4)}`}>
                      <div className="flex-shrink-0 mt-0.5">
                        {activity.type === 'lesson_completed' && <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
                        {activity.type === 'achievement' && <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />}
                        {activity.type === 'collaboration' && <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />}
                        {activity.type === 'practice' && <Code className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                          {activity.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{activity.timestamp}</span>
                          {activity.xpEarned && (
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                              +{activity.xpEarned} XP
                            </span>
                          )}
                        </div>
                      </div>
                      {activity.peerInvolved && (
                        <div className="flex-shrink-0">
                          <Avatar peerId={activity.peerInvolved} size="sm" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (1/3 width on desktop, full width on mobile) */}
          <div className="space-y-6 sm:space-y-8">
            {/* Learning Path Section */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 card-hover-effect fade-in-delay-3">
              <LearningPath 
                knowledgeGraph={knowledgeGraph}
                upcomingMilestones={upcomingMilestones}
                primaryDomain={profile.primary_domain}
                currentXP={profile.current_xp}
                currentLevel={profile.current_level}
              />
            </div>

            {/* Recommended Lessons Section */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 card-hover-effect fade-in-delay-4">
              <RecommendedLessons lessons={recommendedLessons} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}