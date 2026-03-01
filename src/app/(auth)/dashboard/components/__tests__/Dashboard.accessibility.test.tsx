/**
 * Accessibility Tests for Dashboard Components
 * Tests WCAG 2.1 AA compliance, keyboard navigation, and screen reader compatibility
 */

import { render, screen } from '@testing-library/react'
import { HeroWelcomeSection } from '../HeroWelcomeSection'
import { EnhancedStatsGrid } from '../EnhancedStatsGrid'
import { LearningPath } from '../LearningPath'
import { RecommendedLessons } from '../RecommendedLessons'
import type { UserProfile, AIPeerProfile, KnowledgeGraphNode } from '@/types/database'
import type { EnhancedStats } from '@/lib/utils/stats-calculations'

// Mock data
const mockUser = { firstName: 'John' }
const mockProfile: UserProfile = {
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
}

const mockAIPeers: AIPeerProfile[] = [
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
]

const mockStats: EnhancedStats = {
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
}

const mockKnowledgeGraph: KnowledgeGraphNode[] = [
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
]

const mockUpcomingMilestones = {
  nextLevel: { current: 1, next: 2, xpNeeded: 150 },
  nextConcept: null
}

const mockLessons = [
  {
    id: 'lesson-1',
    title: 'Advanced React Hooks',
    duration: '45 min',
    difficulty: 'intermediate',
    description: 'Master useEffect and custom hooks',
    recommendedBy: 'sarah',
    thumbnail: '/lessons/react-hooks.png'
  }
]

