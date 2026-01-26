/**
 * Stats Calculation Utilities
 * Functions for calculating enhanced dashboard statistics
 */

import type { 
  UserProfile, 
  KnowledgeGraphNode, 
  LearningActivity, 
  EnhancedActivity,
  DashboardData 
} from '@/types/database'

export interface EnhancedStats {
  learningProgress: {
    percentage: number
    lessonsCompleted: number
    totalLessons: number
    weeklyChange: number
    trend: 'up' | 'down' | 'stable'
  }
  currentStreak: {
    days: number
    bestStreak: number
    message: string
    trend: 'up' | 'down' | 'stable'
  }
  skillsMastered: {
    count: number
    recentSkills: string[]
    monthlyProgress: number
    trend: 'up' | 'down' | 'stable'
  }
  codingTime: {
    weeklyHours: number
    dailyAverage: number
    weeklyChange: number
    trend: 'up' | 'down' | 'stable'
  }
}

/**
 * Calculate learning progress percentage and trend
 */
export function calculateLearningProgress(
  knowledgeGraph: KnowledgeGraphNode[],
  previousWeekData?: { completedNodes: number }
): EnhancedStats['learningProgress'] {
  const totalLessons = knowledgeGraph.length
  const lessonsCompleted = knowledgeGraph.filter(node => node.status === 'mastered').length
  const percentage = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0
  
  // Calculate weekly change (mock calculation for now)
  const previousCompleted = previousWeekData?.completedNodes || Math.max(0, lessonsCompleted - Math.floor(Math.random() * 3))
  const weeklyChange = lessonsCompleted - previousCompleted
  
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (weeklyChange > 0) trend = 'up'
  else if (weeklyChange < 0) trend = 'down'
  
  return {
    percentage,
    lessonsCompleted,
    totalLessons,
    weeklyChange: Math.abs(weeklyChange),
    trend
  }
}

/**
 * Calculate streak data with best streak comparison and motivational messages
 */
export function calculateStreakData(
  currentStreak: number,
  previousBestStreak?: number
): EnhancedStats['currentStreak'] {
  // Calculate best streak (use provided or generate realistic mock)
  const bestStreak = previousBestStreak || Math.max(currentStreak + Math.floor(Math.random() * 10), 14)
  
  // Generate motivational message based on streak
  let message: string
  if (currentStreak === 0) {
    message = "Start your streak today!"
  } else if (currentStreak < 3) {
    message = "Building momentum!"
  } else if (currentStreak < 7) {
    message = "Great progress!"
  } else if (currentStreak < 14) {
    message = "You're on fire! 🔥"
  } else if (currentStreak >= bestStreak) {
    message = "New record! Amazing! 🏆"
  } else {
    message = "Don't break it!"
  }
  
  // Determine trend (simplified logic)
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (currentStreak > 0) trend = 'up'
  else trend = 'down'
  
  return {
    days: currentStreak,
    bestStreak,
    message,
    trend
  }
}

/**
 * Calculate skills mastered with recent skills display
 */
export function calculateSkillsMastered(
  knowledgeGraph: KnowledgeGraphNode[],
  recentActivities: EnhancedActivity[],
  previousMonthData?: { skillCount: number }
): EnhancedStats['skillsMastered'] {
  // Count mastered skills from knowledge graph
  const masteredNodes = knowledgeGraph.filter(node => node.status === 'mastered')
  const count = masteredNodes.length
  
  // Extract recent skills from mastered concepts (last 3)
  const recentSkills = masteredNodes
    .slice(-3)
    .map(node => node.concept)
    .reverse() // Most recent first
  
  // If we don't have enough from knowledge graph, add some common skills
  const commonSkills = ['JavaScript', 'HTML', 'CSS', 'React', 'Node.js', 'Python', 'Git']
  while (recentSkills.length < 3 && commonSkills.length > 0) {
    const skill = commonSkills.shift()
    if (skill && !recentSkills.includes(skill)) {
      recentSkills.push(skill)
    }
  }
  
  // Calculate monthly progress
  const previousCount = previousMonthData?.skillCount || Math.max(0, count - Math.floor(Math.random() * 4))
  const monthlyProgress = count - previousCount
  
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (monthlyProgress > 0) trend = 'up'
  else if (monthlyProgress < 0) trend = 'down'
  
  return {
    count,
    recentSkills: recentSkills.slice(0, 3),
    monthlyProgress: Math.abs(monthlyProgress),
    trend
  }
}

