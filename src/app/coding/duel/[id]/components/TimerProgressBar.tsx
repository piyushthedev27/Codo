/**
 * Timer Progress Bar Component
 * Enhanced timer and progress visualization for code duels
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertTriangle, Zap, Target, TrendingUp } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface TimerProgressBarProps {
  timeRemaining: number
  totalTime: number
  userProgress: number
  userScore: number
  duelState: 'waiting' | 'active' | 'completed'
  testsPasssed: number
  totalTests: number
}

export function TimerProgressBar({
  timeRemaining,
  totalTime,
  userProgress,
  userScore,
  duelState,
  testsPasssed,
  totalTests
}: TimerProgressBarProps) {
  const [timeWarning, setTimeWarning] = useState(false)
  const [progressTrend, setProgressTrend] = useState<'up' | 'down' | 'stable'>('stable')
  const [lastProgress, setLastProgress] = useState(userProgress)

  // Calculate time percentage
  const timePercentage = (timeRemaining / totalTime) * 100

  // Time warning when less than 2 minutes
  useEffect(() => {
    setTimeWarning(timeRemaining <= 120 && timeRemaining > 0)
  }, [timeRemaining])

  // Track progress trend
  useEffect(() => {
    if (userProgress > lastProgress) {
      setProgressTrend('up')
    } else if (userProgress < lastProgress) {
      setProgressTrend('down')
    } else {
      setProgressTrend('stable')
    }
    setLastProgress(userProgress)
  }, [userProgress, lastProgress])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeRemaining <= 30) return 'text-red-500'
    if (timeRemaining <= 120) return 'text-orange-500'
    return 'text-blue-600'
  }

  const getProgressColor = () => {
    if (userProgress >= 80) return 'bg-green-500'
    if (userProgress >= 50) return 'bg-blue-500'
    if (userProgress >= 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getTrendIcon = () => {
    switch (progressTrend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
      default: return null
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Duel Progress
        </h3>
        <Badge variant={duelState === 'active' ? 'default' : 'secondary'}>
          {duelState === 'active' ? 'Live' : duelState === 'completed' ? 'Finished' : 'Ready'}
        </Badge>
      </div>

      {/* Timer Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${getTimeColor()}`} />
            <span className="font-medium text-gray-700 dark:text-gray-300">Time Remaining</span>
            {timeWarning && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </motion.div>
            )}
          </div>
          <div className={`text-2xl font-bold ${getTimeColor()}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Time Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${timePercentage}%` }}
              transition={{ duration: 0.5 }}
              className={`h-3 rounded-full transition-colors duration-300 ${
                timeRemaining <= 30 
                  ? 'bg-red-500' 
                  : timeRemaining <= 120 
                  ? 'bg-orange-500' 
                  : 'bg-blue-500'
              }`}
            />
          </div>
          {timeWarning && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute inset-0 bg-red-500/20 rounded-full"
            />
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Challenge Progress</span>
            {getTrendIcon()}
          </div>
          <div className="text-2xl font-bold text-green-600">
            {Math.round(userProgress)}%
          </div>
        </div>

        {/* Challenge Progress Bar */}
        <div className="relative mb-2">
          <Progress 
            value={userProgress} 
            className="h-4"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${userProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute top-0 left-0 h-4 rounded-full ${getProgressColor()} opacity-80`}
          />
        </div>

        {/* Tests Progress */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Tests Passed: {testsPasssed}/{totalTests}</span>
          <span>{testsPasssed > 0 ? `${Math.round((testsPasssed / totalTests) * 100)}%` : '0%'}</span>
        </div>
      </div>

      {/* Score Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Current Score</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {userScore}
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-blue-700 dark:text-blue-300 font-medium">Base Score</div>
            <div className="text-blue-600 font-bold">{Math.round(userScore * 0.8)}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-green-700 dark:text-green-300 font-medium">Time Bonus</div>
            <div className="text-green-600 font-bold">+{Math.round(userScore * 0.2)}</div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Speed</div>
          <div className="font-bold text-gray-900 dark:text-white">
            {timeRemaining > 0 ? Math.round(((totalTime - timeRemaining) / totalTime) * 100) : 100}%
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Accuracy</div>
          <div className="font-bold text-gray-900 dark:text-white">
            {totalTests > 0 ? Math.round((testsPasssed / totalTests) * 100) : 0}%
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Efficiency</div>
          <div className="font-bold text-gray-900 dark:text-white">
            {userProgress > 0 && timeRemaining < totalTime 
              ? Math.round((userProgress / ((totalTime - timeRemaining) / totalTime)) / 100 * 100)
              : 0}%
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {duelState === 'active' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
        >
          <div className="text-sm text-blue-700 dark:text-blue-300">
            {timeWarning && "⚠️ Time running low! Focus on completing tests."}
            {!timeWarning && userProgress < 25 && "💡 Take your time to understand the problem."}
            {!timeWarning && userProgress >= 25 && userProgress < 75 && "🚀 Great progress! Keep going."}
            {!timeWarning && userProgress >= 75 && "🔥 Almost there! Finish strong."}
          </div>
        </motion.div>
      )}
    </div>
  )
}