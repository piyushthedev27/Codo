/**
 * Achievement System
 * 
 * Defines achievements, tracks progress, and handles unlock logic
 */

import type { EnhancedActivity } from './activity-tracker'
import type { UserProfile } from '@/types/database'

// Achievement definition
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'streak' | 'lessons' | 'challenges' | 'collaboration' | 'mastery' | 'special'
  requirement: {
    type: 'count' | 'streak' | 'milestone' | 'special'
    target: number
    metric: string
  }
  xpReward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  progress: number
  unlockedAt?: string
}

// Achievement definitions
export const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'progress' | 'unlockedAt'>[] = [
  // Streak achievements
  {
    id: 'streak-3',
    title: '3 Day Streak',
    description: 'Learn for 3 consecutive days',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'streak', target: 3, metric: 'days' },
    xpReward: 50,
    rarity: 'common'
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7 day learning streak',
    icon: '⚡',
    category: 'streak',
    requirement: { type: 'streak', target: 7, metric: 'days' },
    xpReward: 150,
    rarity: 'rare'
  },
  {
    id: 'streak-30',
    title: 'Monthly Master',
    description: 'Learn every day for 30 days',
    icon: '🏆',
    category: 'streak',
    requirement: { type: 'streak', target: 30, metric: 'days' },
    xpReward: 500,
    rarity: 'epic'
  },
  
  // Lesson achievements
  {
    id: 'lessons-5',
    title: 'Getting Started',
    description: 'Complete 5 lessons',
    icon: '📚',
    category: 'lessons',
    requirement: { type: 'count', target: 5, metric: 'lessons' },
    xpReward: 100,
    rarity: 'common'
  },
  {
    id: 'lessons-25',
    title: 'Knowledge Seeker',
    description: 'Complete 25 lessons',
    icon: '🎓',
    category: 'lessons',
    requirement: { type: 'count', target: 25, metric: 'lessons' },
    xpReward: 300,
    rarity: 'rare'
  },
  {
    id: 'lessons-100',
    title: 'Learning Legend',
    description: 'Complete 100 lessons',
    icon: '👑',
    category: 'lessons',
    requirement: { type: 'count', target: 100, metric: 'lessons' },
    xpReward: 1000,
    rarity: 'legendary'
  },
  
  // Challenge achievements
  {
    id: 'challenges-10',
    title: 'Problem Solver',
    description: 'Complete 10 coding challenges',
    icon: '💻',
    category: 'challenges',
    requirement: { type: 'count', target: 10, metric: 'challenges' },
    xpReward: 150,
    rarity: 'common'
  },
  {
    id: 'challenges-50',
    title: 'Code Warrior',
    description: 'Complete 50 coding challenges',
    icon: '⚔️',
    category: 'challenges',
    requirement: { type: 'count', target: 50, metric: 'challenges' },
    xpReward: 500,
    rarity: 'epic'
  },
  
  // Collaboration achievements
  {
    id: 'collab-5',
    title: 'Team Player',
    description: 'Complete 5 collaborative sessions',
    icon: '🤝',
    category: 'collaboration',
    requirement: { type: 'count', target: 5, metric: 'collaborations' },
    xpReward: 200,
    rarity: 'rare'
  },
  {
    id: 'collab-25',
    title: 'Collaboration Master',
    description: 'Complete 25 collaborative sessions',
    icon: '👥',
    category: 'collaboration',
    requirement: { type: 'count', target: 25, metric: 'collaborations' },
    xpReward: 600,
    rarity: 'epic'
  },
  
  // Mastery achievements
  {
    id: 'mastery-5',
    title: 'Skill Builder',
    description: 'Master 5 concepts',
    icon: '🎯',
    category: 'mastery',
    requirement: { type: 'count', target: 5, metric: 'mastered_concepts' },
    xpReward: 250,
    rarity: 'rare'
  },
  {
    id: 'mastery-20',
    title: 'Expert Developer',
    description: 'Master 20 concepts',
    icon: '🌟',
    category: 'mastery',
    requirement: { type: 'count', target: 20, metric: 'mastered_concepts' },
    xpReward: 800,
    rarity: 'epic'
  },
  
  // Special achievements
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎉',
    category: 'special',
    requirement: { type: 'milestone', target: 1, metric: 'first_lesson' },
    xpReward: 50,
    rarity: 'common'
  },
  {
    id: 'voice-coaching',
    title: 'Voice Learner',
    description: 'Use voice coaching for the first time',
    icon: '🎤',
    category: 'special',
    requirement: { type: 'milestone', target: 1, metric: 'first_voice' },
    xpReward: 75,
    rarity: 'common'
  },
  {
    id: 'peer-interaction',
    title: 'Social Learner',
    description: 'Interact with an AI peer',
    icon: '💬',
    category: 'special',
    requirement: { type: 'milestone', target: 1, metric: 'first_peer' },
    xpReward: 50,
    rarity: 'common'
  }
]

