/**
 * Cursor Presence Component for Collaborative Coding
 * Shows AI peer cursors with 3D avatars during collaborative coding sessions
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/shared/Avatar'
import { getPeerProfile } from '@/lib/avatars'

interface CursorPosition {
  peerId: string
  x: number
  y: number
  line: number
  column: number
  isTyping: boolean
  lastActivity: Date
}

export function CursorPresence() {
  const [cursors, setCursors] = useState<CursorPosition[]>([
    {
      peerId: 'sarah',
      x: 120,
      y: 180,
      line: 5,
      column: 12,
      isTyping: false,
      lastActivity: new Date()
    },
    {
      peerId: 'alex',
      x: 280,
      y: 240,
      line: 8,
      column: 25,
      isTyping: true,
      lastActivity: new Date()
    }
  ])

  // Simulate cursor movement and typing
  useEffect(() => {
    const interval = setInterval(() => {
      setCursors(prev => prev.map(cursor => {
        const peer = getPeerProfile(cursor.peerId)
        if (!peer) return cursor

        // Simulate realistic cursor movement based on personality
        let newX = cursor.x
        let newY = cursor.y
        let newIsTyping = cursor.isTyping

        if (peer.personality === 'analytical') {
          // Alex moves more methodically
          newX += Math.random() * 20 - 10
          newY += Math.random() * 10 - 5
          newIsTyping = Math.random() > 0.7
        } else if (peer.personality === 'curious') {
          // Sarah moves more actively
          newX += Math.random() * 40 - 20
          newY += Math.random() * 30 - 15
          newIsTyping = Math.random() > 0.6
        }

        // Keep cursors within bounds
        newX = Math.max(50, Math.min(500, newX))
        newY = Math.max(100, Math.min(400, newY))

        return {
          ...cursor,
          x: newX,
          y: newY,
          isTyping: newIsTyping,
          lastActivity: new Date()
        }
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      {/* Code Editor Background */}
      <div className="absolute inset-0 p-4 font-mono text-sm text-green-400">
        <div className="space-y-1">
          <div>1  function calculateSum(a, b) {`{`}</div>
          <div>2    // Sarah is working here</div>
          <div>3    const result = a + b;</div>
          <div>4    </div>
          <div>5    // Validation logic</div>
          <div>6    if (typeof a !== 'number' || typeof b !== 'number') {`{`}</div>
          <div>7      throw new Error('Invalid input');</div>
          <div>8    {`}`} // Alex is reviewing this</div>
          <div>9    </div>
          <div>10   return result;</div>
          <div>11 {`}`}</div>
        </div>
      </div>

      {/* Cursor Overlays */}
      <AnimatePresence>
        {cursors.map((cursor) => {
          const peer = getPeerProfile(cursor.peerId)
          if (!peer) return null

          return (
            <motion.div
              key={cursor.peerId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: cursor.x,
                y: cursor.y
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }}
              className="absolute pointer-events-none"
            >
              {/* Cursor Line */}
              <div 
                className="w-0.5 h-5 animate-pulse"
                style={{ 
                  backgroundColor: peer.personality === 'curious' ? '#ec4899' : 
                                 peer.personality === 'analytical' ? '#3b82f6' : '#10b981'
                }}
              />
              
              {/* Cursor Label */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-12 -left-2 flex items-center gap-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
              >
                <Avatar peerId={cursor.peerId} size="sm" className="w-6 h-6" />
                <div className="text-xs">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {peer.name}
                  </div>
                  {cursor.isTyping && (
                    <div className="text-gray-500 flex items-center gap-1">
                      <span>typing</span>
                      <div className="flex gap-0.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            className="w-1 h-1 bg-gray-400 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Selection Highlight */}
              {cursor.isTyping && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: Math.random() * 100 + 50 }}
                  className="absolute top-0 h-5 bg-blue-200 dark:bg-blue-800 opacity-30 rounded"
                />
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Collaboration Status */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-600">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Active Collaborators
        </div>
        <div className="space-y-2">
          {cursors.map((cursor) => {
            const peer = getPeerProfile(cursor.peerId)
            if (!peer) return null

            return (
              <div key={cursor.peerId} className="flex items-center gap-2">
                <Avatar peerId={cursor.peerId} size="sm" className="w-6 h-6" />
                <div className="text-xs">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {peer.name}
                  </div>
                  <div className="text-gray-500">
                    Line {cursor.line}
                    {cursor.isTyping && (
                      <span className="text-green-500 ml-1">• typing</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Code Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 max-w-xs"
      >
        <div className="flex items-start gap-2">
          <Avatar peerId="alex" size="sm" className="w-6 h-6" />
          <div className="text-xs">
            <div className="font-medium text-gray-900 dark:text-white">
              Alex suggests:
            </div>
            <div className="text-gray-700 dark:text-gray-300 mt-1">
              "Consider adding input validation before the calculation"
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}