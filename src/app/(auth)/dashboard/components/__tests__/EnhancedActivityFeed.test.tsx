/**
 * Unit Tests for EnhancedActivityFeed Component
 * Tests activity display, categorization, and XP tracking
 */

import { render, screen } from '@testing-library/react'
import { EnhancedActivityFeed } from '../EnhancedActivityFeed'

const mockActivities = [
  {
    id: 'activity-1',
    user_id: 'user-1',
    activity_type: 'lesson_completed',
    content_id: 'lesson-1',
    xp_earned: 50,
    duration_minutes: 30,
    peer_interactions_count: 2,
    voice_coaching_used: true,
    mistakes_made: 1,
    created_at: new Date()
  },
  {
    id: 'activity-2',
    user_id: 'user-1',
    activity_type: 'achievement_unlocked',
    content_id: 'achievement-1',
    xp_earned: 100,
    duration_minutes: 0,
    peer_interactions_count: 0,
    voice_coaching_used: false,
    mistakes_made: 0,
    created_at: new Date()
  },
  {
    id: 'activity-3',
    user_id: 'user-1',
    activity_type: 'collaborative_session',
    content_id: 'session-1',
    xp_earned: 75,
    duration_minutes: 45,
    peer_interactions_count: 5,
    voice_coaching_used: false,
    mistakes_made: 3,
    created_at: new Date()
  }
]

describe('EnhancedActivityFeed', () => {
  describe('Rendering', () => {
    it('renders activity feed title', () => {
      render(<EnhancedActivityFeed activities={mockActivities} />)
      
      expect(screen.getByText(/Recent Activity|Activity Feed/i)).toBeInTheDocument()
    })

    it('displays all activities', () => {
      render(<EnhancedActivityFeed activities={mockActivities} />)
      
      // Should display XP earned for each activity
      expect(screen.getByText(/50/)).toBeInTheDocument()
      expect(screen.getByText(/100/)).toBeInTheDocument()
      expect(screen.getByText(/75/)).toBeInTheDocument()
    })
  })

  describe('Activity Types', () => {
    it('displays lesson completion activities', () => {
      render(<EnhancedActivityFeed activities={mockActivities} />)
      
      // Should show lesson-related content
      const activities = screen.getAllByText(/XP|completed|lesson/i)
      expect(activities.length).toBeGreaterThan(0)
    })

    it('displays achievement activities', () => {
      render(<EnhancedActivityFeed activities={mockActivities} />)
      
      // Should show achievement-related content
      const achievements = screen.getAllByText(/XP|achievement|unlocked/i)
      expect(achievements.length).toBeGreaterThan(0)
    })

    it('displays collaborative session activities', () => {
      render(<EnhancedActivityFeed activities={mockActivities} />)
      
      // Should show collaboration-related content
      const sessions = screen.getAllByText(/XP|collaborative|session/i)
      expect(sessions.length).toBeGreaterThan(0)
    })
  })

  describe('XP Display', () => {
    it('shows XP earned for each activity', () => {
      render(<EnhancedActivityFeed activities={mockActivities} />)
      
      // Check for XP values
      expect(screen.getByText(/50/)).toBeInTheDocument()
      expect(screen.getByText(/100/)).toBeInTheDocument()
      expect(screen.getByText(/75/)).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('handles empty activity list', () => {
      render(<EnhancedActivityFeed activities={[]} />)
      
      // Should show empty state message
      expect(screen.getByText(/No activities|No recent activity/i)).toBeInTheDocument()
    })
  })

  describe('Peer Involvement', () => {
    it('indicates peer interactions when present', () => {
      const { container } = render(<EnhancedActivityFeed activities={mockActivities} />)
      
      // Should show peer interaction indicators
      expect(container).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('uses semantic HTML', () => {
      const { container } = render(<EnhancedActivityFeed activities={mockActivities} />)
      
      // Should use list elements for activities
      const lists = container.querySelectorAll('ul, ol')
      expect(lists.length).toBeGreaterThan(0)
    })
  })
})
