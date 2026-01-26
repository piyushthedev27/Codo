/**
 * LessonViewer Component Tests
 * Tests for the main lesson viewer functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LessonViewer } from '../LessonViewer'
import type { GeneratedLesson } from '@/lib/ai/lesson-generation'
import type { LessonProgress } from '@/lib/lessons/progress-tracking'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' })
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}))

// Mock voice coaching interface
jest.mock('@/components/unique-features/VoiceCoachingInterface', () => ({
  VoiceCoachingInterface: ({ onVoiceUsage }: any) => (
    <div data-testid="voice-coaching">
      <button onClick={() => onVoiceUsage()}>Use Voice</button>
    </div>
  )
}))

// Mock synthetic peer chat
jest.mock('@/app/lessons/[id]/components/SyntheticPeerChat', () => ({
  SyntheticPeerChat: () => <div data-testid="peer-chat">Peer Chat</div>
}))

const mockLesson: GeneratedLesson = {
  title: 'Test Lesson',
  topic: 'Testing',
  difficulty_level: 1,
  content: {
    sections: [
      {
        id: '1',
        title: 'Introduction',
        content: 'This is the introduction section.',
        estimatedDuration: 5,
        codeExamples: [
          {
            id: 'code-1',
            language: 'javascript',
            code: 'console.log("Hello World");',
            explanation: 'This prints Hello World to the console.',
            runnable: true
          }
        ],
        interactiveElements: [
          {
            id: 'quiz-1',
            type: 'quiz',
            question: 'What does console.log do?',
            options: ['Prints to console', 'Creates a log file', 'Does nothing'],
            correctAnswer: 'Prints to console',
            explanation: 'console.log prints output to the browser console.'
          }
        ]
      },
      {
        id: '2',
        title: 'Advanced Topics',
        content: 'This covers advanced concepts.',
        estimatedDuration: 10
      }
    ],
    learningObjectives: [
      'Understand basic concepts',
      'Apply knowledge practically'
    ],
    prerequisites: ['Basic programming knowledge'],
    summary: 'A comprehensive test lesson.'
  },
  peer_interactions: [
    {
      id: 'peer-1',
      peer_id: 'sarah',
      interaction_type: 'question',
      content: 'Can you explain this concept?',
      trigger_point: 1,
      user_response_required: true,
      xp_reward: 25
    }
  ],
  voice_coaching_points: [
    {
      id: 'voice-1',
      trigger_condition: 'user_asks_question',
      voice_prompt: 'I can help explain that concept.',
      context_data: { topic: 'testing' },
      response_expected: true
    }
  ],
  estimated_duration: 15,
  xp_reward: 100
}

const mockProgress: LessonProgress = {
  lessonId: 'test-lesson',
  userId: 'test-user',
  currentSection: 0,
  totalSections: 2,
  progressPercentage: 0,
  timeSpentMinutes: 0,
  sectionsCompleted: [],
  interactionsCompleted: [],
  voiceCoachingUsed: false,
  mistakesMade: 0,
  xpEarned: 0,
  status: 'not_started',
  lastAccessedAt: new Date().toISOString()
}

describe('LessonViewer', () => {
  const mockOnProgressUpdate = jest.fn()
  const mockOnComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders lesson content correctly', () => {
    render(
      <LessonViewer
        lesson={mockLesson}
        progress={mockProgress}
        onProgressUpdate={mockOnProgressUpdate}
        onComplete={mockOnComplete}
      />
    )

    expect(screen.getByText('Test Lesson')).toBeInTheDocument()
    expect(screen.getByText('Introduction')).toBeInTheDocument()
    expect(screen.getByText('This is the introduction section.')).toBeInTheDocument()
  })

  it('displays progress information', () => {
    render(
      <LessonViewer
        lesson={mockLesson}
        progress={mockProgress}
        onProgressUpdate={mockOnProgressUpdate}
        onComplete={mockOnComplete}
      />
    )

    expect(screen.getByText('Section 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('0% Complete')).toBeInTheDocument()
  })

  it('navigates between sections', async () => {
    render(
      <LessonViewer
        lesson={mockLesson}
        progress={mockProgress}
        onProgressUpdate={mockOnProgressUpdate}
        onComplete={mockOnComplete}
      />
    )

    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Advanced Topics')).toBeInTheDocument()
    })
  })

  it('calls onProgressUpdate when section is completed', async () => {
    render(
      <LessonViewer
        lesson={mockLesson}
        progress={mockProgress}
        onProgressUpdate={mockOnProgressUpdate}
        onComplete={mockOnComplete}
      />
    )

    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockOnProgressUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          sectionId: '1',
          xpEarned: 10
        })
      )
    })
  })

  it('shows voice coaching interface when enabled', () => {
    render(
      <LessonViewer
        lesson={mockLesson}
        progress={mockProgress}
        onProgressUpdate={mockOnProgressUpdate}
        onComplete={mockOnComplete}
        voiceCoachingEnabled={true}
      />
    )

    const voiceButton = screen.getByText('Voice Coach')
    fireEvent.click(voiceButton)

    expect(screen.getByTestId('voice-coaching')).toBeInTheDocument()
  })

  it('shows peer chat when toggled', () => {
    render(
      <LessonViewer
        lesson={mockLesson}
        progress={mockProgress}
        onProgressUpdate={mockOnProgressUpdate}
        onComplete={mockOnComplete}
      />
    )

    const peerButton = screen.getByText('💬 Study Group')
    fireEvent.click(peerButton)

    expect(screen.getByTestId('peer-chat')).toBeInTheDocument()
  })

  it('calls onComplete when lesson is finished', async () => {
    const progressWithCompletedSections = {
      ...mockProgress,
      currentSection: 1,
      sectionsCompleted: ['1']
    }

    render(
      <LessonViewer
        lesson={mockLesson}
        progress={progressWithCompletedSections}
        onProgressUpdate={mockOnProgressUpdate}
        onComplete={mockOnComplete}
      />
    )

    const completeButton = screen.getByText('Complete Lesson')
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled()
    })
  })

  it('displays learning objectives in sidebar', () => {
    render(
      <LessonViewer
        lesson={mockLesson}
        progress={mockProgress}
        onProgressUpdate={mockOnProgressUpdate}
        onComplete={mockOnComplete}
      />
    )

    expect(screen.getByText('Learning Objectives')).toBeInTheDocument()
    expect(screen.getByText('Understand basic concepts')).toBeInTheDocument()
    expect(screen.getByText('Apply knowledge practically')).toBeInTheDocument()
  })

  it('tracks voice coaching usage', async () => {
    render(
      <LessonViewer
        lesson={mockLesson}
        progress={mockProgress}
        onProgressUpdate={mockOnProgressUpdate}
        onComplete={mockOnComplete}
        voiceCoachingEnabled={true}
      />
    )

    // Enable voice coaching
    const voiceButton = screen.getByText('Voice Coach')
    fireEvent.click(voiceButton)

    // Use voice coaching
    const useVoiceButton = screen.getByText('Use Voice')
    fireEvent.click(useVoiceButton)

    await waitFor(() => {
      expect(mockOnProgressUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          voiceCoachingUsed: true,
          timeSpent: 1
        })
      )
    })
  })
})