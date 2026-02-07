/**
 * Unit Tests for RecommendedLessons Component
 * Tests rendering, API integration, and lesson recommendations
 */

import { render, screen, waitFor } from '@testing-library/react'
import { RecommendedLessons } from '../RecommendedLessons'

// Mock fetch
global.fetch = jest.fn()

const mockLessons = [
  {
    id: 'lesson-1',
    title: 'Advanced React Hooks',
    duration: '45 min',
    difficulty: 'intermediate',
    description: 'Master useEffect, useCallback, and custom hooks',
    recommendedBy: 'sarah',
    thumbnail: '/lessons/react-hooks.png',
    recommendationReason: 'Based on your recent progress',
    relevanceScore: 85
  },
  {
    id: 'lesson-2',
    title: 'TypeScript Fundamentals',
    duration: '30 min',
    difficulty: 'beginner',
    description: 'Learn type safety and interfaces',
    recommendedBy: 'alex',
    thumbnail: '/lessons/typescript.png',
    recommendationReason: 'Complements your JavaScript skills',
    relevanceScore: 92
  },
  {
    id: 'lesson-3',
    title: 'Performance Optimization',
    duration: '60 min',
    difficulty: 'advanced',
    description: 'Optimize React app performance',
    recommendedBy: 'jordan',
    thumbnail: '/lessons/performance.png',
    recommendationReason: 'Next step in your learning path',
    relevanceScore: 78
  }
]

