'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import '@/styles/dashboard-animations.css'
import { Avatar } from '@/components/shared/Avatar'
import {
  Target,
  Zap,
  Users,
  BookOpen,
  AlertCircle,
  Clock,
  Trophy,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { generateEnhancedStats } from '@/lib/utils/stats-calculations'
import { DashboardLoadingSkeleton, SkeletonCard } from '@/components/ui/loading'
import { DashboardSyncManager } from '@/lib/realtime/dashboard-sync'
import { createEnhancedActivity, type EnhancedActivity as UIActivity } from '@/lib/activities/activity-tracker'
import type { DashboardData } from '@/types/database'

// Lazy load dashboard components for better performance
const HeroWelcomeSection = dynamic(() => import('./components/HeroWelcomeSection').then(mod => ({ default: mod.HeroWelcomeSection })), {
  loading: () => <SkeletonCard lines={4} />
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
          // Push the raw activity directly to recentActivities
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
    weeklyProgress: _weeklyProgress, // tracked but not rendered directly
    upcomingMilestones,
    currentStreak,
    recentActivities,
    recommendedLessons
  } = dashboardData

  // Calculate knowledge graph stats
  const totalNodes = knowledgeGraph.length
  const completedNodes = knowledgeGraph.filter(node => node.status === 'mastered').length
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
          _aiPeers={aiPeers}
          learningProgress={learningProgress}
          currentStreak={currentStreak}
        />

        {/* Stats Grid */}
        <EnhancedStatsGrid stats={enhancedStats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Peer Network Status - Project Themed Widget */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800 rounded-2xl overflow-hidden relative group card-hover-effect">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-24 h-24 text-blue-500" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-widest">
                      <Zap className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>Live Connection</span>
                    </div>
                    <CardTitle className="text-xl font-bold text-white tracking-tight">Peer Network</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-cyan-400"
                    onClick={() => router.push('/ai-peers')}
                  >
                    Manage <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center gap-4 py-2">
                  <div className="flex -space-x-3">
                    {aiPeers.slice(0, 3).map((peer) => (
                      <div key={peer.id} className="relative ring-4 ring-white dark:ring-gray-900 rounded-full">
                        <Avatar peerId={peer.name.toLowerCase()} size="sm" className="h-10 w-10" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-950 rounded-full" />
                      </div>
                    ))}
                  </div>
                  <div className="ml-2 border-l border-gray-200 dark:border-gray-700 pl-4">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-tight">
                      {aiPeers.length} AI companions online
                    </p>
                    <span className="text-xs text-gray-500">Ready for cooperative learning</span>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  _upcomingMilestones={upcomingMilestones}
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

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}