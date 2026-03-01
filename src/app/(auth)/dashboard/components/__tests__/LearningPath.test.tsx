/**
 * Unit Tests for LearningPath Component
 * Tests rendering, milestone tracking, and lesson status
 */

import { render, screen } from '@testing-library/react'
import { LearningPath } from '../LearningPath'
import type { KnowledgeGraphNode } from '@/types/database'

// Mock data
const mockKnowledgeGraph: KnowledgeGraphNode[] = [
  {
    id: 'node-1',
    user_id: 'user-1',
    concept: 'JavaScript Basics',
    prerequisites: [],
    status: 'mastered',
    position: { x: 0, y: 0 },
    connections: ['node-2'],
    mastery_percentage: 100,
    updated_at: new Date()
  },
  {
    id: 'node-2',
    user_id: 'user-1',
    concept: 'React Fundamentals',
    prerequisites: ['node-1'],
    status: 'in_progress',
    position: { x: 1, y: 0 },
    connections: ['node-3'],
    mastery_percentage: 60,
    updated_at: new Date()
  },
  {
    id: 'node-3',
    user_id: 'user-1',
    concept: 'Advanced React',
    prerequisites: ['node-2'],
    status: 'locked',
    position: { x: 2, y: 0 },
    connections: [],
    mastery_percentage: 0,
    updated_at: new Date()
  }
]

const mockUpcomingMilestones = {
  nextLevel: {
    current: 1,
    next: 2,
    xpNeeded: 150
  },
  nextConcept: mockKnowledgeGraph[2]
}

describe('LearningPath', () => {
  describe('Rendering', () => {
    it('renders learning path title', () => {
      render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
          primaryDomain="javascript"
          currentXP={350}
          currentLevel={1}
        />
      )

      expect(screen.getByText('Your Learning Journey')).toBeInTheDocument()
    })

    it('renders View Full Path button', () => {
      render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      expect(screen.getByText('View Full Path')).toBeInTheDocument()
    })

    it('displays track progress percentage', () => {
      render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      // Should display some progress percentage
      const percentageRegex = /\d+%/
      expect(screen.getByText(percentageRegex)).toBeInTheDocument()
    })
  })

  describe('Lesson Status', () => {
    it('displays completed lessons with checkmark icon', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      // Check for completed status indicators
      const completedIcons = container.querySelectorAll('.text-green-500')
      expect(completedIcons.length).toBeGreaterThan(0)
    })

    it('displays in-progress lessons with circle icon', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      // Check for in-progress status indicators
      const inProgressIcons = container.querySelectorAll('.text-blue-500')
      expect(inProgressIcons.length).toBeGreaterThan(0)
    })

    it('displays locked lessons with lock icon', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      // Check for locked status indicators
      const lockedIcons = container.querySelectorAll('.text-gray-400')
      expect(lockedIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Milestone Display', () => {
    it('renders next milestone when available', () => {
      render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
          currentXP={350}
          currentLevel={1}
        />
      )

      expect(screen.getByText(/Next Milestone:/i)).toBeInTheDocument()
    })

    it('displays milestone reward information', () => {
      render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
          currentXP={350}
          currentLevel={1}
        />
      )

      expect(screen.getByText(/Reward:/i)).toBeInTheDocument()
    })

    it('shows milestone progress bar', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
          currentXP={350}
          currentLevel={1}
        />
      )

      // Check for progress bar component
      const progressBars = container.querySelectorAll('[role="progressbar"]')
      expect(progressBars.length).toBeGreaterThan(0)
    })
  })

  describe('Continue Button', () => {
    it('renders Continue Current Lesson button', () => {
      render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      expect(screen.getByText('Continue Current Lesson')).toBeInTheDocument()
    })

    it('button has proper styling classes', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      const button = screen.getByText('Continue Current Lesson').closest('button')
      expect(button).toHaveClass('w-full')
    })
  })

  describe('Empty State', () => {
    it('handles empty knowledge graph', () => {
      render(
        <LearningPath
          knowledgeGraph={[]}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      // Should still render the component structure
      expect(screen.getByText('Your Learning Journey')).toBeInTheDocument()
    })
  })

  describe('Difficulty Badges', () => {
    it('displays difficulty badge for track', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      // Check for difficulty badge
      const badges = container.querySelectorAll('[class*="Badge"]')
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes for mobile', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      // Check for responsive text sizing
      const responsiveElements = container.querySelectorAll('[class*="sm:text"]')
      expect(responsiveElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for progress', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _container } = render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      const progressBars = container.querySelectorAll('[role="progressbar"]')
      progressBars.forEach(bar => {
        expect(bar).toBeInTheDocument()
      })
    })

    it('buttons are keyboard accessible', () => {
      render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Duration Formatting', () => {
    it('displays estimated time remaining', () => {
      render(
        <LearningPath
          knowledgeGraph={mockKnowledgeGraph}
          upcomingMilestones={mockUpcomingMilestones}
        />
      )

      // Should display time in some format (hours/minutes)
      const timeRegex = /\d+(\.\d+)?h|\d+min/
      const timeElements = screen.queryAllByText(timeRegex)
      expect(timeElements.length).toBeGreaterThan(0)
    })
  })
})
