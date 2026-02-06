/**
 * AI Peer Typing Animation Component
 * Simulates realistic typing patterns for AI peers with personality-based behaviors
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/shared/Avatar'
import { getPeerProfile } from '@/lib/avatars'

interface TypingSession {
  peerId: string
  targetText: string
  currentText: string
  isActive: boolean
  typingSpeed: number
  pauseChance: number
  mistakeChance: number
  currentIndex: number
  isPaused: boolean
  pauseEndTime?: number
}

interface AIPeerTypingAnimationProps {
  peers: string[]
  codeSnippets: Record<string, string>
  onTypingComplete?: (peerId: string, code: string) => void
  className?: string
}

export function AIPeerTypingAnimation({
  peers,
  codeSnippets,
  onTypingComplete,
  className = ''
}: AIPeerTypingAnimationProps) {
  const [typingSessions, setTypingSessions] = useState<TypingSession[]>([])
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Initialize typing sessions
  useEffect(() => {
    const sessions: TypingSession[] = peers.map(peerId => {
      const peer = getPeerProfile(peerId)
      const targetText = codeSnippets[peerId] || '// No code provided'
      
      // Personality-based typing characteristics
      let typingSpeed = 100 // Base speed in ms
      let pauseChance = 0.1
      let mistakeChance = 0.02

      if (peer?.personality === 'analytical') {
        // Alex types methodically with longer pauses
        typingSpeed = 150
        pauseChance = 0.15
        mistakeChance = 0.01
      } else if (peer?.personality === 'curious') {
        // Sarah types quickly but makes more mistakes
        typingSpeed = 80
        pauseChance = 0.08
        mistakeChance = 0.03
      } else if (peer?.personality === 'supportive') {
        // Jordan types steadily and carefully
        typingSpeed = 120
        pauseChance = 0.12
        mistakeChance = 0.015
      }

      return {
        peerId,
        targetText,
        currentText: '',
        isActive: true,
        typingSpeed,
        pauseChance,
        mistakeChance,
        currentIndex: 0,
        isPaused: false
      }
    })

    setTypingSessions(sessions)
  }, [peers, codeSnippets])

  // Typing simulation logic
  useEffect(() => {
    if (typingSessions.length === 0) return

    intervalRef.current = setInterval(() => {
      setTypingSessions(prevSessions => {
        return prevSessions.map(session => {
          if (!session.isActive || session.currentIndex >= session.targetText.length) {
            // Session completed
            if (session.currentIndex >= session.targetText.length && session.isActive) {
              onTypingComplete?.(session.peerId, session.currentText)
              return { ...session, isActive: false }
            }
            return session
          }

          // Check if currently paused
          if (session.isPaused && session.pauseEndTime) {
            if (Date.now() < session.pauseEndTime) {
              return session // Still paused
            } else {
              return { ...session, isPaused: false, pauseEndTime: undefined }
            }
          }

          // Random pause based on personality
          if (Math.random() < session.pauseChance) {
            const pauseDuration = Math.random() * 1000 + 500 // 500-1500ms pause
            return {
              ...session,
              isPaused: true,
              pauseEndTime: Date.now() + pauseDuration
            }
          }

          // Type next character
          const nextChar = session.targetText[session.currentIndex]
          let newText = session.currentText
          let newIndex = session.currentIndex

          // Simulate typing mistakes
          if (Math.random() < session.mistakeChance && nextChar !== ' ') {
            // Type wrong character, then correct it
            const wrongChars = 'abcdefghijklmnopqrstuvwxyz'
            const wrongChar = wrongChars[Math.floor(Math.random() * wrongChars.length)]
            newText += wrongChar
            
            // Schedule correction
            setTimeout(() => {
              setTypingSessions(prev => prev.map(s => 
                s.peerId === session.peerId 
                  ? { ...s, currentText: s.currentText.slice(0, -1) + nextChar, currentIndex: s.currentIndex + 1 }
                  : s
              ))
            }, 200)
          } else {
            // Type correct character
            newText += nextChar
            newIndex += 1
          }

          return {
            ...session,
            currentText: newText,
            currentIndex: newIndex
          }
        })
      })
    }, 50) // Check every 50ms for smooth animation

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [typingSessions, onTypingComplete])

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence>
        {typingSessions.map((session) => {
          const peer = getPeerProfile(session.peerId)
          if (!peer) return null

          return (
            <motion.div
              key={session.peerId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Peer Header */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <Avatar peerId={session.peerId} size="sm" className="w-8 h-8" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {peer.name}
                    </span>
                    {session.isActive && (
                      <div className="flex items-center gap-1">
                        {session.isPaused ? (
                          <motion.div
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-2 h-2 bg-yellow-400 rounded-full"
                          />
                        ) : (
                          <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="w-2 h-2 bg-green-400 rounded-full"
                          />
                        )}
                        <span className="text-xs text-gray-500">
                          {session.isPaused ? 'thinking...' : 'typing...'}
                        </span>
                      </div>
                    )}
                    {!session.isActive && session.currentIndex >= session.targetText.length && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-xs text-gray-500">completed</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {peer.personality} • {Math.round((session.currentIndex / session.targetText.length) * 100)}% complete
                  </div>
                </div>
              </div>

              {/* Code Display */}
              <div className="p-4 font-mono text-sm bg-gray-900 text-green-400 min-h-[120px] relative">
                <pre className="whitespace-pre-wrap">
                  {session.currentText}
                  {session.isActive && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-2 h-5 bg-green-400 ml-0.5"
                    />
                  )}
                </pre>

                {/* Progress Bar */}
                <div className="absolute bottom-2 left-4 right-4">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <motion.div
                      className="h-1 rounded-full"
                      style={{
                        backgroundColor: peer.personality === 'curious' ? '#ec4899' : 
                                       peer.personality === 'analytical' ? '#3b82f6' : '#10b981'
                      }}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${(session.currentIndex / session.targetText.length) * 100}%` 
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>

              {/* Typing Stats */}
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 flex justify-between">
                <span>Speed: {Math.round(60000 / session.typingSpeed)} WPM</span>
                <span>Characters: {session.currentIndex} / {session.targetText.length}</span>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// Preset code snippets for different challenges
export const TYPING_CODE_SNIPPETS = {
  sarah: `// Sarah's approach - using modern array methods
function processNumbers(numbers) {
  return numbers
    .filter(num => num % 2 === 0)
    .map(num => num * 2);
}

// Let me test this...
const result = processNumbers([1, 2, 3, 4, 5, 6]);
console.log('Result:', result);`,

  alex: `// Alex's approach - with comprehensive error handling
function processNumbers(numbers) {
  // Input validation
  if (!Array.isArray(numbers)) {
    throw new Error('Input must be an array');
  }
  
  const result = [];
  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    if (typeof num === 'number' && num % 2 === 0) {
      result.push(num * 2);
    }
  }
  
  return result;
}`,

  jordan: `// Jordan's approach - functional with comments
function processNumbers(numbers) {
  // Filter for even numbers, then double them
  // This creates a new array without modifying the original
  return numbers
    .filter(isEven)
    .map(double);
}

// Helper functions for clarity
const isEven = num => num % 2 === 0;
const double = num => num * 2;

// Usage example
const input = [1, 2, 3, 4, 5, 6];
const output = processNumbers(input);`
}