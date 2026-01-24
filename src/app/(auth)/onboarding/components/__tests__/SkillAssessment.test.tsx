/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SkillAssessment } from '../SkillAssessment'
import type { OnboardingData } from '@/types/database'

// Mock fetch
global.fetch = jest.fn()

const mockOnComplete = jest.fn()

describe('SkillAssessment Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, profile: {} })
    })
  })

  it('renders the first question correctly', () => {
    render(<SkillAssessment onComplete={mockOnComplete} />)
    
    expect(screen.getByText("What's your current programming experience?")).toBeInTheDocument()
    expect(screen.getByText('Beginner')).toBeInTheDocument()
    expect(screen.getByText('Intermediate')).toBeInTheDocument()
    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })

  it('allows navigation through questions', async () => {
    render(<SkillAssessment onComplete={mockOnComplete} />)
    
    // Select first answer
    fireEvent.click(screen.getByLabelText('Beginner'))
    
    // Click next
    fireEvent.click(screen.getByText('Next'))
    
    // Should show second question
    await waitFor(() => {
      expect(screen.getByText("What's your primary learning goal?")).toBeInTheDocument()
    })
  })

  it('prevents proceeding without selecting an answer', () => {
    render(<SkillAssessment onComplete={mockOnComplete} />)
    
    const nextButton = screen.getByText('Next')
    expect(nextButton).toBeDisabled()
  })

  it('completes assessment and calls API', async () => {
    render(<SkillAssessment onComplete={mockOnComplete} />)
    
    // Answer all questions
    const questions = [
      { answer: 'Beginner', nextText: 'Next' },
      { answer: 'Learning for Fun', nextText: 'Next' },
      { answer: 'JavaScript & Web Development', nextText: 'Next' },
      { answer: 'Visual Learning', nextText: 'Next' },
      { answer: 'Yes, enable voice coaching', nextText: 'Complete Assessment' }
    ]

    for (const question of questions) {
      fireEvent.click(screen.getByLabelText(question.answer))
      fireEvent.click(screen.getByText(question.nextText))
      
      if (question.nextText === 'Complete Assessment') {
        await waitFor(() => {
          expect(fetch).toHaveBeenCalledWith('/api/onboarding', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              skillLevel: 'beginner',
              learningGoal: 'learning',
              primaryDomain: 'javascript',
              preferredLearningStyle: 'visual',
              voiceCoachingEnabled: true
            })
          })
        })
      } else {
        await waitFor(() => {
          expect(screen.getByText(question.nextText)).toBeInTheDocument()
        })
      }
    }

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled()
    })
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    render(<SkillAssessment onComplete={mockOnComplete} />)
    
    // Answer all questions quickly
    fireEvent.click(screen.getByLabelText('Beginner'))
    fireEvent.click(screen.getByText('Next'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByLabelText('Learning for Fun'))
    })
    fireEvent.click(screen.getByText('Next'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByLabelText('JavaScript & Web Development'))
    })
    fireEvent.click(screen.getByText('Next'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByLabelText('Visual Learning'))
    })
    fireEvent.click(screen.getByText('Next'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByLabelText('Yes, enable voice coaching'))
    })
    fireEvent.click(screen.getByText('Complete Assessment'))

    // Should still complete even with API error
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled()
    })
  })
})