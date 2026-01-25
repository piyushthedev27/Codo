import React from 'react'
import { render, screen } from '@testing-library/react'
import { LiveInsightsDashboard } from '../LiveInsightsDashboard'

// Mock the hooks with proper module path
jest.mock('../../../lib/hooks/useInsights', () => ({
  useInsights: () => ({
    insights: [],
    recommendations: [],
    patterns: [],
    meta: {
      totalInsights: 0,
      activeInsights: 0,
      dismissedInsights: 0,
      recommendationsCount: 0,
      patternsCount: 0
    },
    loading: false,
    error: null,
    refreshing: false,
    dismissInsight: jest.fn(),
    regenerateInsights: jest.fn(),
    refresh: jest.fn(),
    hasActiveInsights: false
  }),
  useInsightDismissal: () => ({
    dismissWithOptimisticUpdate: jest.fn(),
    isDismissing: () => false
  })
}))

describe('LiveInsightsDashboard', () => {
  it('renders dashboard title and description', () => {
    render(<LiveInsightsDashboard />)
    
    expect(screen.getByText('Live Learning Insights')).toBeInTheDocument()
    expect(screen.getByText('Real-time pattern recognition and personalized recommendations')).toBeInTheDocument()
  })

  it('shows empty state when no insights are available', () => {
    render(<LiveInsightsDashboard />)
    
    expect(screen.getByText('No Insights Yet')).toBeInTheDocument()
    expect(screen.getByText('Generate Insights')).toBeInTheDocument()
  })
})