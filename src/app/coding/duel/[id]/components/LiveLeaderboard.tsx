/**
 * Live Leaderboard Component for Code Duels
 * Shows real-time competition progress with AI peers using 3D avatars
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Zap, Clock, Target, TrendingUp } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { getPeerProfile } from '@/lib/avatars'

interface DuelParticipant {
  id: string
  peerId: string
  name: string
  progress: number
  score: number
  testsPasssed: number
  totalTests: number
  timeElapsed: number
  isUser?: boolean
  rank: number
  trend: 'up' | 'down' | 'stable'
}

export function LiveLeaderboard() {
  const [participants, setParticipants] = useState<DuelParticipant[]>([
    {
      id: 'user',
      peerId: 'user',
      name: 'You',
      progress: 75,
      score: 850,
      testsPasssed: 6,
      totalTests: 8,
      timeElapsed: 180, // 3 minutes
      isUser: true,
      rank: 1,
      trend: 'up'
    },
    {
      id: 'alex',
      peerId: 'alex',
      name: 'Alex',
      progress: 68,
      score: 720,
      testsPasssed: 5,
      totalTests: 8,
      timeElapsed: 195,
      rank: 2,
      trend: 'stable'
    },
    {
      id: 'sarah',
      peerId: 'sarah',
      name: 'Sarah',
      progress: 62,
      score: 680,
      testsPasssed: 5,
      totalTests: 8,
      timeElapsed: 210,
      rank: 3,
      trend: 'down'
    },
    {
      id: 'jordan',
      peerId: 'jordan',
      name: 'Jordan',
      progress: 58,
      score: 640,
      testsPasssed: 4,
      totalTests: 8,
      timeElapsed: 225,
      rank: 4,
      trend: 'up'
    }
  ])

  const [timeRemaining, setTimeRemaining] = useState(420) // 7 minutes remaining

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setParticipants(prev => prev.map(participant => {
        if (participant.isUser) return participant

        const peer = getPeerProfile(participant.peerId)
        if (!peer) return participant

        // Simulate progress based on AI peer personality
        let progressIncrease = 0
        let scoreIncrease = 0

        if (peer.personality === 'analytical') {
          // Alex: steady, methodical progress
          progressIncrease = Math.random() * 3
          scoreIncrease = Math.random() * 15
        } else if (peer.personality === 'curious') {
          // Sarah: bursts of progress with occasional setbacks
          progressIncrease = Math.random() * 5 - 1
          scoreIncrease = Math.random() * 25 - 5
        } else if (peer.personality === 'supportive') {
          // Jordan: consistent but slower progress
          progressIncrease = Math.random() * 2
          scoreIncrease = Math.random() * 10
        }

        const newProgress = Math.min(100, Math.max(0, participant.progress + progressIncrease))
        const newScore = Math.max(0, participant.score + scoreIncrease)
        const newTestsPassed = Math.floor((newProgress / 100) * participant.totalTests)

        return {
          ...participant,
          progress: newProgress,
          score: newScore,
          testsPasssed: newTestsPassed,
          timeElapsed: participant.timeElapsed + 5,
          trend: progressIncrease > 1 ? 'up' : progressIncrease < -0.5 ? 'down' : 'stable'
        }
      }))

      setTimeRemaining(prev => Math.max(0, prev - 5))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Sort participants by score
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score)
  
  // Update ranks
  useEffect(() => {
    setParticipants(prev => prev.map(participant => ({
      ...participant,
      rank: sortedParticipants.findIndex(p => p.id === participant.id) + 1
    })))
  }, [participants])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500'
      case 2: return 'text-gray-400'
      case 3: return 'text-amber-600'
      default: return 'text-gray-500'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
      default: return <div className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-300" />
            <div>
              <h3 className="text-white font-bold text-lg">Live Leaderboard</h3>
              <p className="text-purple-100 text-sm">Array Methods Challenge</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-white font-bold text-xl">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-purple-100 text-sm flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Time Remaining
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="p-4">
        <AnimatePresence>
          {sortedParticipants.map((participant, index) => (
            <motion.div
              key={participant.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-4 p-4 rounded-lg mb-3 border-2 transition-all duration-300 ${
                participant.isUser 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
            >
              {/* Rank */}
              <div className={`text-2xl font-bold ${getRankColor(participant.rank)} min-w-[2rem]`}>
                {participant.rank === 1 && <Trophy className="w-8 h-8 text-yellow-500" />}
                {participant.rank !== 1 && participant.rank}
              </div>

              {/* Avatar */}
              <div className="relative">
                {participant.isUser ? (
                  <Avatar 
                    peerId="sarah" 
                    size="md" 
                    showStatus 
                    status="online"
                    showPersonalityBadge
                    interactive
                    showTooltip
                    className="ring-2 ring-blue-400"
                  />
                ) : (
                  <Avatar 
                    peerId={participant.peerId} 
                    size="md" 
                    showStatus 
                    status="online"
                    showPersonalityBadge
                    interactive
                    showTooltip
                  />
                )}
                
                {/* Trend Indicator */}
                <div className="absolute -top-1 -right-1">
                  {getTrendIcon(participant.trend)}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {participant.name}
                  </span>
                  {participant.isUser && (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-medium">
                      You
                    </span>
                  )}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${participant.progress}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-2 rounded-full ${
                      participant.isUser 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                        : 'bg-gradient-to-r from-green-400 to-teal-500'
                    }`}
                  />
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {participant.testsPasssed}/{participant.totalTests} tests
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    {participant.score} pts
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(participant.timeElapsed)}
                  </span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {participant.score}
                </div>
                <div className="text-sm text-gray-500">points</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            🏆 Winner gets 500 bonus XP
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            💡 Accuracy matters more than speed
          </div>
        </div>
      </div>
    </div>
  )
}