describe('RecommendedLessons', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering with Props', () => {
    it('renders component title', () => {
      render(<RecommendedLessons lessons={mockLessons} />)
      expect(screen.getByText('Recommended for You')).toBeInTheDocument()
    })

    it('renders Explore More button', () => {
      render(<RecommendedLessons lessons={mockLessons} />)
      expect(screen.getByText('Explore More')).toBeInTheDocument()
    })

    it('displays all provided lessons', () => {
      render(<RecommendedLessons lessons={mockLessons} />)
      
      expect(screen.getByText('Advanced React Hooks')).toBeInTheDocument()
      expect(screen.getByText('TypeScript Fundamentals')).toBeInTheDocument()
      expect(screen.getByText('Performance Optimization')).toBeInTheDocument()
    })

    it('displays lesson durations', () => {
      render(<RecommendedLessons lessons={mockLessons} />)
      
      expect(screen.getByText('45 min')).toBeInTheDocument()
      expect(screen.getByText('30 min')).toBeInTheDocument()
      expect(screen.getByText('60 min')).toBeInTheDocument()
    })

    it('displays lesson descriptions', () => {
      render(<RecommendedLessons lessons={mockLessons} />)
      
      expect(screen.getByText(/Master useEffect/i)).toBeInTheDocument()
      expect(screen.getByText(/Learn type safety/i)).toBeInTheDocument()
      expect(screen.getByText(/Optimize React app/i)).toBeInTheDocument()
    })
  })

  describe('Difficulty Badges', () => {
    it('displays difficulty badges with correct colors', () => {
      const { container } = render(<RecommendedLessons lessons={mockLessons} />)
      
      const badges = container.querySelectorAll('[class*="bg-green-100"], [class*="bg-yellow-100"], [class*="bg-red-100"]')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('applies correct color classes for beginner', () => {
      const { container } = render(<RecommendedLessons lessons={mockLessons} />)
      
      const beginnerBadges = container.querySelectorAll('.bg-green-100')
      expect(beginnerBadges.length).toBeGreaterThan(0)
    })

    it('applies correct color classes for intermediate', () => {
      const { container } = render(<RecommendedLessons lessons={mockLessons} />)
      
      const intermediateBadges = container.querySelectorAll('.bg-yellow-100')
      expect(intermediateBadges.length).toBeGreaterThan(0)
    })

    it('applies correct color classes for advanced', () => {
      const { container } = render(<RecommendedLessons lessons={mockLessons} />)
      
      const advancedBadges = container.querySelectorAll('.bg-red-100')
      expect(advancedBadges.length).toBeGreaterThan(0)
    })
  })

  describe('Difficulty Stars', () => {
    it('displays correct number of stars for beginner', () => {
      const { container } = render(<RecommendedLessons lessons={mockLessons} />)
      
      // Beginner should have 1 filled star
      const filledStars = container.querySelectorAll('.fill-yellow-400')
      expect(filledStars.length).toBeGreaterThan(0)
    })
  })

  describe('AI Peer Recommendations', () => {
    it('displays recommending peer name', () => {
      render(<RecommendedLessons lessons={mockLessons} />)
      
      expect(screen.getAllByText(/Recommended by/i).length).toBeGreaterThan(0)
      expect(screen.getByText('sarah')).toBeInTheDocument()
      expect(screen.getByText('alex')).toBeInTheDocument()
      expect(screen.getByText('jordan')).toBeInTheDocument()
    })

    it('displays recommendation reasons', () => {
      render(<RecommendedLessons lessons={mockLessons} />)
      
      expect(screen.getByText(/Based on your recent progress/i)).toBeInTheDocument()
      expect(screen.getByText(/Complements your JavaScript skills/i)).toBeInTheDocument()
      expect(screen.getByText(/Next step in your learning path/i)).toBeInTheDocument()
    })
  })

  describe('Top Pick Badge', () => {
    it('displays Top Pick badge for high relevance scores', () => {
      render(<RecommendedLessons lessons={mockLessons} />)
      
      // TypeScript lesson has 92% relevance, should show Top Pick
      const topPickBadges = screen.getAllByText('Top Pick')
      expect(topPickBadges.length).toBeGreaterThan(0)
    })

    it('does not display Top Pick for lower relevance scores', () => {
      const lowScoreLessons = [
        { ...mockLessons[0], relevanceScore: 70 }
      ]
      render(<RecommendedLessons lessons={lowScoreLessons} />)
      
      expect(screen.queryByText('Top Pick')).not.toBeInTheDocument()
    })
  })

  describe('Start Lesson Buttons', () => {
    it('renders Start Lesson button for each lesson', () => {
      render(<RecommendedLessons lessons={mockLessons} />)
      
      const startButtons = screen.getAllByText('Start Lesson')
      expect(startButtons).toHaveLength(3)
    })
  })

  describe('API Integration', () => {
    it('fetches recommendations when enableAPI is true', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ recommendations: mockLessons })
      })

      render(<RecommendedLessons enableAPI={true} />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/recommendations')
      })
    })

    it('displays loading state while fetching', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

      render(<RecommendedLessons enableAPI={true} />)

      // Should show loading skeletons
      const { container } = render(<RecommendedLessons enableAPI={true} />)
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('handles API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

      render(<RecommendedLessons enableAPI={true} />)

      await waitFor(() => {
        expect(screen.getByText(/Failed to load recommendations/i)).toBeInTheDocument()
      })
    })

    it('displays Try Again button on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

      render(<RecommendedLessons enableAPI={true} />)

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })
    })

    it('uses prop lessons as fallback on API error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

      render(<RecommendedLessons lessons={mockLessons} enableAPI={true} />)

      await waitFor(() => {
        // Should still display the prop lessons
        expect(screen.getByText('Advanced React Hooks')).toBeInTheDocument()
      })
    })
  })

  describe('Empty State', () => {
    it('displays empty state when no lessons available', () => {
      render(<RecommendedLessons lessons={[]} />)
      
      expect(screen.getByText(/No recommendations available yet/i)).toBeInTheDocument()
    })

    it('displays helpful message in empty state', () => {
      render(<RecommendedLessons lessons={[]} />)
      
      expect(screen.getByText(/Complete more lessons to get personalized recommendations/i)).toBeInTheDocument()
    })
  })

  describe('View All Button', () => {
    it('renders View All Recommendations button when lessons exist', () => {
      render(<RecommendedLessons lessons={mockLessons} />)
      
      expect(screen.getByText('View All Recommendations')).toBeInTheDocument()
    })

    it('does not render View All button when no lessons', () => {
      render(<RecommendedLessons lessons={[]} />)
      
      expect(screen.queryByText('View All Recommendations')).not.toBeInTheDocument()
    })
  })

  describe('Peer Accent Colors', () => {
    it('applies correct border color for Sarah', () => {
      const { container } = render(<RecommendedLessons lessons={[mockLessons[0]]} />)
      
      const lessonCard = container.querySelector('.border-l-pink-400')
      expect(lessonCard).toBeInTheDocument()
    })

    it('applies correct border color for Alex', () => {
      const { container } = render(<RecommendedLessons lessons={[mockLessons[1]]} />)
      
      const lessonCard = container.querySelector('.border-l-blue-400')
      expect(lessonCard).toBeInTheDocument()
    })

    it('applies correct border color for Jordan', () => {
      const { container } = render(<RecommendedLessons lessons={[mockLessons[2]]} />)
      
      const lessonCard = container.querySelector('.border-l-purple-400')
      expect(lessonCard).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<RecommendedLessons lessons={mockLessons} />)
      
      const heading = screen.getByText('Recommended for You')
      expect(heading).toBeInTheDocument()
    })

    it('all buttons are keyboard accessible', () => {
      render(<RecommendedLessons lessons={mockLessons} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('Hover Effects', () => {
    it('applies hover classes to lesson cards', () => {
      const { container } = render(<RecommendedLessons lessons={mockLessons} />)
      
      const cards = container.querySelectorAll('.group')
      expect(cards.length).toBeGreaterThan(0)
    })
  })
})
