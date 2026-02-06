/**
 * Offline Manager
 * Handles offline mode with cached content and graceful degradation
 */

import { demoLessonManager } from '@/lib/lessons/lesson-cache'
import type { DashboardData, LearningInsight, UserProfile } from '@/types/database'

export interface OfflineData {
  profile: UserProfile | null
  dashboardData: DashboardData | null
  lessons: any[]
  insights: LearningInsight[]
  lastUpdated: string
  isOffline: boolean
}

class OfflineManager {
  private static instance: OfflineManager
  private offlineData: OfflineData | null = null
  private isOnline: boolean = true
  private listeners: ((isOnline: boolean) => void)[] = []

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine
      this.setupEventListeners()
      this.loadOfflineData()
    }
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager()
    }
    return OfflineManager.instance
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return

    window.addEventListener('online', () => {
      this.isOnline = true
      this.notifyListeners(true)
      console.log('🟢 Back online - syncing data...')
      this.syncWhenOnline()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifyListeners(false)
      console.log('🔴 Gone offline - using cached data')
    })
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => listener(isOnline))
  }

  public onConnectionChange(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  public getConnectionStatus(): boolean {
    return this.isOnline
  }

  private loadOfflineData() {
    if (typeof window === 'undefined') return

    try {
      const cached = localStorage.getItem('codo-offline-data')
      if (cached) {
        this.offlineData = JSON.parse(cached)
        console.log('📦 Loaded offline data from cache')
      }
    } catch (error) {
      console.warn('Failed to load offline data:', error)
      this.offlineData = null
    }
  }

  public saveOfflineData(data: Partial<OfflineData>) {
    if (typeof window === 'undefined') return

    try {
      const currentData = this.offlineData || {
        profile: null,
        dashboardData: null,
        lessons: [],
        insights: [],
        lastUpdated: new Date().toISOString(),
        isOffline: false
      }

      this.offlineData = {
        ...currentData,
        ...data,
        lastUpdated: new Date().toISOString()
      }

      localStorage.setItem('codo-offline-data', JSON.stringify(this.offlineData))
      console.log('💾 Saved data for offline use')
    } catch (error) {
      console.warn('Failed to save offline data:', error)
    }
  }

  public getOfflineData(): OfflineData | null {
    return this.offlineData
  }

  public getDemoData(): DashboardData {
    const demoProfile: UserProfile = {
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
        nextConcept: demoKnowledgeGraph[1]
      },
      enhancedStats: {
        learningProgress: { 
          percentage: 65, 
          lessonsCompleted: 4,
          totalLessons: 10,
          weeklyChange: 2,
          trend: 'up' as const
        },
        currentStreak: { 
          days: 3, 
          bestStreak: 7, 
          message: 'Building momentum!',
          trend: 'stable' as const
        },
        skillsMastered: { 
          count: 8, 
          recentSkills: ['React', 'TypeScript', 'Node.js'],
          monthlyProgress: 3, 
          trend: 'up' as const
        },
        codingTime: { 
          weeklyHours: 12.5, 
          dailyAverage: 1.8,
          weeklyChange: 2.3,
          trend: 'up' as const
        }
      },
      recommendedLessons: [
        {
          id: 'lesson-1',
          title: 'Advanced React Patterns',
          duration: '2.5 hours',
          difficulty: 'intermediate',
          description: 'Master hooks, context, and custom patterns...',
          recommendedBy: 'sarah',
          thumbnail: '/lessons/react-advanced.png'
        }
      ]
    }
  }

  public async syncWhenOnline() {
    if (!this.isOnline) return

    try {
      // Attempt to sync cached data with server
      console.log('🔄 Syncing offline data with server...')
      
      // This would typically involve:
      // 1. Uploading any offline changes
      // 2. Downloading latest data
      // 3. Resolving conflicts
      
      // For now, just refresh the cache
      await this.refreshCache()
    } catch (error) {
      console.warn('Failed to sync offline data:', error)
    }
  }

  private async refreshCache() {
    // This would refresh cached data from the server
    console.log('🔄 Refreshing cache...')
  }

  public clearOfflineData() {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem('codo-offline-data')
      this.offlineData = null
      console.log('🗑️ Cleared offline data')
    } catch (error) {
      console.warn('Failed to clear offline data:', error)
    }
  }

  public getOfflineLessons() {
    return demoLessonManager.getAllDemoLessons()
  }

  public hasOfflineContent(): boolean {
    return this.offlineData !== null || demoLessonManager.getAllDemoLessons().length > 0
  }
}

export const offlineManager = OfflineManager.getInstance()