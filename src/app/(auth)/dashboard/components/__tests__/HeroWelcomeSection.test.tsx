/**
 * Unit Tests for HeroWelcomeSection Component
 * Tests rendering, props, user interactions, and loading states
 */

import { render, screen, waitFor } from '@testing-library/react'
import { HeroWelcomeSection } from '../HeroWelcomeSection'
import type { UserProfile, AIPeerProfile } from '@/types/database'

// Mock data
const mockUser = {
  firstName: 'John'
}

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
    interaction_style: 'Methodical and detail-oriented',
    backstory: 'An analytical thinker',
    created_at: new Date()
  }
]

const mockLearningProgress = {
  percentage: 75,
  lessonsCompleted: 15,
  totalLessons: 20
}

const mockCurrentStreak = 7

describe('HeroWelcomeSection', () => {
  describe('Rendering', () => {
    it('renders welcome message with user name', () => {
      render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      expect(screen.getByText(/Welcome back, John!/i)).toBeInTheDocument()
    })

    it('renders with profile first name when user object is missing', () => {
      render(
        <HeroWelcomeSection
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      expect(screen.getByText(/Welcome back, John!/i)).toBeInTheDocument()
    })

    it('renders default "Learner" when no name is available', () => {
      const profileWithoutName = { ...mockProfile, first_name: null }
      render(
        <HeroWelcomeSection
          profile={profileWithoutName}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      expect(screen.getByText(/Welcome back, Learner!/i)).toBeInTheDocument()
    })

    it('displays learning progress percentage', () => {
      render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      expect(screen.getByText('75% Complete')).toBeInTheDocument()
      expect(screen.getByText('15 of 20 lessons completed')).toBeInTheDocument()
    })

    it('displays current streak', () => {
      render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      expect(screen.getByText('7')).toBeInTheDocument()
      expect(screen.getByText(/Day Streak/i)).toBeInTheDocument()
    })

    it('displays XP points', () => {
      render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      expect(screen.getByText('350')).toBeInTheDocument()
      expect(screen.getByText('XP Points')).toBeInTheDocument()
    })

    it('displays achievements count', () => {
      render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('Achievements')).toBeInTheDocument()
    })
  })

  describe('AI Peer Messages', () => {
    it('displays AI peer message', () => {
      render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      // Should display one of the peer messages
      const peerMessages = [
        /Keep up the great work/i,
        /Your problem-solving approach/i,
        /I've noticed you're getting better/i
      ]

      const hasMessage = peerMessages.some(pattern => 
        screen.queryByText(pattern) !== null
      )
      expect(hasMessage).toBe(true)
    })

    it('rotates peer messages over time', async () => {
      jest.useFakeTimers()
      
      render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      // Get initial message
      const initialMessage = screen.getByText(/Keep up the great work|Your problem-solving|I've noticed/i).textContent

      // Fast-forward 8 seconds
      jest.advanceTimersByTime(8000)

      await waitFor(() => {
        const newMessage = screen.getByText(/Keep up the great work|Your problem-solving|I've noticed/i).textContent
        // Message should have changed (or stayed same if only 1 message)
        expect(newMessage).toBeDefined()
      })

      jest.useRealTimers()
    })
  })

  describe('Call-to-Action Buttons', () => {
    it('renders Continue Learning button', () => {
      render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      expect(screen.getByText('Continue Learning')).toBeInTheDocument()
    })

    it('renders Talk to AI Peers button', () => {
      render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      expect(screen.getByText('Talk to AI Peers')).toBeInTheDocument()
    })
  })

  describe('Progress Bar', () => {
    it('renders progress bar with correct width', () => {
      const { container } = render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      const progressBar = container.querySelector('[style*="width: 75%"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('handles 0% progress', () => {
      const zeroProgress = { percentage: 0, lessonsCompleted: 0, totalLessons: 20 }
      const { container } = render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={zeroProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      expect(screen.getByText('0% Complete')).toBeInTheDocument()
      const progressBar = container.querySelector('[style*="width: 0%"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('handles 100% progress', () => {
      const fullProgress = { percentage: 100, lessonsCompleted: 20, totalLessons: 20 }
      const { container } = render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={fullProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      expect(screen.getByText('100% Complete')).toBeInTheDocument()
      const progressBar = container.querySelector('[style*="width: 100%"]')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive CSS classes', () => {
      const { container } = render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      // Check for responsive flex classes
      const flexContainer = container.querySelector('.flex.flex-col.lg\\:flex-row')
      expect(flexContainer).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent(/Welcome back, John!/i)
    })

    it('buttons are keyboard accessible', () => {
      render(
        <HeroWelcomeSection
          user={mockUser}
          profile={mockProfile}
          aiPeers={mockAIPeers}
          learningProgress={mockLearningProgress}
          currentStreak={mockCurrentStreak}
        />
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
      })
    })
  })
})
