import { render, screen } from '@testing-library/react'
import { EnhancedStatsGrid } from '../EnhancedStatsGrid'
import type { EnhancedStats } from '@/lib/utils/stats-calculations'

// Mock data for testing
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
    message: "Great progress!",
    trend: 'up'
  },
  skillsMastered: {
    count: 12,
    recentSkills: ['JavaScript', 'React', 'TypeScript'],
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

describe('EnhancedStatsGrid', () => {
  it('renders all stat cards with correct data', () => {
    render(<EnhancedStatsGrid stats={mockStats} />)
    
    // Check Learning Progress card
    expect(screen.getByText('Learning Progress')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('15 of 20 lessons completed')).toBeInTheDocument()
    
    // Check Current Streak card
    expect(screen.getByText('Current Streak')).toBeInTheDocument()
    expect(screen.getByText('7 Days')).toBeInTheDocument()
    expect(screen.getByText('Great progress!')).toBeInTheDocument()
    
    // Check Skills Mastered card
    expect(screen.getByText('Skills Mastered')).toBeInTheDocument()
    expect(screen.getByText('12 Skills')).toBeInTheDocument()
    expect(screen.getByText('JavaScript, React, TypeScript')).toBeInTheDocument()
    
    // Check Coding Time card
    expect(screen.getByText('Time This Week')).toBeInTheDocument()
    expect(screen.getByText('15.5h')).toBeInTheDocument()
    expect(screen.getByText('Daily avg: 2.2h')).toBeInTheDocument()
  })
  
  it('displays trend indicators correctly', () => {
    render(<EnhancedStatsGrid stats={mockStats} />)
    
    // All trends are 'up' in mock data, so we should see trend indicators
    const trendElements = screen.getAllByText(/\+/)
    expect(trendElements.length).toBeGreaterThan(0)
  })
  
  it('applies hover effects with proper CSS classes', () => {
    const { container } = render(<EnhancedStatsGrid stats={mockStats} />)
    
    // Check that cards have hover effect classes
    const cards = container.querySelectorAll('[class*="hover:scale-105"]')
    expect(cards).toHaveLength(4) // Should have 4 stat cards
  })
  
  it('handles empty or zero values gracefully', () => {
    const emptyStats: EnhancedStats = {
      learningProgress: {
        percentage: 0,
        lessonsCompleted: 0,
        totalLessons: 0,
        weeklyChange: 0,
        trend: 'stable'
      },
      currentStreak: {
        days: 0,
        bestStreak: 0,
        message: "Start your streak today!",
        trend: 'stable'
      },
      skillsMastered: {
        count: 0,
        recentSkills: [],
        monthlyProgress: 0,
        trend: 'stable'
      },
      codingTime: {
        weeklyHours: 0,
        dailyAverage: 0,
        weeklyChange: 0,
        trend: 'stable'
      }
    }
    
    render(<EnhancedStatsGrid stats={emptyStats} />)
    
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('0 Days')).toBeInTheDocument()
    expect(screen.getByText('0 Skills')).toBeInTheDocument()
    expect(screen.getByText('Start your streak today!')).toBeInTheDocument()
  })
})