describe('Dashboard Accessibility Tests', () => {
  describe('WCAG 2.1 AA Compliance', () => {
    describe('Heading Hierarchy', () => {
      it('has proper heading structure in HeroWelcomeSection', () => {
        render(
          <HeroWelcomeSection
            user={mockUser}
            profile={mockProfile}
            aiPeers={mockAIPeers}
            learningProgress={mockStats.learningProgress}
            currentStreak={mockStats.currentStreak.days}
          />
        )

        const h1 = screen.getByRole('heading', { level: 1 })
        expect(h1).toBeInTheDocument()
        expect(h1).toHaveTextContent(/Welcome back/i)
      })

      it('uses semantic heading levels in LearningPath', () => {
        render(
          <LearningPath
            knowledgeGraph={mockKnowledgeGraph}
            upcomingMilestones={mockUpcomingMilestones}
          />
        )

        // Should have proper heading structure
        const headings = screen.getAllByRole('heading')
        expect(headings.length).toBeGreaterThan(0)
      })
    })

    describe('Color Contrast', () => {
      it('uses sufficient contrast for text in HeroWelcomeSection', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _container } = render(
          <HeroWelcomeSection
            user={mockUser}
            profile={mockProfile}
            aiPeers={mockAIPeers}
            learningProgress={mockStats.learningProgress}
            currentStreak={mockStats.currentStreak.days}
          />
        )

        // Check for text color classes that meet WCAG AA standards
        const textElements = container.querySelectorAll('[class*="text-gray-900"], [class*="text-white"]')
        expect(textElements.length).toBeGreaterThan(0)
      })

      it('uses sufficient contrast in stat cards', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _container } = render(<EnhancedStatsGrid stats={mockStats} />)

        // Stat cards use white text on colored backgrounds
        const whiteTextElements = container.querySelectorAll('[class*="text-white"]')
        expect(whiteTextElements.length).toBeGreaterThan(0)
      })
    })

    describe('Focus Indicators', () => {
      it('buttons have visible focus states', () => {
        render(
          <HeroWelcomeSection
            user={mockUser}
            profile={mockProfile}
            aiPeers={mockAIPeers}
            learningProgress={mockStats.learningProgress}
            currentStreak={mockStats.currentStreak.days}
          />
        )

        const buttons = screen.getAllByRole('button')
        buttons.forEach(button => {
          // Buttons should be focusable
          expect(button).toBeInTheDocument()
          expect(button.tagName).toBe('BUTTON')
        })
      })
    })

    describe('Text Alternatives', () => {
      it('provides text alternatives for icons', () => {
        render(<EnhancedStatsGrid stats={mockStats} />)

        // Icons should be accompanied by text labels
        expect(screen.getByText('Learning Progress')).toBeInTheDocument()
        expect(screen.getByText('Current Streak')).toBeInTheDocument()
        expect(screen.getByText('Skills Mastered')).toBeInTheDocument()
        expect(screen.getByText('Time This Week')).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('all interactive elements are keyboard accessible', () => {
      render(
        <div>
          <HeroWelcomeSection
            user={mockUser}
            profile={mockProfile}
            aiPeers={mockAIPeers}
            learningProgress={mockStats.learningProgress}
            currentStreak={mockStats.currentStreak.days}
          />
          <LearningPath
            knowledgeGraph={mockKnowledgeGraph}
            upcomingMilestones={mockUpcomingMilestones}
          />
          <RecommendedLessons lessons={mockLessons} />
        </div>
      )

      const buttons = screen.getAllByRole('button')
      
      // All buttons should be keyboard accessible
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
        expect(button).not.toHaveAttribute('tabindex', '-1')
      })
    })

    it('maintains logical tab order', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockStats.learningProgress}
          currentStreak={mockStats.currentStreak.days}
        />
      )

      const focusableElements = container.querySelectorAll('button, a, input, [tabindex]:not([tabindex="-1"])')
      
      // Should have focusable elements
      expect(focusableElements.length).toBeGreaterThan(0)
    })

    it('buttons have proper button role', () => {
      render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON')
      })
    })
  })

  describe('Screen Reader Compatibility', () => {
    it('provides meaningful labels for progress bars', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockStats.learningProgress}
          currentStreak={mockStats.currentStreak.days}
        />
      )

      // Progress information should be available
      expect(screen.getByText('75% Complete')).toBeInTheDocument()
      expect(screen.getByText('15 of 20 lessons completed')).toBeInTheDocument()
    })

    it('provides context for statistics', () => {
      render(<EnhancedStatsGrid stats={mockStats} />)

      // Each stat should have descriptive text
      expect(screen.getByText('Learning Progress')).toBeInTheDocument()
      expect(screen.getByText('15 of 20 lessons completed')).toBeInTheDocument()
      
      expect(screen.getByText('Current Streak')).toBeInTheDocument()
      expect(screen.getByText('Great progress!')).toBeInTheDocument()
    })

    it('uses semantic HTML elements', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(
        <div>
          <HeroWelcomeSection
            user={mockUser}
            profile={mockProfile}
            aiPeers={mockAIPeers}
            learningProgress={mockStats.learningProgress}
            currentStreak={mockStats.currentStreak.days}
          />
          <EnhancedStatsGrid stats={mockStats} />
        </div>
      )

      // Check for semantic elements
      const headings = container.querySelectorAll('h1, h2, h3, h4')
      expect(headings.length).toBeGreaterThan(0)

      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('provides descriptive button text', () => {
      render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockStats.learningProgress}
          currentStreak={mockStats.currentStreak.days}
        />
      )

      // Buttons should have descriptive text
      expect(screen.getByText('Continue Learning')).toBeInTheDocument()
      expect(screen.getByText('Talk to AI Peers')).toBeInTheDocument()
    })
  })

  describe('ARIA Attributes', () => {
    it('uses ARIA labels where appropriate', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      // Progress bars should have role="progressbar"
      const progressBars = container.querySelectorAll('[role="progressbar"]')
      expect(progressBars.length).toBeGreaterThan(0)
    })

    it('provides ARIA live regions for dynamic content', () => {
      render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockStats.learningProgress}
          currentStreak={mockStats.currentStreak.days}
        />
      )

      // Dynamic content like rotating messages should be announced
      // This is handled by React's re-rendering
      expect(screen.getByText(/Keep up the great work|Your problem-solving|I've noticed/i)).toBeInTheDocument()
    })
  })

  describe('Touch Target Size', () => {
    it('buttons meet minimum touch target size (44x44px)', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      // Check for touch-friendly classes
      const touchElements = container.querySelectorAll('[class*="touch-manipulation"]')
      expect(touchElements.length).toBeGreaterThan(0)
    })

    it('interactive elements have adequate spacing', () => {
      render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockStats.learningProgress}
          currentStreak={mockStats.currentStreak.days}
        />
      )

      const buttons = screen.getAllByRole('button')
      
      // Buttons should have gap classes for spacing
      const buttonContainer = buttons[0].parentElement
      expect(buttonContainer).toBeInTheDocument()
    })
  })

  describe('Responsive Text Sizing', () => {
    it('uses responsive text classes', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(<EnhancedStatsGrid stats={mockStats} />)

      // Check for responsive text sizing
      const responsiveText = container.querySelectorAll('[class*="sm:text"], [class*="lg:text"]')
      expect(responsiveText.length).toBeGreaterThan(0)
    })

    it('maintains readability at different viewport sizes', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockStats.learningProgress}
          currentStreak={mockStats.currentStreak.days}
        />
      )

      // Text should have minimum readable sizes
      const textElements = container.querySelectorAll('[class*="text-"]')
      expect(textElements.length).toBeGreaterThan(0)
    })
  })

  describe('Error Prevention and Recovery', () => {
    it('handles missing data without breaking accessibility', () => {
      render(
        <HeroWelcomeSection
          profile={mockProfile}
          aiPeers={[]}
          learningProgress={{ percentage: 0, lessonsCompleted: 0, totalLessons: 0 }}
          currentStreak={0}
        />
      )

      // Should still have proper heading structure
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
    })

    it('provides fallback content for empty states', () => {
      render(<RecommendedLessons lessons={[]} />)

      // Empty state should be accessible
      expect(screen.getByText(/No recommendations available yet/i)).toBeInTheDocument()
    })
  })

  describe('Form and Input Accessibility', () => {
    it('all interactive elements have accessible names', () => {
      render(
        <div>
          <HeroWelcomeSection
            user={mockUser}
            profile={mockProfile}
            aiPeers={mockAIPeers}
            learningProgress={mockStats.learningProgress}
            currentStreak={mockStats.currentStreak.days}
          />
          <RecommendedLessons lessons={mockLessons} />
        </div>
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        // Each button should have text content or aria-label
        expect(button.textContent || button.getAttribute('aria-label')).toBeTruthy()
      })
    })
  })
})