/**
 * Check if an achievement should be unlocked
 */
export function checkAchievementUnlock(
  achievement: Achievement,
  profile: UserProfile,
  activities: EnhancedActivity[]
): boolean {
  if (achievement.unlocked) return false
  
  const { requirement } = achievement
  
  switch (requirement.type) {
    case 'streak':
      return profile.learning_streak >= requirement.target
      
    case 'count':
      return getMetricCount(requirement.metric, activities) >= requirement.target
      
    case 'milestone':
      return checkMilestone(requirement.metric, activities)
      
    default:
      return false
  }
}

/**
 * Get count for a specific metric
 */
function getMetricCount(metric: string, activities: EnhancedActivity[]): number {
  switch (metric) {
    case 'lessons':
      return activities.filter(a => a.type === 'lesson_completed').length
      
    case 'challenges':
      return activities.filter(a => a.type === 'challenge_completed').length
      
    case 'collaborations':
      return activities.filter(a => a.type === 'collaboration').length
      
    case 'mastered_concepts':
      // This would come from knowledge graph data
      return 0
      
    default:
      return 0
  }
}

/**
 * Check if a milestone has been reached
 */
function checkMilestone(metric: string, activities: EnhancedActivity[]): boolean {
  switch (metric) {
    case 'first_lesson':
      return activities.some(a => a.type === 'lesson_completed')
      
    case 'first_voice':
      return activities.some(a => a.type === 'voice_coaching')
      
    case 'first_peer':
      return activities.some(a => a.type === 'peer_interaction')
      
    default:
      return false
  }
}

/**
 * Calculate progress towards an achievement
 */
export function calculateAchievementProgress(
  achievement: Achievement,
  profile: UserProfile,
  activities: EnhancedActivity[]
): number {
  const { requirement } = achievement
  
  let current = 0
  
  switch (requirement.type) {
    case 'streak':
      current = profile.learning_streak
      break
      
    case 'count':
      current = getMetricCount(requirement.metric, activities)
      break
      
    case 'milestone':
      current = checkMilestone(requirement.metric, activities) ? 1 : 0
      break
  }
  
  return Math.min(100, Math.round((current / requirement.target) * 100))
}

/**
 * Get all achievements with current progress
 */
export function getUserAchievements(
  profile: UserProfile,
  activities: EnhancedActivity[],
  unlockedAchievementIds: string[] = []
): Achievement[] {
  return ACHIEVEMENTS.map(achievement => {
    const unlocked = unlockedAchievementIds.includes(achievement.id)
    const progress = calculateAchievementProgress(
      { ...achievement, unlocked, progress: 0 },
      profile,
      activities
    )
    
    return {
      ...achievement,
      unlocked,
      progress,
      unlockedAt: unlocked ? new Date().toISOString() : undefined
    }
  })
}

/**
 * Get recently unlocked achievements
 */
export function getRecentlyUnlockedAchievements(
  achievements: Achievement[],
  hoursAgo: number = 24
): Achievement[] {
  const cutoffTime = new Date()
  cutoffTime.setHours(cutoffTime.getHours() - hoursAgo)
  
  return achievements.filter(achievement => {
    if (!achievement.unlocked || !achievement.unlockedAt) return false
    return new Date(achievement.unlockedAt) > cutoffTime
  })
}

/**
 * Get rarity color for achievement
 */
export function getRarityColor(rarity: Achievement['rarity']): string {
  const colors = {
    common: 'text-gray-600 dark:text-gray-400',
    rare: 'text-blue-600 dark:text-blue-400',
    epic: 'text-purple-600 dark:text-purple-400',
    legendary: 'text-yellow-600 dark:text-yellow-400'
  }
  
  return colors[rarity]
}

/**
 * Get rarity background color for achievement
 */
export function getRarityBgColor(rarity: Achievement['rarity']): string {
  const colors = {
    common: 'bg-gray-100 dark:bg-gray-800',
    rare: 'bg-blue-100 dark:bg-blue-900/30',
    epic: 'bg-purple-100 dark:bg-purple-900/30',
    legendary: 'bg-yellow-100 dark:bg-yellow-900/30'
  }
  
  return colors[rarity]
}
