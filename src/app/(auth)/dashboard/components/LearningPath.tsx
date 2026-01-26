/**
 * Learning Path Component
 * Displays user's learning journey with progress tracking
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ExternalLink, CheckCircle, Circle, Lock, ArrowRight } from 'lucide-react'
import type { KnowledgeGraphNode } from '@/types/database'

interface LearningPathProps {
  knowledgeGraph: KnowledgeGraphNode[]
  upcomingMilestones: {
    nextLevel: {
      current: number
      next: number
      xpNeeded: number
    }
    nextConcept: KnowledgeGraphNode | null
  }
}

export function LearningPath({ knowledgeGraph, upcomingMilestones }: LearningPathProps) {
  // Calculate overall progress
  const totalNodes = knowledgeGraph.length
  const completedNodes = knowledgeGraph.filter(node => node.status === 'mastered').length
  const progressPercentage = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0

  // Mock learning path data - in real app this would be structured from the knowledge graph
  const learningPath = {
    trackName: 'JavaScript Fundamentals Track',
    progress: Math.round(progressPercentage),
    lessons: [
      { id: 1, title: 'Variables & Data Types', status: 'completed' },
      { id: 2, title: 'Functions & Scope', status: 'completed' },
      { id: 3, title: 'Arrays & Objects', status: 'completed' },
      { id: 4, title: 'DOM Manipulation', status: 'in-progress' },
      { id: 5, title: 'Async JavaScript', status: 'locked' },
      { id: 6, title: 'ES6+ Features', status: 'locked' }
    ],
    nextMilestone: 'Complete 5 more lessons',
    reward: 'JavaScript Master Badge 🏆'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in-progress':
        return <Circle className="w-5 h-5 text-blue-500 animate-pulse" />
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-400" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'in-progress': return 'In Progress'
      case 'locked': return 'Locked'
      default: return 'Not Started'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400'
      case 'in-progress': return 'text-blue-600 dark:text-blue-400'
      case 'locked': return 'text-gray-500 dark:text-gray-400'
      default: return 'text-gray-500 dark:text-gray-400'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Your Learning Journey
          </CardTitle>
          <Button variant="ghost" size="sm">
            <ExternalLink className="w-4 h-4 mr-1" />
            View Full Path
          </Button>
        </div>
        <CardDescription>
          Track your progress through structured learning paths
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Track Overview */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {learningPath.trackName}
          </h3>
          <div className="flex items-center gap-3 mb-3">
            <Progress 
              value={learningPath.progress} 
              className="flex-1 h-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {learningPath.progress}% Complete
            </span>
          </div>
        </div>

        {/* Lesson List */}
        <div className="space-y-3 mb-6">
          {learningPath.lessons.map((lesson, index) => (
            <div 
              key={lesson.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {getStatusIcon(lesson.status)}
              <div className="flex-1">
                <span className="font-medium text-gray-900 dark:text-white">
                  {lesson.id}. {lesson.title}
                </span>
              </div>
              <span className={`text-sm ${getStatusColor(lesson.status)}`}>
                {getStatusText(lesson.status)}
              </span>
            </div>
          ))}
        </div>

        {/* Next Milestone */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Next Milestone: {learningPath.nextMilestone}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Reward: {learningPath.reward}
          </p>
        </div>

        {/* Continue Button */}
        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
          Continue Current Lesson
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}