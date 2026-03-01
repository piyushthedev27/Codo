/**
 * Activity Tracking and Management System
 * 
 * Handles activity event tracking, XP calculation, and activity history management
 */

import type { ActivityCategory } from './activity-types'
import type { LearningActivity } from '@/types/database'

// Enhanced activity interface for dashboard display
export interface EnhancedActivity {
  id: string
  type: ActivityCategory
  title: string
  description: string
  xpEarned: number
  timestamp: string
  peerInvolved?: string[]
  duration?: number
  metadata?: {
    difficulty?: string
    completionRate?: number
    mistakesCorrected?: number
    collaborators?: string[]
    celebrationShown?: boolean
  }
}

// XP multipliers for different activity types
const XP_BASE_VALUES: Record<ActivityCategory, number> = {
  lesson_completed: 100,
  achievement: 150,
  collaboration: 200,
  practice: 50,
  voice_coaching: 75,
  peer_interaction: 25,
  milestone: 300,
  challenge_completed: 150
}

// Bonus multipliers
const STREAK_BONUS_MULTIPLIER = 0.1 // 10% bonus per streak day
const QUALITY_BONUS_MULTIPLIER = 0.5 // Up to 50% bonus for high quality
const COLLABORATION_BONUS = 50 // Flat bonus for collaboration

/**
 * Calculate XP for an activity with bonuses
 */
export function calculateActivityXP(
  activityType: ActivityCategory,
  options: {
    streakDays?: number
    qualityScore?: number // 0-1
    hasCollaboration?: boolean
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
  } = {}
): number {
  const baseXP = XP_BASE_VALUES[activityType] || 50

  // Difficulty multiplier
  const difficultyMultiplier = {
    beginner: 1.0,
    intermediate: 1.5,
    advanced: 2.0
  }[options.difficulty || 'beginner']

  let totalXP = baseXP * difficultyMultiplier

  // Streak bonus
  if (options.streakDays && options.streakDays > 0) {
    const streakBonus = Math.min(options.streakDays * STREAK_BONUS_MULTIPLIER, 1.0) // Cap at 100%
    totalXP += baseXP * streakBonus
  }

  // Quality bonus
  if (options.qualityScore && options.qualityScore > 0.7) {
    const qualityBonus = (options.qualityScore - 0.7) * QUALITY_BONUS_MULTIPLIER
    totalXP += baseXP * qualityBonus
  }

  // Collaboration bonus
  if (options.hasCollaboration) {
    totalXP += COLLABORATION_BONUS
  }

  return Math.round(totalXP)
}

/**
 * Create an enhanced activity from a learning activity
 */
export function createEnhancedActivity(
  activity: Partial<LearningActivity> & {
    id: string
    activity_type?: string
    type?: ActivityCategory
  }
): EnhancedActivity {
  const activityType = (activity.type || mapActivityType(activity.activity_type)) as ActivityCategory

  return {
    id: activity.id,
    type: activityType,
    title: activity.title || generateActivityTitle(activityType),
    description: activity.description || generateActivityDescription(activityType),
    xpEarned: activity.xp_earned || 0,
    timestamp: formatTimestamp(activity.created_at || new Date().toISOString()),
    peerInvolved: extractPeerIds(activity),
    duration: activity.duration_minutes,
    metadata: {
      difficulty: extractDifficulty(activity),
      completionRate: activity.completion_percentage,
      mistakesCorrected: activity.mistakes_made,
      celebrationShown: false
    }
  }
}

/**
 * Map database activity type to display category
 */
function mapActivityType(dbType?: string): ActivityCategory {
  const mapping: Record<string, ActivityCategory> = {
    'lesson': 'lesson_completed',
    'challenge': 'challenge_completed',
    'voice_coaching': 'voice_coaching',
    'collaborative_coding': 'collaboration',
    'mistake_analysis': 'practice'
  }

  return mapping[dbType || ''] || 'practice'
}

/**
 * Generate activity title based on type
 */
function generateActivityTitle(type: ActivityCategory): string {
  const titles: Record<ActivityCategory, string> = {
    lesson_completed: 'Completed Lesson',
    achievement: 'Achievement Unlocked',
    collaboration: 'Collaborative Session',
    practice: 'Practice Session',
    voice_coaching: 'Voice Coaching Session',
    peer_interaction: 'Peer Interaction',
    milestone: 'Milestone Reached',
    challenge_completed: 'Challenge Completed'
  }

  return titles[type] || 'Activity Completed'
}

/**
 * Generate activity description based on type
 */
function generateActivityDescription(type: ActivityCategory): string {
  const descriptions: Record<ActivityCategory, string> = {
    lesson_completed: 'Successfully completed a learning lesson',
    achievement: 'Earned a new achievement badge',
    collaboration: 'Worked together with AI peers',
    practice: 'Practiced coding skills',
    voice_coaching: 'Used voice coaching for guidance',
    peer_interaction: 'Interacted with AI study buddy',
    milestone: 'Reached an important milestone',
    challenge_completed: 'Successfully solved a coding challenge'
  }

  return descriptions[type] || 'Completed an activity'
}

/**
 * Extract peer IDs from activity metadata
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPeerIds(activity: any): string[] | undefined {
  if (activity.peer_interactions_count && activity.peer_interactions_count > 0) {
    // Extract from metadata if available
    if (activity.metadata?.peers) {
      return Array.isArray(activity.metadata.peers)
        ? activity.metadata.peers
        : [activity.metadata.peers]
    }
  }
  return undefined
}

/**
 * Extract difficulty from activity metadata
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractDifficulty(activity: any): string | undefined {
  return activity.metadata?.difficulty || activity.difficulty_level
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return date.toLocaleDateString()
}

/**
 * Sort activities by priority and timestamp
 */
export function sortActivities(activities: EnhancedActivity[]): EnhancedActivity[] {
  return [...activities].sort((a, b) => {
    // First sort by timestamp (most recent first)
    const timeA = new Date(a.timestamp).getTime()
    const timeB = new Date(b.timestamp).getTime()

    return timeB - timeA
  })
}

/**
 * Group activities by date
 */
export function groupActivitiesByDate(activities: EnhancedActivity[]): Record<string, EnhancedActivity[]> {
  const groups: Record<string, EnhancedActivity[]> = {}

  activities.forEach(activity => {
    const date = new Date(activity.timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let groupKey: string
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday'
    } else {
      groupKey = date.toLocaleDateString()
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(activity)
  })

  return groups
}
