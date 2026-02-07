/**
 * Activity Types and Categorization System
 * 
 * Defines activity types, categories, and visual styling for the enhanced activity feed
 */

import { BookOpen, Trophy, Users, Code, Zap, Target, MessageCircle, Award } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Activity type definitions
export type ActivityCategory = 
  | 'lesson_completed' 
  | 'achievement' 
  | 'collaboration' 
  | 'practice'
  | 'voice_coaching'
  | 'peer_interaction'
  | 'milestone'
  | 'challenge_completed'

// Activity styling configuration
export interface ActivityStyle {
  icon: LucideIcon
  bgColor: string
  iconColor: string
  borderColor: string
  badgeColor: string
}

// Activity type to style mapping
export const ACTIVITY_STYLES: Record<ActivityCategory, ActivityStyle> = {
  lesson_completed: {
    icon: BookOpen,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    badgeColor: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
  },
  achievement: {
    icon: Trophy,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    badgeColor: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
  },
  collaboration: {
    icon: Users,
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
    badgeColor: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
  },
  practice: {
    icon: Code,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    iconColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800',
    badgeColor: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
  },
  voice_coaching: {
    icon: Zap,
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-800',
    badgeColor: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
  },
  peer_interaction: {
    icon: MessageCircle,
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    iconColor: 'text-pink-600 dark:text-pink-400',
    borderColor: 'border-pink-200 dark:border-pink-800',
    badgeColor: 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300'
  },
  milestone: {
    icon: Target,
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    badgeColor: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
  },
  challenge_completed: {
    icon: Award,
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
  }
}

// Get style for activity type
export function getActivityStyle(type: ActivityCategory): ActivityStyle {
  return ACTIVITY_STYLES[type] || ACTIVITY_STYLES.practice
}

// Activity priority for sorting
export const ACTIVITY_PRIORITY: Record<ActivityCategory, number> = {
  achievement: 1,
  milestone: 2,
  challenge_completed: 3,
  lesson_completed: 4,
  collaboration: 5,
  voice_coaching: 6,
  peer_interaction: 7,
  practice: 8
}

// Get priority for sorting
export function getActivityPriority(type: ActivityCategory): number {
  return ACTIVITY_PRIORITY[type] || 10
}
