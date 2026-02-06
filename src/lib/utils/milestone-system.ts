/**
 * Milestone Tracking and Celebration System
 * Handles milestone definitions, progress tracking, rewards, and celebrations
 */

import type { Milestone, MilestoneReward } from './learning-path-integration'

export interface MilestoneDefinition {
  id: string
  type: 'track_progress' | 'level_up' | 'streak' | 'skill_mastery' | 'challenge_completion'
  title: string
  description: string
  criteria: MilestoneCriteria
  reward: MilestoneReward
  celebrationStyle: 'confetti' | 'badge' | 'animation' | 'notification'
}

export interface MilestoneCriteria {
  metric: string
  threshold: number
  comparison: 'gte' | 'lte' | 'eq'
}

export interface MilestoneProgress {
  milestoneId: string
  userId: string
  currentValue: number
  targetValue: number
  progressPercentage: number
  isCompleted: boolean
  completedAt?: Date
  rewardClaimed: boolean
}

export interface CelebrationEvent {
  id: string
  milestoneId: string
  userId: string
  title: string
  message: string
  reward: MilestoneReward
  celebrationStyle: string
  timestamp: Date
  dismissed: boolean
}

/**
 * Predefined milestone definitions
 */
export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  // Track Progress Milestones
  {
    id: 'track-25',
    type: 'track_progress',
    title: 'Quarter Way There!',
    description: 'Complete 25% of your learning track',
    criteria: {
      metric: 'track_progress_percentage',
      threshold: 25,
      comparison: 'gte'
    },
    reward: {
      type: 'xp',
      value: 100,
      description: '+100 XP Bonus',
      icon: '⭐'
    },
    celebrationStyle: 'notification'
  },
  {
    id: 'track-50',
    type: 'track_progress',
    title: 'Halfway Champion!',
    description: 'Complete 50% of your learning track',
    criteria: {
      metric: 'track_progress_percentage',
      threshold: 50,
      comparison: 'gte'
    },
    reward: {
      type: 'badge',
      value: 'Halfway Hero',
      description: 'Unlock Halfway Hero Badge',
      icon: '🏅'
    },
    celebrationStyle: 'badge'
  },
  {
    id: 'track-75',
    type: 'track_progress',
    title: 'Almost There!',
    description: 'Complete 75% of your learning track',
    criteria: {
      metric: 'track_progress_percentage',
      threshold: 75,
      comparison: 'gte'
    },
    reward: {
      type: 'unlock',
      value: 'Advanced Topics',
      description: 'Unlock Advanced Topics',
      icon: '🔓'
    },
    celebrationStyle: 'animation'
  },
  {
    id: 'track-100',
    type: 'track_progress',
    title: 'Track Master!',
    description: 'Complete your entire learning track',
    criteria: {
      metric: 'track_progress_percentage',
      threshold: 100,
      comparison: 'gte'
    },
    reward: {
      type: 'achievement',
      value: 'Track Master',
      description: 'Earn Track Master Achievement',
      icon: '🏆'
    },
    celebrationStyle: 'confetti'
  },
  // Streak Milestones
  {
    id: 'streak-7',
    type: 'streak',
    title: 'Week Warrior!',
    description: 'Maintain a 7-day learning streak',
    criteria: {
      metric: 'learning_streak',
      threshold: 7,
      comparison: 'gte'
    },
    reward: {
      type: 'xp',
      value: 150,
      description: '+150 XP Streak Bonus',
      icon: '🔥'
    },
    celebrationStyle: 'animation'
  },
  {
    id: 'streak-30',
    type: 'streak',
    title: 'Monthly Master!',
    description: 'Maintain a 30-day learning streak',
    criteria: {
      metric: 'learning_streak',
      threshold: 30,
      comparison: 'gte'
    },
    reward: {
      type: 'badge',
      value: 'Consistency Champion',
      description: 'Unlock Consistency Champion Badge',
      icon: '🔥'
    },
    celebrationStyle: 'confetti'
  },
  // Skill Mastery Milestones
  {
    id: 'skills-5',
    type: 'skill_mastery',
    title: 'Skill Collector!',
    description: 'Master 5 different skills',
    criteria: {
      metric: 'skills_mastered',
      threshold: 5,
      comparison: 'gte'
    },
    reward: {
      type: 'xp',
      value: 200,
      description: '+200 XP Mastery Bonus',
      icon: '⭐'
    },
    celebrationStyle: 'badge'
  },
  {
    id: 'skills-10',
    type: 'skill_mastery',
    title: 'Skill Expert!',
    description: 'Master 10 different skills',
    criteria: {
      metric: 'skills_mastered',
      threshold: 10,
      comparison: 'gte'
    },
    reward: {
      type: 'achievement',
      value: 'Skill Expert',
      description: 'Earn Skill Expert Achievement',
      icon: '🎯'
    },
    celebrationStyle: 'confetti'
  }
]

