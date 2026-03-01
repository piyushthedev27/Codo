/**
 * Victory Celebration Component
 * Shows celebration modal when user completes a code duel
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Zap, Clock, Target, X, Share2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface VictoryCelebrationProps {
  score: number
  rank: number
  timeElapsed: number
  onClose: () => void
}

export function VictoryCelebration({ score, rank, timeElapsed, onClose }: VictoryCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(true)
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    // Animation sequence
    const phases = [
      () => setAnimationPhase(1), // Trophy animation
      () => setAnimationPhase(2), // Stats reveal
      () => setAnimationPhase(3), // Final celebration
    ]

    phases.forEach((phase, index) => {
      setTimeout(phase, (index + 1) * 800)
    })

    // Hide confetti after 3 seconds
    setTimeout(() => setShowConfetti(false), 3000)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getRankMessage = (rank: number) => {
    switch (rank) {
      case 1: return { message: "🏆 VICTORY!", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" }
      case 2: return { message: "🥈 Great Job!", color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-900/20" }
      case 3: return { message: "🥉 Well Done!", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" }
      default: return { message: "💪 Good Effort!", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" }
    }
  }

  const rankInfo = getRankMessage(rank)

  const getScoreRating = (score: number) => {
    if (score >= 90) return { rating: "Perfect!", color: "text-green-500", stars: 5 }
    if (score >= 75) return { rating: "Excellent!", color: "text-blue-500", stars: 4 }
    if (score >= 60) return { rating: "Good!", color: "text-yellow-500", stars: 3 }
    if (score >= 40) return { rating: "Fair", color: "text-orange-500", stars: 2 }
    return { rating: "Keep Trying!", color: "text-red-500", stars: 1 }
  }

  const scoreInfo = getScoreRating(score)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  // eslint-disable-next-line react-hooks/purity
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                  scale: 0
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 360,
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 3,
                  // eslint-disable-next-line react-hooks/purity
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
                className={`absolute w-3 h-3 ${['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 5]
                  } rounded-full`}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="relative overflow-hidden">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 z-10"
            >
              <X className="w-4 h-4" />
            </Button>

            <CardContent className="p-8 text-center">
              {/* Trophy Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={animationPhase >= 1 ? { scale: 1, rotate: 0 } : {}}
                transition={{ type: "spring", duration: 0.8 }}
                className="mb-6"
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${rankInfo.bg} mb-4`}>
                  <Trophy className={`w-12 h-12 ${rankInfo.color}`} />
                </div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={animationPhase >= 1 ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 }}
                  className={`text-3xl font-bold ${rankInfo.color} mb-2`}
                >
                  {rankInfo.message}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={animationPhase >= 1 ? { opacity: 1 } : {}}
                  transition={{ delay: 0.5 }}
                  className="text-gray-600 dark:text-gray-400"
                >
                  You finished in #{rank} place!
                </motion.p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={animationPhase >= 2 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
                className="space-y-4 mb-6"
              >
                {/* Score */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold">Final Score</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {score} points
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < scoreInfo.stars
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                          }`}
                      />
                    ))}
                  </div>
                  <Badge className={`${scoreInfo.color} bg-transparent border-current`}>
                    {scoreInfo.rating}
                  </Badge>
                </div>

                {/* Time and Accuracy */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Time
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatTime(timeElapsed)}
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <Target className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">
                      Accuracy
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {Math.round((score / 100) * 100)}%
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* XP Reward */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={animationPhase >= 3 ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 mb-6"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">XP Earned</span>
                </div>
                <div className="text-2xl font-bold">
                  +{score + (rank === 1 ? 100 : rank === 2 ? 50 : rank === 3 ? 25 : 10)} XP
                </div>
                <div className="text-sm opacity-90">
                  {rank === 1 && "🏆 Victory Bonus: +100 XP"}
                  {rank === 2 && "🥈 Runner-up Bonus: +50 XP"}
                  {rank === 3 && "🥉 Third Place Bonus: +25 XP"}
                  {rank > 3 && "💪 Participation Bonus: +10 XP"}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={animationPhase >= 3 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 }}
                className="flex gap-3"
              >
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}