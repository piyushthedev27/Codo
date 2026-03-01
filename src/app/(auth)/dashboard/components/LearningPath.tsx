/**
 * Learning Path Component
 * Displays user's learning journey with progress tracking
 * Enhanced with milestone tracking and celebration system
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, CheckCircle, Circle, Lock, ArrowRight, Trophy, Sparkles, Target } from 'lucide-react'
import type { KnowledgeGraphNode } from '@/types/database'
import {
  calculateLearningTrack,
  convertNodesToLessons,
  getUpcomingLessons,
  calculateMilestones,
  getNextMilestone,
  getLessonStatusIcon,
  formatDuration
} from '@/lib/utils/learning-path-integration'
import { formatMilestoneReward } from '@/lib/utils/milestone-system'
import '@/styles/dashboard-animations.css'

interface LearningPathProps {
  knowledgeGraph: KnowledgeGraphNode[]
  _upcomingMilestones: {
    nextLevel: {
      current: number
      next: number
      xpNeeded: number
    }
    nextConcept: KnowledgeGraphNode | null
  }
  primaryDomain?: string
  currentXP?: number
  currentLevel?: number
}

export function LearningPath({
  knowledgeGraph,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _upcomingMilestones,
  primaryDomain = 'javascript',
  currentXP = 350,
  currentLevel = 1
}: LearningPathProps) {
  // Calculate learning track from knowledge graph
  const track = calculateLearningTrack(knowledgeGraph, primaryDomain)

  // Convert knowledge graph nodes to lesson status
  const allLessons = convertNodesToLessons(knowledgeGraph)

  // Get next 5-6 lessons to display
  const upcomingLessons = getUpcomingLessons(allLessons, 6)

  // Calculate milestones
  const milestones = calculateMilestones(track, currentXP, currentLevel)

  // Get next milestone to display
  const nextMilestone = getNextMilestone(milestones)

  const getStatusIcon = (status: 'completed' | 'in_progress' | 'locked') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
      case 'in_progress':
        return <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse flex-shrink-0" />
      case 'locked':
        return <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
      default:
        return <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
    }
  }

  const getStatusColor = (status: 'completed' | 'in_progress' | 'locked') => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400'
      case 'in_progress': return 'text-blue-600 dark:text-blue-400'
      case 'locked': return 'text-gray-500 dark:text-gray-400'
      default: return 'text-gray-500 dark:text-gray-400'
    }
  }

  const getDifficultyBadge = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    const colors = {
      beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
    return (
      <Badge variant="secondary" className={`text-xs ${colors[difficulty]}`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </Badge>
    )
  }

  return (
    <Card className="fade-in-delay-3">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">Your Learning Journey</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs sm:text-sm"
            onClick={() => window.location.href = '/learning-path'}
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">View Full Path</span>
          </Button>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          Track your progress through structured learning paths
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {/* Track Overview */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base truncate">
                {track.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {track.completedLessons} of {track.totalLessons} lessons • {formatDuration(track.estimatedTimeRemaining)} remaining
              </p>
            </div>
            {getDifficultyBadge(track.difficulty)}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="relative flex-1 h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full progress-gradient rounded-full gpu-accelerated smooth-transition"
                style={{ width: `${track.progressPercentage}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 stat-number whitespace-nowrap">
              {track.progressPercentage}%
            </span>
          </div>
        </div>

        {/* Lesson List */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upcoming Lessons
          </h4>
          {upcomingLessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 smooth-transition card-hover-effect fade-in-delay-${Math.min(index + 1, 4)} touch-manipulation ${lesson.status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              onClick={() => {
                if (lesson.status === 'locked') {
                  alert('This lesson is locked. Complete previous lessons first!')
                  return
                }
                // For now, redirect to lessons page since individual lessons don't exist yet
                window.location.href = '/lessons'
              }}
            >
              <div className="flex-shrink-0">
                {getStatusIcon(lesson.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                    {lesson.title}
                  </span>
                  <span className={`text-xs ${getStatusColor(lesson.status)} whitespace-nowrap hidden sm:inline`}>
                    {getLessonStatusIcon(lesson.status)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span>{formatDuration(lesson.duration)}</span>
                  <span>•</span>
                  <span>+{lesson.xpReward} XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-blue-100 dark:border-blue-800 smooth-transition card-hover-effect">
            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                  Next Milestone: {nextMilestone.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {nextMilestone.description}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={nextMilestone.progress} className="flex-1 h-1.5 sm:h-2" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {nextMilestone.current}/{nextMilestone.target}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Reward: {formatMilestoneReward(nextMilestone.reward)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <Button
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white smooth-transition button-glow touch-manipulation min-h-[44px]"
          onClick={() => {
            // Redirect to lessons page to browse available lessons
            window.location.href = '/lessons'
          }}
        >
          Browse Available Lessons
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}