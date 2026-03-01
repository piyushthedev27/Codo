/**
 * Hero Welcome Section Component
 * Displays personalized greeting with AI peer messages and quick stats
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { _Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/shared/Avatar'
import { ArrowRight, MessageCircle, Zap, Star, Trophy } from 'lucide-react'
import type { UserProfile, AIPeerProfile } from '@/types/database'
import '@/styles/dashboard-animations.css'

interface HeroWelcomeSectionProps {
  user?: {
    firstName?: string | null
  } | null
  profile: UserProfile
  _aiPeers: AIPeerProfile[]
  learningProgress: {
    percentage: number
    lessonsCompleted: number
    totalLessons: number
  }
  currentStreak: number
}

interface PeerMessage {
  peer: string
  message: string
  peerId: string
}

export function HeroWelcomeSection({
  user,
  profile,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _aiPeers,
  learningProgress,
  currentStreak
}: HeroWelcomeSectionProps) {
  const router = useRouter()
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  // AI peer motivational messages that rotate
  const peerMessages: PeerMessage[] = [
    {
      peer: 'Sarah',
      peerId: 'sarah',
      message: `Keep up the great work! You're ${learningProgress.percentage}% through your ${profile.primary_domain} fundamentals. I think you're ready for the next challenge!`
    },
    {
      peer: 'Alex',
      peerId: 'alex',
      message: "Your problem-solving approach is improving! Let's tackle some algorithm challenges together."
    },
    {
      peer: 'Jordan',
      peerId: 'jordan',
      message: "I've noticed you're getting better at debugging. Want to try a collaborative coding session?"
    }
  ]

  // Rotate messages every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % peerMessages.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [peerMessages.length])

  const currentPeerMessage = peerMessages[currentMessageIndex]

  // Mock achievements count - in real app this would come from API
  const achievementsCount = 5

  return (
    <div className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800 card-hover-effect fade-in">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left side - Greeting and AI Peer Message */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
            Welcome back, {user?.firstName || profile.first_name || 'Learner'}! 👋
          </h1>

          {/* AI Peer Message Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700 smooth-transition fade-in-delay-1">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              &quot;{currentPeerMessage.message}&quot;
            </p>
            <div className="flex items-center gap-3 smooth-transition">
              <Avatar peerId={currentPeerMessage.peerId} size="sm" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                - {currentPeerMessage.peer}
              </span>
            </div>
          </div>

          {/* Learning Progress Highlight */}
          <div className="mb-6 fade-in-delay-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Learning Progress
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 stat-number">
                {learningProgress.percentage}% Complete
              </span>
            </div>
            <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-3 progress-gradient rounded-full gpu-accelerated"
                style={{ width: `${learningProgress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {learningProgress.lessonsCompleted} of {learningProgress.totalLessons} lessons completed
            </p>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap gap-3 fade-in-delay-3">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl smooth-transition button-glow"
              onClick={() => router.push('/lessons')}
            >
              Continue Learning
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-purple-200 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900/20 smooth-transition"
              onClick={() => {
                const el = document.getElementById('ai-peers-section')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Talk to AI Peers
            </Button>
          </div>
        </div>

        {/* Right side - Quick Stats Bar */}
        <div className="flex lg:flex-col items-center gap-6 text-center lg:text-left fade-in-delay-4">
          {/* Streak */}
          <div className="flex items-center gap-2 smooth-transition card-hover-effect p-2 rounded-lg">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg icon-bounce">
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white stat-number">{currentStreak}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak 🔥</div>
            </div>
          </div>

          {/* XP Points */}
          <div className="flex items-center gap-2 smooth-transition card-hover-effect p-2 rounded-lg">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg icon-bounce">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white stat-number">{profile.current_xp}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">XP Points</div>
            </div>
          </div>

          {/* Achievements */}
          <div className="flex items-center gap-2 smooth-transition card-hover-effect p-2 rounded-lg">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg icon-bounce">
              <Trophy className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white stat-number">{achievementsCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}