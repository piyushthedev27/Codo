/**
 * Learning Path Data Integration
 * Connects with existing lesson and progress tracking systems
 * Implements milestone calculation and reward system
 */

import type { KnowledgeGraphNode } from '@/types/database'

export interface LearningTrack {
  id: string
  name: string
  description: string
  category: string
  totalLessons: number
  completedLessons: number
  progressPercentage: number
  estimatedTimeRemaining: number // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface LessonStatus {
  id: string
  title: string
  status: 'completed' | 'in_progress' | 'locked'
  duration: number // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  xpReward: number
  prerequisites: string[]
  completedAt?: Date
}

export interface Milestone {
  id: string
  title: string
  description: string
  progress: number // 0-100
  target: number // number of lessons or XP needed
  current: number // current progress toward target
  reward: MilestoneReward
  isCompleted: boolean
  completedAt?: Date
}

export interface MilestoneReward {
  type: 'xp' | 'badge' | 'unlock' | 'achievement'
  value: number | string
  description: string
  icon?: string
}

/**
 * Calculate current learning track from knowledge graph
 */
export function calculateLearningTrack(
  knowledgeGraph: KnowledgeGraphNode[],
  primaryDomain: string
): LearningTrack {
  const totalLessons = knowledgeGraph.length
  const completedLessons = knowledgeGraph.filter(node => node.status === 'mastered').length
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  
  // Calculate estimated time remaining
  const remainingNodes = knowledgeGraph.filter(node => node.status !== 'mastered')
  const estimatedTimeRemaining = remainingNodes.reduce(
    (total, node) => total + (node.estimated_duration_minutes || 30),
    0
  )

  // Determine track difficulty based on average node difficulty
  const avgDifficulty = knowledgeGraph.reduce((sum, node) => sum + (node.difficulty_level || 1), 0) / totalLessons
  const difficulty: 'beginner' | 'intermediate' | 'advanced' = 
    avgDifficulty < 2 ? 'beginner' : avgDifficulty < 3 ? 'intermediate' : 'advanced'

  return {
    id: `track-${primaryDomain}`,
    name: `${formatDomainName(primaryDomain)} Fundamentals Track`,
    description: `Master the fundamentals of ${formatDomainName(primaryDomain)}`,
    category: primaryDomain,
    totalLessons,
    completedLessons,
    progressPercentage,
    estimatedTimeRemaining,
    difficulty
  }
}

/**
 * Convert knowledge graph nodes to lesson status list
 */
export function convertNodesToLessons(
  knowledgeGraph: KnowledgeGraphNode[]
): LessonStatus[] {
  return knowledgeGraph.map(node => ({
    id: node.id,
    title: node.concept,
    status: node.status === 'mastered' ? 'completed' : 
            node.status === 'in_progress' ? 'in_progress' : 'locked',
    duration: node.estimated_duration_minutes || 30,
    difficulty: node.difficulty_level === 1 ? 'beginner' :
                node.difficulty_level === 2 ? 'intermediate' : 'advanced',
    xpReward: calculateXPReward(node.difficulty_level || 1),
    prerequisites: node.prerequisites || [],
    completedAt: node.status === 'mastered' ? new Date(node.updated_at) : undefined
  }))
}

/**
 * Get next 5-6 lessons to display in learning path
 */
export function getUpcomingLessons(
  lessons: LessonStatus[],
  maxCount: number = 6
): LessonStatus[] {
  // Find the first in-progress lesson or the first locked lesson
  const inProgressIndex = lessons.findIndex(l => l.status === 'in_progress')
  const firstLockedIndex = lessons.findIndex(l => l.status === 'locked')
  
  const startIndex = inProgressIndex >= 0 ? inProgressIndex : 
                     firstLockedIndex >= 0 ? Math.max(0, firstLockedIndex - 2) : 
                     Math.max(0, lessons.length - maxCount)
  
  return lessons.slice(startIndex, startIndex + maxCount)
}

/**
 * Calculate milestone progress and rewards
 */
