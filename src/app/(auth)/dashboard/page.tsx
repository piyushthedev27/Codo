'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { _Progress } from '@/components/ui/progress'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { _Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import '@/styles/dashboard-animations.css'
import {
  Target,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _Zap,
  Users,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _TrendingUp,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _Calendar,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _Award,
  BookOpen,
  AlertCircle,
  Clock,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _Star,
  Trophy,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ArrowRight,
  Sparkles
} from 'lucide-react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { generateEnhancedStats } from '@/lib/utils/stats-calculations'
import { DashboardLoadingSkeleton, AIPeerLoadingSkeleton, SkeletonCard } from '@/components/ui/loading'
import { DashboardSyncManager } from '@/lib/realtime/dashboard-sync'
import { createEnhancedActivity, type EnhancedActivity as UIActivity } from '@/lib/activities/activity-tracker'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { DashboardData, _RecommendedLesson } from '@/types/database'

// Lazy load dashboard components for better performance
const HeroWelcomeSection = dynamic(() => import('./components/HeroWelcomeSection').then(mod => ({ default: mod.HeroWelcomeSection })), {
  loading: () => <SkeletonCard lines={4} />
})

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} showHeader={false} lines={2} />
      ))}
    </div>
  )
})

const EnhancedActivityFeed = dynamic(() => import('./components/EnhancedActivityFeed').then(mod => ({ default: mod.EnhancedActivityFeed })), {
  loading: () => <SkeletonCard lines={4} />
})

export default function DashboardPage() {
  const { user } = useUser()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Real-time synchronization
  useEffect(() => {
    if (!dashboardData?.profile?.id) return

    const syncManager = new DashboardSyncManager({
      userId: dashboardData.profile.id,
      onStatsUpdate: (stats) => {
        setDashboardData(prev => prev ? { ...prev, enhancedStats: stats } : prev)
      },
      onPeerStatusUpdate: (peerId, status) => {
        setDashboardData(prev => {
          if (!prev) return prev
          const newPeers = prev.aiPeers.map(p => p.id === peerId ? { ...p, ...status } : p)
          return { ...prev, aiPeers: newPeers }
        })
      },
      onNewMessage: (message) => {
        setDashboardData(prev => {
          if (!prev) return prev
          return { ...prev, recentMessages: [message, ...(prev.recentMessages || [])].slice(0, 10) }
        })
      },
      onProgressUpdate: (progress) => {
        setDashboardData(prev => prev ? { ...prev, currentTrack: progress } : prev)
      },
      onActivityUpdate: (activity) => {
        setDashboardData(prev => {
          if (!prev) return prev
          // The database returns a generic activity, we transform it
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _enhanced = createEnhancedActivity({
            ...activity,
            activity_type: activity.activity_type || 'lesson'
          })

          // We need to convert it back to the database format if we're storing it in recentActivities
          // or just update how we use it. For simplicity, we'll just push it.
          return {
            ...prev,
            recentActivities: [activity, ...(prev.recentActivities || [])].slice(0, 10)
          }
        })
      }
    })

    syncManager.start()

    return () => {
      syncManager.stop()
    }
  }, [dashboardData?.profile?.id])

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const response = await fetch('/api/dashboard')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load dashboard data')
      }

      setDashboardData(result.data)
    } catch (err) {
      console.error('Dashboard API failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardLoadingSkeleton />
      </DashboardLayout>
    )
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Error Loading Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {error || 'Failed to load dashboard data. Please check your database connection and try again.'}
              </p>
              <Button onClick={fetchDashboardData} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const {
    profile,
    aiPeers,
    knowledgeGraph,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _weeklyProgress,
    upcomingMilestones,
    currentStreak,
    recentActivities,
    recommendedLessons
  } = dashboardData

  // Calculate knowledge graph stats
  const totalNodes = knowledgeGraph.length
  const completedNodes = knowledgeGraph.filter(node => node.status === 'mastered').length
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _inProgressNodes = knowledgeGraph.filter(node => node.status === 'in_progress').length
  const progressPercentage = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0

  // Generate enhanced stats using the calculation utilities
  const enhancedStats = dashboardData.enhancedStats || generateEnhancedStats(
    profile,
    knowledgeGraph,
    recentActivities || []
  )

  // Learning progress for HeroWelcomeSection
  const learningProgress = {
    percentage: Math.round(progressPercentage) || 0,
    lessonsCompleted: completedNodes || 0,
    totalLessons: Math.max(totalNodes, 1),
  }

  // Transform activities for the UI component (Requirement 23.5)
  const enhancedActivities: UIActivity[] = (recentActivities || []).map(activity =>
    createEnhancedActivity(activity)
  )

  // Transform recommendations for the UI component (Requirement 23.4)
  const UIRecommendedLessons = (recommendedLessons || []).map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    duration: lesson.duration,
    difficulty: lesson.difficulty,
    description: lesson.description,
    recommendedBy: lesson.recommendedBy,
    thumbnail: lesson.thumbnail || '/lessons/default.png'
  }))

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Hero Welcome Section */}
        <HeroWelcomeSection
          user={user}
          profile={profile}
          aiPeers={aiPeers}
          learningProgress={learningProgress}
          currentStreak={currentStreak}
        />

        {/* Stats Grid */}
        <EnhancedStatsGrid stats={enhancedStats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Peers Section */}
            <div id="ai-peers-section">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Your AI Learning Companions
                  </CardTitle>
                  <CardDescription>
                    Interact with your personalized AI peers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIPeerCards peers={aiPeers} />
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest learning achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedActivityFeed
                  activities={enhancedActivities}
                  maxDisplay={5}
                  showCelebrations={true}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Learning Path */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Learning Path
                </CardTitle>
                <CardDescription>
                  Your personalized roadmap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LearningPath
                  knowledgeGraph={knowledgeGraph}
                  upcomingMilestones={upcomingMilestones}
                  primaryDomain={profile.primary_domain}
                  currentXP={profile.current_xp}
                  currentLevel={profile.current_level}
                />
              </CardContent>
            </Card>

            {/* Recommended Lessons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Recommended for You
                </CardTitle>
                <CardDescription>
                  Curated lessons based on your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecommendedLessons lessons={UIRecommendedLessons} />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/lessons')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Start New Lesson
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/coding/duel')}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Take Challenge
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => {
                    const el = document.getElementById('ai-peers-section')
                    el?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Chat with AI Peer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}