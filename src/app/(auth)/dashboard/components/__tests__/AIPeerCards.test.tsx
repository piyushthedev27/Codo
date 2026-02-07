/**
 * Unit Tests for AIPeerCards Component
 * Tests AI peer display, status indicators, and interactions
 */

import { render, screen } from '@testing-library/react'
import { AIPeerCards } from '../AIPeerCards'
import type { AIPeerProfile } from '@/types/database'

const mockPeers: AIPeerProfile[] = [
  {
    id: 'sarah',
    user_id: 'user-1',
    name: 'Sarah',
    personality: 'curious',
    skill_level: 'beginner',
    avatar_url: '/images/avatars/sarah-3d.png',
    common_mistakes: ['Array method confusion'],
    interaction_style: 'Asks thoughtful questions',
    backstory: 'A curious learner',
    created_at: new Date()
  },
  {
    id: 'alex',
    user_id: 'user-1',
    name: 'Alex',
    personality: 'analytical',
    skill_level: 'intermediate',
    avatar_url: '/images/avatars/alex-3d.png',
    common_mistakes: ['Async/await mixing'],
    interaction_style: 'Methodical',
    backstory: 'An analytical thinker',
    created_at: new Date()
  },
  {
    id: 'jordan',
    user_id: 'user-1',
    name: 'Jordan',
    personality: 'supportive',
    skill_level: 'advanced',
    avatar_url: '/images/avatars/jordan-3d.png',
    common_mistakes: [],
    interaction_style: 'Encouraging',
    backstory: 'A supportive mentor',
    created_at: new Date()
  }
]

describe('AIPeerCards', () => {
  describe('Rendering', () => {
    it('renders all peer cards', () => {
      render(<AIPeerCards peers={mockPeers} />)
      
      expect(screen.getByText('Sarah')).toBeInTheDocument()
      expect(screen.getByText('Alex')).toBeInTheDocument()
      expect(screen.getByText('Jordan')).toBeInTheDocument()
    })

    it('displays peer personalities', () => {
      render(<AIPeerCards peers={mockPeers} />)
      
      expect(screen.getByText(/curious/i)).toBeInTheDocument()
      expect(screen.getByText(/analytical/i)).toBeInTheDocument()
      expect(screen.getByText(/supportive/i)).toBeInTheDocument()
    })

    it('shows Chat Now buttons for each peer', () => {
      render(<AIPeerCards peers={mockPeers} />)
      
      const chatButtons = screen.getAllByText(/Chat Now/i)
      expect(chatButtons).toHaveLength(3)
    })
  })

  describe('Status Indicators', () => {
    it('displays status for each peer', () => {
      const { container } = render(<AIPeerCards peers={mockPeers} />)
      
      // Should have status indicators (online/coding/away/studying)
      const statusElements = container.querySelectorAll('[class*="status"]')
      expect(statusElements.length).toBeGreaterThan(0)
    })
  })

  describe('Empty State', () => {
    it('handles empty peer list', () => {
      render(<AIPeerCards peers={[]} />)
      
      // Should render without crashing
      const { container } = render(<AIPeerCards peers={[]} />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('buttons are keyboard accessible', () => {
      render(<AIPeerCards peers={mockPeers} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