/**
 * Check if milestone criteria is met
 */
export function checkMilestoneCriteria(
  criteria: MilestoneCriteria,
  currentValue: number
): boolean {
  switch (criteria.comparison) {
    case 'gte':
      return currentValue >= criteria.threshold
    case 'lte':
      return currentValue <= criteria.threshold
    case 'eq':
      return currentValue === criteria.threshold
    default:
      return false
  }
}

/**
 * Calculate milestone progress
 */
export function calculateMilestoneProgress(
  milestone: MilestoneDefinition,
  currentValue: number,
  userId: string
): MilestoneProgress {
  const progressPercentage = Math.min(100, Math.round((currentValue / milestone.criteria.threshold) * 100))
  const isCompleted = checkMilestoneCriteria(milestone.criteria, currentValue)

  return {
    milestoneId: milestone.id,
    userId,
    currentValue,
    targetValue: milestone.criteria.threshold,
    progressPercentage,
    isCompleted,
    completedAt: isCompleted ? new Date() : undefined,
    rewardClaimed: false
  }
}

/**
 * Get applicable milestones for user's current state
 */
export function getApplicableMilestones(
  userMetrics: {
    trackProgressPercentage: number
    learningStreak: number
    skillsMastered: number
    challengesCompleted: number
  }
): MilestoneDefinition[] {
  return MILESTONE_DEFINITIONS.filter(milestone => {
    let currentValue = 0
    
    switch (milestone.criteria.metric) {
      case 'track_progress_percentage':
        currentValue = userMetrics.trackProgressPercentage
        break
      case 'learning_streak':
        currentValue = userMetrics.learningStreak
        break
      case 'skills_mastered':
        currentValue = userMetrics.skillsMastered
        break
      case 'challenges_completed':
        currentValue = userMetrics.challengesCompleted
        break
    }

    // Show milestones that are close to completion (within 20% of target)
    // or just completed
    const progressPercentage = (currentValue / milestone.criteria.threshold) * 100
    return progressPercentage >= 60 && progressPercentage <= 120
  })
}

/**
 * Create celebration event for completed milestone
 */
export function createCelebrationEvent(
  milestone: MilestoneDefinition,
  userId: string
): CelebrationEvent {
  return {
    id: `celebration-${milestone.id}-${Date.now()}`,
    milestoneId: milestone.id,
    userId,
    title: milestone.title,
    message: getCelebrationMessage(milestone),
    reward: milestone.reward,
    celebrationStyle: milestone.celebrationStyle,
    timestamp: new Date(),
    dismissed: false
  }
}

/**
 * Get celebration message based on milestone type
 */
