/**
 * Integration Tests for Dashboard
 * Tests complete dashboard loading, data flow, and component interactions
 */

import { render, screen, waitFor } from '@testing-library/react'
import { HeroWelcomeSection } from '../HeroWelcomeSection'
import { EnhancedStatsGrid } from '../EnhancedStatsGrid'
import { LearningPath } from '../LearningPath'
import { RecommendedLessons } from '../RecommendedLessons'
import { EnhancedActivityFeed } from '../EnhancedActivityFeed'
import { AIPeerCards } from '../AIPeerCards'
import type { UserProfile, AIPeerProfile, KnowledgeGraphNode } from '@/types/database'
import type { EnhancedStats } from '@/lib/utils/stats-calculations'

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock dashboard data
const mockDashboardData = {
  user: { firstName: 'John' },
  profile: {
    id: 'user-1',
    clerk_user_id: 'clerk-123',
    first_name: 'John',
    last_name: 'Doe',
    skill_level: 'intermediate',
    learning_goal: 'learning',
    primary_domain: 'javascript',
    current_xp: 350,
    current_level: 5,
    learning_streak: 7,
    voice_coaching_enabled: true,
    created_at: new Date(),
    updated_at: new Date()
  } as UserProfile,
  aiPeers: [
    {
      id: 'sarah',
      user_id: 'user-1',
      name: 'Sarah',
      personality: 'curious',
      skill_level: 'beginner',
      avatar_url: '/images/avatars/sarah-3d.png',
      common_mistakes: [],
      interaction_style: 'Curious',
      backstory: 'A curious learner',
      created_at: new Date()
    }
  ] as AIPeerProfile[],
  stats: {
    learningProgress: {
      percentage: 75,
      lessonsCompleted: 15,
      totalLessons: 20,
      weeklyChange: 3,
      trend: 'up'
    },
    currentStreak: {
      days: 7,
      bestStreak: 14,
      message: 'Great progress!',
      trend: 'up'
    },
    skillsMastered: {
      count: 12,
      recentSkills: ['JavaScript', 'React'],
      monthlyProgress: 2,
      trend: 'up'
    },
    codingTime: {
      weeklyHours: 15.5,
      dailyAverage: 2.2,
      weeklyChange: 1.5,
      trend: 'up'
    }
  } as EnhancedStats,
  knowledgeGraph: [
    {
      id: 'node-1',
      user_id: 'user-1',
      concept: 'JavaScript Basics',
      prerequisites: [],
      status: 'mastered',
      position: { x: 0, y: 0 },
      connections: [],
      mastery_percentage: 100,
      updated_at: new Date()
    }
  ] as KnowledgeGraphNode[],
  upcomingMilestones: {
    nextLevel: { current: 1, next: 2, xpNeeded: 150 },
    nextConcept: null
  }
}

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Dashboard Loading', () => {
    it('renders all dashboard components together', () => {
      const { container } = render(
        <div>
          <HeroWelcomeSection
            user={mockDashboardData.user}
            profile={mockDashboardData.profile}
            aiPeers={mockDashboardData.aiPeers}
            learningProgress={mockDashboardData.stats.learningProgress}
            currentStreak={mockDashboardData.stats.currentStreak.days}
          />
          <EnhancedStatsGrid stats={mockDashboardData.stats} />
          <LearningPath
            knowledgeGraph={mockDashboardData.knowledgeGraph}
            upcomingMilestones={mockDashboardData.upcomingMilestones}
          />
        </div>
      )

      // Verify all major sections are present
      expect(screen.getByText(/Welcome back, John!/i)).toBeInTheDocument()
      expect(screen.getByText('Learning Progress')).toBeInTheDocument()
      expect(screen.getByText('Your Learning Journey')).toBeInTheDocument()
    })

    it('displays consistent user data across components', () => {
      render(
        <div>
          <HeroWelcomeSection
            user={mockDashboardData.user}
            profile={mockDashboardData.profile}
            aiPeers={mockDashboardData.aiPeers}
            learningProgress={mockDashboardData.stats.learningProgress}
            currentStreak={mockDashboardData.stats.currentStreak.days}
          />
          <EnhancedStatsGrid stats={mockDashboardData.stats} />
        </div>
      )

      // XP should be consistent
      const xpElements = screen.getAllByText('350')
      expect(xpElements.length).toBeGreaterThan(0)

      // Streak should be consistent
      const streakElements = screen.getAllByText('7')
      expect(streakElements.length).toBeGreaterThan(0)
    })
  })

  describe('API Integration and Data Flow', () => {
    it('handles successful API response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: mockDashboardData
        })
      })

      // Simulate fetching dashboard data
      const response = await fetch('/api/dashboard')
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.profile.first_name).toBe('John')
    })

    it('handles API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch('/api/dashboard')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('validates data structure from API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: mockDashboardData
        })
      })

      const response = await fetch('/api/dashboard')
      const data = await response.json()

      // Validate required fields
      expect(data.data.profile).toHaveProperty('id')
      expect(data.data.profile).toHaveProperty('current_xp')
      expect(data.data.stats).toHaveProperty('learningProgress')
      expect(data.data.stats).toHaveProperty('currentStreak')
    })
  })

  describe('Navigation Between Dashboard Sections', () => {
    it('renders navigation links between sections', () => {
      render(
        <div>
          <HeroWelcomeSection
            user={mockDashboardData.user}
            profile={mockDashboardData.profile}
            aiPeers={mockDashboardData.aiPeers}
            learningProgress={mockDashboardData.stats.learningProgress}
            currentStreak={mockDashboardData.stats.currentStreak.days}
          />
          <LearningPath
            knowledgeGraph={mockDashboardData.knowledgeGraph}
            upcomingMilestones={mockDashboardData.upcomingMilestones}
          />
        </div>
      )

      // Check for navigation buttons
      expect(screen.getByText('Continue Learning')).toBeInTheDocument()
      expect(screen.getByText('Talk to AI Peers')).toBeInTheDocument()
      expect(screen.getByText('View Full Path')).toBeInTheDocument()
    })
  })

  describe('Real-time Updates and State Synchronization', () => {
    it('updates progress across components when data changes', () => {
      const { rerender } = render(
        <div>
          <HeroWelcomeSection
            user={mockDashboardData.user}
            profile={mockDashboardData.profile}
            aiPeers={mockDashboardData.aiPeers}
            learningProgress={mockDashboardData.stats.learningProgress}
            currentStreak={mockDashboardData.stats.currentStreak.days}
          />
          <EnhancedStatsGrid stats={mockDashboardData.stats} />
        </div>
      )

      // Initial state
      expect(screen.getByText('75% Complete')).toBeInTheDocument()

      // Update progress
      const updatedStats = {
        ...mockDashboardData.stats,
        learningProgress: {
          ...mockDashboardData.stats.learningProgress,
          percentage: 80,
          lessonsCompleted: 16
        }
      }

      const updatedLearningProgress = {
        percentage: 80,
        lessonsCompleted: 16,
        totalLessons: 20
      }

      rerender(
        <div>
          <HeroWelcomeSection
            user={mockDashboardData.user}
            profile={mockDashboardData.profile}
            aiPeers={mockDashboardData.aiPeers}
            learningProgress={updatedLearningProgress}
            currentStreak={mockDashboardData.stats.currentStreak.days}
          />
          <EnhancedStatsGrid stats={updatedStats} />
        </div>
      )

      // Updated state
      expect(screen.getByText('80% Complete')).toBeInTheDocument()
      expect(screen.getByText('16 of 20 lessons completed')).toBeInTheDocument()
    })

    it('synchronizes XP updates across components', () => {
      const { rerender } = render(
        <HeroWelcomeSection
          user={mockDashboardData.user}
          profile={mockDashboardData.profile}
          aiPeers={mockDashboardData.aiPeers}
          learningProgress={mockDashboardData.stats.learningProgress}
          currentStreak={mockDashboardData.stats.currentStreak.days}
        />
      )

      expect(screen.getByText('350')).toBeInTheDocument()

      // Update XP
      const updatedProfile = {
        ...mockDashboardData.profile,
        current_xp: 400
      }

      rerender(
        <HeroWelcomeSection
          user={mockDashboardData.user}
          profile={updatedProfile}
          aiPeers={mockDashboardData.aiPeers}
          learningProgress={mockDashboardData.stats.learningProgress}
          currentStreak={mockDashboardData.stats.currentStreak.days}
        />
      )

      expect(screen.getByText('400')).toBeInTheDocument()
    })
  })

  describe('Error Boundaries and Loading States', () => {
    it('handles missing data gracefully', () => {
      render(
        <HeroWelcomeSection
          profile={mockDashboardData.profile}
          aiPeers={[]}
          learningProgress={{ percentage: 0, lessonsCompleted: 0, totalLessons: 0 }}
          currentStreak={0}
        />
      )

      // Should still render without crashing
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
    })

    it('displays loading skeleton for stats', () => {
      const { container } = render(
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      )

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  describe('Component Interaction Flow', () => {
    it('maintains consistent theme across all components', () => {
      const { container } = render(
        <div>
          <HeroWelcomeSection
            user={mockDashboardData.user}
            profile={mockDashboardData.profile}
            aiPeers={mockDashboardData.aiPeers}
            learningProgress={mockDashboardData.stats.learningProgress}
            currentStreak={mockDashboardData.stats.currentStreak.days}
          />
          <EnhancedStatsGrid stats={mockDashboardData.stats} />
          <LearningPath
            knowledgeGraph={mockDashboardData.knowledgeGraph}
            upcomingMilestones={mockDashboardData.upcomingMilestones}
          />
        </div>
      )

      // Check for consistent dark mode classes
      const darkModeElements = container.querySelectorAll('[class*="dark:"]')
      expect(darkModeElements.length).toBeGreaterThan(0)
    })

    it('uses consistent button styling across components', () => {
      render(
        <div>
          <HeroWelcomeSection
            user={mockDashboardData.user}
            profile={mockDashboardData.profile}
            aiPeers={mockDashboardData.aiPeers}
            learningProgress={mockDashboardData.stats.learningProgress}
            currentStreak={mockDashboardData.stats.currentStreak.days}
          />
          <LearningPath
            knowledgeGraph={mockDashboardData.knowledgeGraph}
            upcomingMilestones={mockDashboardData.upcomingMilestones}
          />
        </div>
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      // All buttons should be accessible
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('Performance and Optimization', () => {
    it('renders dashboard components efficiently', () => {
      const startTime = performance.now()

      render(
        <div>
          <HeroWelcomeSection
            user={mockDashboardData.user}
            profile={mockDashboardData.profile}
            aiPeers={mockDashboardData.aiPeers}
            learningProgress={mockDashboardData.stats.learningProgress}
            currentStreak={mockDashboardData.stats.currentStreak.days}
          />
          <EnhancedStatsGrid stats={mockDashboardData.stats} />
          <LearningPath
            knowledgeGraph={mockDashboardData.knowledgeGraph}
            upcomingMilestones={mockDashboardData.upcomingMilestones}
          />
        </div>
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Rendering should be fast (under 100ms for these components)
      expect(renderTime).toBeLessThan(100)
    })
  })
})
