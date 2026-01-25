'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Clock, Zap, Target, Play, Pause, RotateCcw } from 'lucide-react'
import { LiveLeaderboard } from './components/LiveLeaderboard'
import { CodeDuelArena } from './components/CodeDuelArena'
import { VictoryCelebration } from './components/VictoryCelebration'
import { TimerProgressBar } from './components/TimerProgressBar'
import { CelebrationEffects, useCelebration, playVictorySound, playAchievementSound } from './components/CelebrationEffects'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface CodeDuelPageProps {
  params: {
    id: string
  }
}

export default function CodeDuelPage({ params }: CodeDuelPageProps) {
  const [duelState, setDuelState] = useState<'waiting' | 'active' | 'completed'>('waiting')
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes
  const [userProgress, setUserProgress] = useState(0)
  const [showVictory, setShowVictory] = useState(false)
  const [userScore, setUserScore] = useState(0)
  const [testsPasssed, setTestsPasssed] = useState(0)
  const [totalTests] = useState(8)
  const [userRank, setUserRank] = useState(1)
  const { celebration, triggerCelebration } = useCelebration()
  const [lastMilestone, setLastMilestone] = useState(0)

  // Timer logic
  useEffect(() => {
    if (duelState === 'active' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setDuelState('completed')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [duelState, timeRemaining])

  const startDuel = () => {
    setDuelState('active')
    setTimeRemaining(600)
    setUserProgress(0)
    setUserScore(0)
    setShowVictory(false)
  }

  const pauseDuel = () => {
    setDuelState('waiting')
  }

  const resetDuel = () => {
    setDuelState('waiting')
    setTimeRemaining(600)
    setUserProgress(0)
    setUserScore(0)
    setShowVictory(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressUpdate = (progress: number, score: number, tests?: number) => {
    const prevProgress = userProgress
    setUserProgress(progress)
    setUserScore(score)
    if (tests !== undefined) {
      setTestsPasssed(tests)
    }
    
    // Trigger milestone celebrations
    const milestones = [25, 50, 75, 100]
    const currentMilestone = milestones.find(m => progress >= m && prevProgress < m)
    
    if (currentMilestone && currentMilestone > lastMilestone) {
      setLastMilestone(currentMilestone)
      
      if (currentMilestone === 100) {
        // Victory celebration
        triggerCelebration('victory', 'high', 4000)
        playVictorySound()
        setDuelState('completed')
        setShowVictory(true)
      } else {
        // Milestone celebration
        triggerCelebration('milestone', 'medium', 2000)
        playAchievementSound()
      }
    }
    
    // Perfect score celebration
    if (score === 100 && tests === totalTests) {
      triggerCelebration('perfect', 'high', 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Code Duel Arena
            </h1>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Challenge: Array Methods Mastery - Duel #{params.id}
          </p>

          {/* Status Bar */}
          <Card className="max-w-4xl mx-auto mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Timer */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Time</span>
                  </div>
                  <div className={`text-2xl font-bold ${
                    timeRemaining < 60 ? 'text-red-500' : 'text-blue-600'
                  }`}>
                    {formatTime(timeRemaining)}
                  </div>
                </div>

                {/* Progress */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-green-500" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Progress</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(userProgress)}%
                  </div>
                  <Progress value={userProgress} className="mt-2" />
                </div>

                {/* Score */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Score</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {userScore}
                  </div>
                </div>

                {/* Rank */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-purple-500" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Rank</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    #{userRank}
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4 mt-6">
                {duelState === 'waiting' && (
                  <Button onClick={startDuel} size="lg" className="bg-green-600 hover:bg-green-700">
                    <Play className="w-5 h-5 mr-2" />
                    Start Duel
                  </Button>
                )}
                
                {duelState === 'active' && (
                  <Button onClick={pauseDuel} size="lg" variant="outline">
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                )}
                
                <Button onClick={resetDuel} size="lg" variant="outline">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Code Arena */}
          <div className="lg:col-span-2">
            <CodeDuelArena
              duelState={duelState}
              onProgressUpdate={handleProgressUpdate}
              timeRemaining={timeRemaining}
            />
          </div>

          {/* Timer and Progress */}
          <div className="lg:col-span-1">
            <TimerProgressBar
              timeRemaining={timeRemaining}
              totalTime={600}
              userProgress={userProgress}
              userScore={userScore}
              duelState={duelState}
              testsPasssed={testsPasssed}
              totalTests={totalTests}
            />
          </div>

          {/* Live Leaderboard */}
          <div className="lg:col-span-1">
            <LiveLeaderboard />
          </div>
        </div>

        {/* Victory Celebration Modal */}
        {showVictory && (
          <VictoryCelebration
            score={userScore}
            rank={userRank}
            timeElapsed={600 - timeRemaining}
            onClose={() => setShowVictory(false)}
          />
        )}

        {/* Celebration Effects */}
        <CelebrationEffects
          show={celebration.show}
          type={celebration.type}
          intensity={celebration.intensity}
        />
      </div>
    </div>
  )
}