function getCelebrationMessage(milestone: MilestoneDefinition): string {
  const messages: Record<string, string[]> = {
    track_progress: [
      "Amazing progress! You're crushing it! 🎉",
      "Keep up the fantastic work! 🌟",
      "You're on fire! Keep learning! 🔥",
      "Incredible dedication! 💪"
    ],
    level_up: [
      "Level up! You're getting stronger! ⚡",
      "New level unlocked! Keep climbing! 🚀",
      "You've leveled up! Amazing! 🎊"
    ],
    streak: [
      "Your consistency is inspiring! 🔥",
      "Streak master! Keep it going! 💪",
      "Unstoppable learning streak! 🌟"
    ],
    skill_mastery: [
      "New skill mastered! You're a pro! 🎯",
      "Skill unlocked! Impressive! ⭐",
      "Mastery achieved! Well done! 🏆"
    ],
    challenge_completion: [
      "Challenge conquered! Excellent! 🎮",
      "You nailed it! Great job! 🎯",
      "Challenge complete! Outstanding! 🏅"
    ]
  }

  const typeMessages = messages[milestone.type] || messages.track_progress
  return typeMessages[Math.floor(Math.random() * typeMessages.length)]
}

/**
 * Apply milestone reward to user
 */
export function applyMilestoneReward(
  reward: MilestoneReward,
  currentXP: number
): {
  newXP: number
  unlockedContent: string[]
  badges: string[]
  achievements: string[]
} {
  const result = {
    newXP: currentXP,
    unlockedContent: [] as string[],
    badges: [] as string[],
    achievements: [] as string[]
  }

  switch (reward.type) {
    case 'xp':
      result.newXP = currentXP + (typeof reward.value === 'number' ? reward.value : 0)
      break
    case 'badge':
      result.badges.push(typeof reward.value === 'string' ? reward.value : 'New Badge')
      break
    case 'unlock':
      result.unlockedContent.push(typeof reward.value === 'string' ? reward.value : 'New Content')
      break
    case 'achievement':
      result.achievements.push(typeof reward.value === 'string' ? reward.value : 'New Achievement')
      break
  }

  return result
}

/**
 * Get milestone preview for display
 */
export function getMilestonePreview(
  milestones: Milestone[]
): Milestone | null {
  // Find the closest incomplete milestone
  const incompleteMilestones = milestones.filter(m => !m.isCompleted)
  
  if (incompleteMilestones.length === 0) {
    return null
  }

  // Sort by progress (highest first) to show the one closest to completion
  return incompleteMilestones.sort((a, b) => b.progress - a.progress)[0]
}

/**
 * Format milestone reward for display
 */
export function formatMilestoneReward(reward: MilestoneReward): string {
  switch (reward.type) {
    case 'xp':
      return `+${reward.value} XP`
    case 'badge':
      return `${reward.icon || '🏅'} ${reward.value}`
    case 'unlock':
      return `🔓 ${reward.value}`
    case 'achievement':
      return `🏆 ${reward.value}`
    default:
      return reward.description
  }
}

/**
 * Check for newly completed milestones
 */
export function checkForNewCompletions(
  previousMetrics: {
    trackProgressPercentage: number
    learningStreak: number
    skillsMastered: number
  },
  currentMetrics: {
    trackProgressPercentage: number
    learningStreak: number
    skillsMastered: number
  }
): MilestoneDefinition[] {
  const newlyCompleted: MilestoneDefinition[] = []

  MILESTONE_DEFINITIONS.forEach(milestone => {
    let previousValue = 0
    let currentValue = 0

    switch (milestone.criteria.metric) {
      case 'track_progress_percentage':
        previousValue = previousMetrics.trackProgressPercentage
        currentValue = currentMetrics.trackProgressPercentage
        break
      case 'learning_streak':
        previousValue = previousMetrics.learningStreak
        currentValue = currentMetrics.learningStreak
        break
      case 'skills_mastered':
        previousValue = previousMetrics.skillsMastered
        currentValue = currentMetrics.skillsMastered
        break
    }

    const wasCompleted = checkMilestoneCriteria(milestone.criteria, previousValue)
    const isNowCompleted = checkMilestoneCriteria(milestone.criteria, currentValue)

    if (!wasCompleted && isNowCompleted) {
      newlyCompleted.push(milestone)
    }
  })

  return newlyCompleted
}