export function calculateMilestones(
  track: LearningTrack,
  currentXP: number,
  currentLevel: number
): Milestone[] {
  const milestones: Milestone[] = []

  // Milestone 1: Complete 25% of track
  const milestone25 = {
    id: 'milestone-25',
    title: 'Quarter Way There!',
    description: 'Complete 25% of your learning track',
    progress: Math.min(100, (track.progressPercentage / 25) * 100),
    target: Math.ceil(track.totalLessons * 0.25),
    current: track.completedLessons,
    reward: {
      type: 'xp' as const,
      value: 100,
      description: '+100 XP Bonus',
      icon: '⭐'
    },
    isCompleted: track.progressPercentage >= 25,
    completedAt: track.progressPercentage >= 25 ? new Date() : undefined
  }
  if (track.progressPercentage < 50) {
    milestones.push(milestone25)
  }

  // Milestone 2: Complete 50% of track
  const milestone50 = {
    id: 'milestone-50',
    title: 'Halfway Champion!',
    description: 'Complete 50% of your learning track',
    progress: Math.min(100, (track.progressPercentage / 50) * 100),
    target: Math.ceil(track.totalLessons * 0.5),
    current: track.completedLessons,
    reward: {
      type: 'badge' as const,
      value: 'Halfway Hero Badge',
      description: 'Unlock Halfway Hero Badge',
      icon: '🏅'
    },
    isCompleted: track.progressPercentage >= 50,
    completedAt: track.progressPercentage >= 50 ? new Date() : undefined
  }
  if (track.progressPercentage >= 25 && track.progressPercentage < 75) {
    milestones.push(milestone50)
  }

  // Milestone 3: Complete 75% of track
  const milestone75 = {
    id: 'milestone-75',
    title: 'Almost There!',
    description: 'Complete 75% of your learning track',
    progress: Math.min(100, (track.progressPercentage / 75) * 100),
    target: Math.ceil(track.totalLessons * 0.75),
    current: track.completedLessons,
    reward: {
      type: 'unlock' as const,
      value: 'Advanced Topics',
      description: 'Unlock Advanced Topics',
      icon: '🔓'
    },
    isCompleted: track.progressPercentage >= 75,
    completedAt: track.progressPercentage >= 75 ? new Date() : undefined
  }
  if (track.progressPercentage >= 50 && track.progressPercentage < 100) {
    milestones.push(milestone75)
  }

  // Milestone 4: Complete 100% of track
  const milestone100 = {
    id: 'milestone-100',
    title: 'Track Master!',
    description: 'Complete your entire learning track',
    progress: track.progressPercentage,
    target: track.totalLessons,
    current: track.completedLessons,
    reward: {
      type: 'achievement' as const,
      value: `${track.name} Master`,
      description: `Earn ${track.name} Master Achievement`,
      icon: '🏆'
    },
    isCompleted: track.progressPercentage >= 100,
    completedAt: track.progressPercentage >= 100 ? new Date() : undefined
  }
  if (track.progressPercentage >= 75) {
    milestones.push(milestone100)
  }

  // Level up milestone
  const xpToNextLevel = 1000 - (currentXP % 1000)
  const levelMilestone = {
    id: 'milestone-level',
    title: `Reach Level ${currentLevel + 1}`,
    description: `Earn ${xpToNextLevel} more XP to level up`,
    progress: Math.round(((currentXP % 1000) / 1000) * 100),
    target: 1000,
    current: currentXP % 1000,
    reward: {
      type: 'xp' as const,
      value: 500,
      description: '+500 XP Level Bonus',
      icon: '⚡'
    },
    isCompleted: false
  }
  milestones.push(levelMilestone)

  return milestones
}

/**
 * Get the next milestone to display
 */
export function getNextMilestone(milestones: Milestone[]): Milestone | null {
  // Find the first incomplete milestone
  const nextMilestone = milestones.find(m => !m.isCompleted)
  return nextMilestone || null
}

/**
 * Calculate XP reward based on difficulty
 */
function calculateXPReward(difficulty: number): number {
  const baseXP = 50
  return baseXP * difficulty
}

/**
 * Format domain name for display
 */
function formatDomainName(domain: string): string {
  const domainMap: Record<string, string> = {
    'javascript': 'JavaScript',
    'python': 'Python',
    'java': 'Java',
    'web-development': 'Web Development',
    'react': 'React',
    'nodejs': 'Node.js',
    'typescript': 'TypeScript',
    'data-structures': 'Data Structures',
    'algorithms': 'Algorithms'
  }
  return domainMap[domain] || domain.charAt(0).toUpperCase() + domain.slice(1)
}

/**
 * Get lesson status icon emoji
 */
export function getLessonStatusIcon(status: 'completed' | 'in_progress' | 'locked'): string {
  switch (status) {
    case 'completed':
      return '✅'
    case 'in_progress':
      return '🔵'
    case 'locked':
      return '⚪'
    default:
      return '⚪'
  }
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

/**
 * Calculate progress percentage for a specific lesson
 */
export function calculateLessonProgress(
  lesson: LessonStatus,
  knowledgeGraph: KnowledgeGraphNode[]
): number {
  const node = knowledgeGraph.find(n => n.id === lesson.id)
  return node?.mastery_percentage || 0
}