/**
 * Calculate coding time metrics with daily averages and weekly comparisons
 */
export function calculateCodingTime(
  recentActivities: EnhancedActivity[],
  previousWeekData?: { weeklyHours: number }
): EnhancedStats['codingTime'] {
  // Mock calculation based on activities (in a real app, this would come from time tracking)
  const baseHours = Math.random() * 15 + 5 // 5-20 hours base
  const activityBonus = recentActivities.length * 0.5 // 30 min per activity
  const weeklyHours = Math.round((baseHours + activityBonus) * 10) / 10
  
  // Calculate daily average
  const dailyAverage = Math.round((weeklyHours / 7) * 10) / 10
  
  // Calculate weekly change
  const previousHours = previousWeekData?.weeklyHours || weeklyHours - (Math.random() * 5)
  const weeklyChange = Math.round((weeklyHours - previousHours) * 10) / 10
  
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (weeklyChange > 0.5) trend = 'up'
  else if (weeklyChange < -0.5) trend = 'down'
  
  return {
    weeklyHours,
    dailyAverage,
    weeklyChange: Math.abs(weeklyChange),
    trend
  }
}

/**
 * Generate complete enhanced stats for dashboard
 */
export function generateEnhancedStats(
  profile: UserProfile,
  knowledgeGraph: KnowledgeGraphNode[],
  recentActivities: EnhancedActivity[],
  previousData?: {
    completedNodes?: number
    bestStreak?: number
    skillCount?: number
    weeklyHours?: number
  }
): EnhancedStats {
  return {
    learningProgress: calculateLearningProgress(knowledgeGraph, {
      completedNodes: previousData?.completedNodes
    }),
    currentStreak: calculateStreakData(profile.learning_streak, previousData?.bestStreak),
    skillsMastered: calculateSkillsMastered(knowledgeGraph, recentActivities, {
      skillCount: previousData?.skillCount
    }),
    codingTime: calculateCodingTime(recentActivities, {
      weeklyHours: previousData?.weeklyHours
    })
  }
}

/**
 * Get trend indicator props for UI components
 */
export function getTrendIndicator(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return {
        icon: '↗️',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20'
      }
    case 'down':
      return {
        icon: '↘️',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/20'
      }
    case 'stable':
      return {
        icon: '→',
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-900/20'
      }
  }
}

/**
 * Format time duration for display
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`
  } else if (hours < 10) {
    return `${hours.toFixed(1)}h`
  } else {
    return `${Math.round(hours)}h`
  }
}

/**
 * Get motivational message based on stats
 */
export function getMotivationalMessage(stats: EnhancedStats): string {
  const { learningProgress, currentStreak, skillsMastered, codingTime } = stats
  
  // Prioritize streak messages
  if (currentStreak.days >= 7) {
    return `Amazing ${currentStreak.days}-day streak! Keep it up! 🔥`
  }
  
  // Progress-based messages
  if (learningProgress.percentage >= 80) {
    return "You're almost there! Finish strong! 💪"
  } else if (learningProgress.percentage >= 50) {
    return "Great progress! You're halfway there! 🎯"
  }
  
  // Skills-based messages
  if (skillsMastered.monthlyProgress >= 3) {
    return `${skillsMastered.monthlyProgress} new skills this month! Impressive! ⭐`
  }
  
  // Time-based messages
  if (codingTime.weeklyHours >= 15) {
    return `${codingTime.weeklyHours} hours this week! Dedication pays off! 💻`
  }
  
  // Default encouraging message
  return "Every step forward is progress! Keep learning! 🚀"
}