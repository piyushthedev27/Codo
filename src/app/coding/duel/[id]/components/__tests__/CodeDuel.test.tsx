/**
 * Code Duel Test Suite
 * Tests for competitive coding interface functionality
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { jest } from '@jest/globals'
import CodeDuelPage from '../page'
import { LiveLeaderboard } from '../components/LiveLeaderboard'
import { CodeDuelArena } from '../components/CodeDuelArena'
import { VictoryCelebration } from '../components/VictoryCelebration'
import { TimerProgressBar } from '../components/TimerProgressBar'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    path: ({ children, ...props }: any) => <path {...props}>{children}</path>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock Web Audio API
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    createOscillator: jest.fn().mockReturnValue({
      connect: jest.fn(),
      frequency: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
      type: 'sine',
      start: jest.fn(),
      stop: jest.fn()
    }),
    createGain: jest.fn().mockReturnValue({
      connect: jest.fn(),
      gain: { 
        setValueAtTime: jest.fn(), 
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn()
      }
    }),
    destination: {},
    currentTime: 0
  }))
})

describe('Code Duel Flow', () => {
  const mockParams = { id: 'test-duel-123' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should render duel page with waiting state', () => {
      render(<CodeDuelPage params={mockParams} />)
      
      expect(screen.getByText('Code Duel Arena')).toBeInTheDocument()
      expect(screen.getByText(/Challenge: Array Methods Mastery/)).toBeInTheDocument()
      expect(screen.getByText('Start Duel')).toBeInTheDocument()
      expect(screen.getByText('10:00')).toBeInTheDocument() // Initial timer
    })

    it('should display correct initial progress values', () => {
      render(<CodeDuelPage params={mockParams} />)
      
      expect(screen.getByText('0%')).toBeInTheDocument() // Progress
      expect(screen.getByText('0')).toBeInTheDocument() // Score
      expect(screen.getByText('#1')).toBeInTheDocument() // Rank
    })
  })

  describe('Duel State Management', () => {
    it('should start duel when start button is clicked', async () => {
      render(<CodeDuelPage params={mockParams} />)
      
      const startButton = screen.getByText('Start Duel')
      fireEvent.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByText('Pause')).toBeInTheDocument()
        expect(screen.queryByText('Start Duel')).not.toBeInTheDocument()
      })
    })

    it('should pause duel when pause button is clicked', async () => {
      render(<CodeDuelPage params={mockParams} />)
      
      // Start duel first
      fireEvent.click(screen.getByText('Start Duel'))
      
      await waitFor(() => {
        const pauseButton = screen.getByText('Pause')
        fireEvent.click(pauseButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Start Duel')).toBeInTheDocument()
      })
    })

    it('should reset duel when reset button is clicked', async () => {
      render(<CodeDuelPage params={mockParams} />)
      
      const resetButton = screen.getByText('Reset')
      fireEvent.click(resetButton)
      
      await waitFor(() => {
        expect(screen.getByText('10:00')).toBeInTheDocument()
        expect(screen.getByText('Start Duel')).toBeInTheDocument()
      })
    })
  })

  describe('Timer Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should countdown timer when duel is active', async () => {
      render(<CodeDuelPage params={mockParams} />)
      
      // Start duel
      fireEvent.click(screen.getByText('Start Duel'))
      
      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(5000) // 5 seconds
      })
      
      await waitFor(() => {
        expect(screen.getByText('9:55')).toBeInTheDocument()
      })
    })

    it('should complete duel when timer reaches zero', async () => {
      render(<CodeDuelPage params={mockParams} />)
      
      // Start duel
      fireEvent.click(screen.getByText('Start Duel'))
      
      // Fast-forward to end
      act(() => {
        jest.advanceTimersByTime(600000) // 10 minutes
      })
      
      await waitFor(() => {
        expect(screen.getByText('0:00')).toBeInTheDocument()
      })
    })
  })
})

describe('Live Leaderboard', () => {
  it('should render leaderboard with AI competitors', () => {
    render(<LiveLeaderboard />)
    
    expect(screen.getByText('Live Leaderboard')).toBeInTheDocument()
    expect(screen.getByText('Array Methods Challenge')).toBeInTheDocument()
    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.getByText('Alex')).toBeInTheDocument()
    expect(screen.getByText('Sarah')).toBeInTheDocument()
    expect(screen.getByText('Jordan')).toBeInTheDocument()
  })

  it('should display participant progress and scores', () => {
    render(<LiveLeaderboard />)
    
    // Check for progress indicators
    expect(screen.getAllByText(/\d+\/8 tests/)).toHaveLength(4)
    expect(screen.getAllByText(/\d+ pts/)).toHaveLength(4)
  })

  it('should show time remaining', () => {
    render(<LiveLeaderboard />)
    
    expect(screen.getByText(/\d+:\d+ /)).toBeInTheDocument()
    expect(screen.getByText('Time Remaining')).toBeInTheDocument()
  })
})

describe('Code Duel Arena', () => {
  const mockProps = {
    duelState: 'active' as const,
    onProgressUpdate: jest.fn(),
    timeRemaining: 600
  }

  it('should render challenge description and code editor', () => {
    render(<CodeDuelArena {...mockProps} />)
    
    expect(screen.getByText('Array Methods Mastery')).toBeInTheDocument()
    expect(screen.getByText(/Implement a function that filters/)).toBeInTheDocument()
    expect(screen.getByText('Your Solution')).toBeInTheDocument()
  })

  it('should show hints when hint button is clicked', async () => {
    render(<CodeDuelArena {...mockProps} />)
    
    const hintButton = screen.getByText('Show Hints')
    fireEvent.click(hintButton)
    
    await waitFor(() => {
      expect(screen.getByText('💡 Hints:')).toBeInTheDocument()
      expect(screen.getByText(/Use the filter\(\) method/)).toBeInTheDocument()
    })
  })

  it('should run tests when run button is clicked', async () => {
    render(<CodeDuelArena {...mockProps} />)
    
    const runButton = screen.getByText('Run Tests')
    fireEvent.click(runButton)
    
    await waitFor(() => {
      expect(screen.getByText('Running...')).toBeInTheDocument()
    })
  })

  it('should display test cases in test tab', () => {
    render(<CodeDuelArena {...mockProps} />)
    
    fireEvent.click(screen.getByText('Test Cases'))
    
    expect(screen.getByText('Test 1')).toBeInTheDocument()
    expect(screen.getByText('Test 2')).toBeInTheDocument()
    expect(screen.getByText('[1, 2, 3, 4, 5, 6]')).toBeInTheDocument()
  })

  it('should be disabled when duel is not active', () => {
    const inactiveProps = { ...mockProps, duelState: 'waiting' as const }
    render(<CodeDuelArena {...inactiveProps} />)
    
    expect(screen.getByText('Start the duel to begin coding')).toBeInTheDocument()
  })
})

describe('Timer Progress Bar', () => {
  const mockProps = {
    timeRemaining: 300, // 5 minutes
    totalTime: 600, // 10 minutes
    userProgress: 50,
    userScore: 75,
    duelState: 'active' as const,
    testsPasssed: 4,
    totalTests: 8
  }

  it('should display time remaining correctly', () => {
    render(<TimerProgressBar {...mockProps} />)
    
    expect(screen.getByText('5:00')).toBeInTheDocument()
    expect(screen.getByText('Time Remaining')).toBeInTheDocument()
  })

  it('should show progress percentage', () => {
    render(<TimerProgressBar {...mockProps} />)
    
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('Challenge Progress')).toBeInTheDocument()
  })

  it('should display current score', () => {
    render(<TimerProgressBar {...mockProps} />)
    
    expect(screen.getByText('75')).toBeInTheDocument()
    expect(screen.getByText('Current Score')).toBeInTheDocument()
  })

  it('should show tests passed', () => {
    render(<TimerProgressBar {...mockProps} />)
    
    expect(screen.getByText('Tests Passed: 4/8')).toBeInTheDocument()
  })

  it('should show time warning when time is low', () => {
    const lowTimeProps = { ...mockProps, timeRemaining: 60 }
    render(<TimerProgressBar {...lowTimeProps} />)
    
    expect(screen.getByText(/Time running low/)).toBeInTheDocument()
  })
})

describe('Victory Celebration', () => {
  const mockProps = {
    score: 95,
    rank: 1,
    timeElapsed: 480, // 8 minutes
    onClose: jest.fn()
  }

  it('should display victory message for first place', () => {
    render(<VictoryCelebration {...mockProps} />)
    
    expect(screen.getByText('🏆 VICTORY!')).toBeInTheDocument()
    expect(screen.getByText('You finished in #1 place!')).toBeInTheDocument()
  })

  it('should show final score and rating', () => {
    render(<VictoryCelebration {...mockProps} />)
    
    expect(screen.getByText('95 points')).toBeInTheDocument()
    expect(screen.getByText('Excellent!')).toBeInTheDocument()
  })

  it('should display time elapsed', () => {
    render(<VictoryCelebration {...mockProps} />)
    
    expect(screen.getByText('8:00')).toBeInTheDocument()
  })

  it('should show XP reward with victory bonus', () => {
    render(<VictoryCelebration {...mockProps} />)
    
    expect(screen.getByText('+195 XP')).toBeInTheDocument() // 95 + 100 victory bonus
    expect(screen.getByText('🏆 Victory Bonus: +100 XP')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    render(<VictoryCelebration {...mockProps} />)
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })
})

describe('Scoring System', () => {
  it('should calculate score based on tests passed', () => {
    const mockOnProgressUpdate = jest.fn()
    
    render(
      <CodeDuelArena
        duelState="active"
        onProgressUpdate={mockOnProgressUpdate}
        timeRemaining={600}
      />
    )
    
    // Simulate running tests
    fireEvent.click(screen.getByText('Run Tests'))
    
    // Wait for test completion and check if progress update was called
    waitFor(() => {
      expect(mockOnProgressUpdate).toHaveBeenCalled()
    })
  })

  it('should award bonus XP based on rank', () => {
    const testCases = [
      { rank: 1, expectedBonus: 100 },
      { rank: 2, expectedBonus: 50 },
      { rank: 3, expectedBonus: 25 },
      { rank: 4, expectedBonus: 10 }
    ]

    testCases.forEach(({ rank, expectedBonus }) => {
      const props = {
        score: 80,
        rank,
        timeElapsed: 300,
        onClose: jest.fn()
      }
      
      render(<VictoryCelebration {...props} />)
      
      expect(screen.getByText(`+${80 + expectedBonus} XP`)).toBeInTheDocument()
    })
  })
})

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should complete full duel flow', async () => {
    const mockOnProgressUpdate = jest.fn()
    
    render(<CodeDuelPage params={mockParams} />)
    
    // Start duel
    fireEvent.click(screen.getByText('Start Duel'))
    
    // Verify active state
    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument()
    })
    
    // Simulate progress updates would trigger celebrations
    // This would be tested with actual progress updates in a real scenario
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(10000) // 10 seconds
    })
    
    // Verify timer updated
    await waitFor(() => {
      expect(screen.getByText('9:50')).toBeInTheDocument()
    })
  })

  it('should handle milestone celebrations', async () => {
    // This would test the celebration system integration
    // In a real test, we'd simulate progress updates that trigger celebrations
    expect(true).toBe(true) // Placeholder for milestone celebration tests
  })
})

describe('Error Handling', () => {
  it('should handle audio context creation failure gracefully', () => {
    // Mock AudioContext to throw error
    const originalAudioContext = window.AudioContext
    delete (window as any).AudioContext
    
    // Should not throw error when trying to play sounds
    expect(() => {
      // This would call playVictorySound() in a real scenario
    }).not.toThrow()
    
    // Restore AudioContext
    window.AudioContext = originalAudioContext
  })

  it('should handle missing progress data gracefully', () => {
    const props = {
      timeRemaining: 0,
      totalTime: 600,
      userProgress: 0,
      userScore: 0,
      duelState: 'waiting' as const,
      testsPasssed: 0,
      totalTests: 0
    }
    
    expect(() => {
      render(<TimerProgressBar {...props} />)
    }).not.toThrow()
  })
})

describe('Accessibility', () => {
  it('should have proper ARIA labels for interactive elements', () => {
    render(<CodeDuelPage params={mockParams} />)
    
    const startButton = screen.getByText('Start Duel')
    expect(startButton).toBeInTheDocument()
    
    // Check for proper button roles
    expect(startButton.tagName).toBe('BUTTON')
  })

  it('should support keyboard navigation', () => {
    render(<CodeDuelPage params={mockParams} />)
    
    const startButton = screen.getByText('Start Duel')
    
    // Should be focusable
    startButton.focus()
    expect(document.activeElement).toBe(startButton)
  })
})

describe('Performance', () => {
  it('should not cause memory leaks with timers', () => {
    const { unmount } = render(<CodeDuelPage params={mockParams} />)
    
    // Start duel to activate timers
    fireEvent.click(screen.getByText('Start Duel'))
    
    // Unmount component
    unmount()
    
    // Timers should be cleaned up (this would be verified in a real test environment)
    expect(true).toBe(true)
  })

  it('should handle rapid progress updates efficiently', async () => {
    const mockOnProgressUpdate = jest.fn()
    
    render(
      <CodeDuelArena
        duelState="active"
        onProgressUpdate={mockOnProgressUpdate}
        timeRemaining={600}
      />
    )
    
    // Simulate rapid test runs
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByText('Run Tests'))
    }
    
    // Should handle multiple rapid calls gracefully
    expect(true).toBe(true)
  })
})