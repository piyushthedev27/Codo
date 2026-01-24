'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  AlertCircle
} from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import type { DashboardData } from '@/types/database'

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
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const result = await response.json()
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
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
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

  const { profile, aiPeers, knowledgeGraph, weeklyProgress, upcomingMilestones, currentStreak } = dashboardData

  // Calculate knowledge graph stats
  const totalNodes = knowledgeGraph.length
  const completedNodes = knowledgeGraph.filter(node => node.status === 'mastered').length
  const inProgressNodes = knowledgeGraph.filter(node => node.status === 'in_progress').length
  const progressPercentage = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Demo Data Warning */}
        {usingDemoData && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Demo Mode</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Database connection failed. Showing demo data. Please check your environment configuration.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.firstName || profile.first_name || 'Learner'}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to continue your learning journey with your AI study buddies?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Level & XP */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5" />
                Level {profile.current_level}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{profile.current_xp} XP</div>
              <div className="text-sm opacity-90">
                {upcomingMilestones.nextLevel.xpNeeded} XP to Level {upcomingMilestones.nextLevel.next}
              </div>
              <Progress 
                value={(profile.current_xp % 1000) / 10} 
                className="mt-2 bg-blue-400"
              />
            </CardContent>
          </Card>

          {/* Learning Streak */}
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Learning Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{currentStreak} days</div>
              <div className="text-sm opacity-90">
                {currentStreak > 0 ? 'Keep it up!' : 'Start your streak today!'}
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Progress */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Knowledge Graph
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{Math.round(progressPercentage)}%</div>
              <div className="text-sm opacity-90">
                {completedNodes} of {totalNodes} concepts mastered
              </div>
              <Progress 
                value={progressPercentage} 
                className="mt-2 bg-green-400"
              />
            </CardContent>
          </Card>

          {/* AI Peers */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                AI Study Buddies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{aiPeers.length}</div>
              <div className="text-sm opacity-90 mb-2">Active learning companions</div>
              <div className="flex -space-x-2">
                {aiPeers.slice(0, 3).map((peer) => (
                  <Avatar 
                    key={peer.id}
                    peerId={peer.name.toLowerCase()} 
                    size="sm"
                    className="border-2 border-white"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                This Week's Progress
              </CardTitle>
              <CardDescription>
                Your learning activity over the past 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">{weeklyProgress.lessonsCompleted}</div>
                  <div className="text-sm text-muted-foreground">Lessons</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Code className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">{weeklyProgress.challengesAttempted}</div>
                  <div className="text-sm text-muted-foreground">Challenges</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Mic className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">{weeklyProgress.voiceSessionsUsed}</div>
                  <div className="text-sm text-muted-foreground">Voice Sessions</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-600">{weeklyProgress.xpEarned}</div>
                  <div className="text-sm text-muted-foreground">XP Earned</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Jump back into learning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-between" variant="outline">
                Continue Learning
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button className="w-full justify-between" variant="outline" asChild>
                <a href="/knowledge-graph-demo">
                  View Knowledge Graph
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
              
              <Button className="w-full justify-between" variant="outline">
                Practice Challenges
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button className="w-full justify-between" variant="outline">
                Voice Coaching Session
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* AI Peers Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your AI Study Buddies
              </CardTitle>
              <CardDescription>
                Your personalized learning companions are ready to help
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiPeers.map((peer) => (
                  <div key={peer.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Avatar 
                      peerId={peer.name.toLowerCase()} 
                      size="md" 
                      showStatus={true}
                      status="online"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{peer.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {peer.personality} • {peer.skill_level} level
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {peer.interaction_style}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {peer.personality}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Milestone */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Next Milestone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Level {upcomingMilestones.nextLevel.next}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  {upcomingMilestones.nextLevel.xpNeeded} XP needed
                </p>
                <Progress 
                  value={((1000 - upcomingMilestones.nextLevel.xpNeeded) / 1000) * 100}
                  className="bg-blue-200"
                />
              </div>
              
              {upcomingMilestones.nextConcept && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    Next Concept
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {upcomingMilestones.nextConcept.concept}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}