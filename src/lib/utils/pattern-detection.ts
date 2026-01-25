/**
 * Pattern Detection for Learning Behavior
 * Analyzes user learning activities to identify patterns and generate insights
 */

import { supabase } from '@/lib/database/supabase-client'
import { LearningActivity, LearningInsight, InsightType } from '@/types/database'

export interface LearningPattern {
  type: 'velocity_change' | 'retention_risk' | 'strength_identified' | 'pattern_detected'
  confidence: number
  description: string
  data: any
  timeframe: string
}

export interface PatternAnalysisResult {
  patterns: LearningPattern[]
  insights: Omit<LearningInsight, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]
  recommendations: string[]
}

/**
 * Analyze user learning patterns and generate insights
 */
export async function analyzeUserLearningPatterns(userId: string): Promise<PatternAnalysisResult> {
  try {
    // Get recent learning activities (last 30 days)
    const { data: activities, error } = await supabase
      .from('learning_activities')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!activities || activities.length === 0) {
      return {
        patterns: [],
        insights: [],
        recommendations: ['Start learning to generate personalized insights!']
      }
    }

    const patterns: LearningPattern[] = []
    const insights: Omit<LearningInsight, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = []
    const recommendations: string[] = []

    // Analyze velocity changes
    const velocityPattern = analyzeVelocityChanges(activities)
    if (velocityPattern) {
      patterns.push(velocityPattern)
      insights.push(createVelocityInsight(velocityPattern))
    }

    // Analyze retention risks
    const retentionPattern = analyzeRetentionRisk(activities)
    if (retentionPattern) {
      patterns.push(retentionPattern)
      insights.push(createRetentionInsight(retentionPattern))
    }

    // Analyze learning strengths
    const strengthPattern = analyzeStrengths(activities)
    if (strengthPattern) {
      patterns.push(strengthPattern)
      insights.push(createStrengthInsight(strengthPattern))
    }

    // Analyze specific learning patterns
    const behaviorPatterns = analyzeBehaviorPatterns(activities)
    patterns.push(...behaviorPatterns)
    insights.push(...behaviorPatterns.map(createBehaviorInsight))

    // Generate recommendations
    recommendations.push(...generateRecommendations(patterns))

    return { patterns, insights, recommendations }
  } catch (error) {
    console.error('Error analyzing learning patterns:', error)
    return {
      patterns: [],
      insights: [],
      recommendations: ['Unable to analyze patterns at this time. Please try again later.']
    }
  }
}

/**
 * Analyze velocity changes in learning activities
 */
function analyzeVelocityChanges(activities: LearningActivity[]): LearningPattern | null {
  if (activities.length < 7) return null

  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const thisWeek = activities.filter(a => new Date(a.created_at) >= oneWeekAgo)
  const lastWeek = activities.filter(a => 
    new Date(a.created_at) >= twoWeeksAgo && new Date(a.created_at) < oneWeekAgo
  )

  if (lastWeek.length === 0) return null

  const thisWeekXP = thisWeek.reduce((sum, a) => sum + (a.xp_earned || 0), 0)
  const lastWeekXP = lastWeek.reduce((sum, a) => sum + (a.xp_earned || 0), 0)

  const changePercentage = lastWeekXP > 0 ? ((thisWeekXP - lastWeekXP) / lastWeekXP) * 100 : 0

  if (Math.abs(changePercentage) < 10) return null // Ignore small changes

  return {
    type: 'velocity_change',
    confidence: Math.min(Math.abs(changePercentage) / 50, 1), // Higher confidence for bigger changes
    description: changePercentage > 0 
      ? `Learning velocity increased by ${changePercentage.toFixed(1)}%`
      : `Learning velocity decreased by ${Math.abs(changePercentage).toFixed(1)}%`,
    data: {
      thisWeekXP,
      lastWeekXP,
      changePercentage,
      thisWeekActivities: thisWeek.length,
      lastWeekActivities: lastWeek.length
    },
    timeframe: 'last 2 weeks'
  }
}

/**
 * Analyze retention risk based on activity gaps
 */
function analyzeRetentionRisk(activities: LearningActivity[]): LearningPattern | null {
  if (activities.length === 0) return null

  const now = new Date()
  const lastActivity = new Date(activities[0].created_at)
  const daysSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000))

  // Check for concerning gaps
  if (daysSinceLastActivity >= 3) {
    return {
      type: 'retention_risk',
      confidence: Math.min(daysSinceLastActivity / 7, 1), // Higher confidence for longer gaps
      description: `${daysSinceLastActivity} days since last learning activity`,
      data: {
        daysSinceLastActivity,
        lastActivityType: activities[0].activity_type,
        averageGapDays: calculateAverageGap(activities)
      },
      timeframe: 'recent activity'
    }
  }

  return null
}

/**
 * Analyze learning strengths based on performance
 */
function analyzeStrengths(activities: LearningActivity[]): LearningPattern | null {
  if (activities.length < 5) return null

  // Group activities by type and calculate average XP
  const activityGroups = activities.reduce((groups, activity) => {
    const type = activity.activity_type
    if (!groups[type]) {
      groups[type] = { total: 0, count: 0, avgXP: 0 }
    }
    groups[type].total += activity.xp_earned || 0
    groups[type].count += 1
    groups[type].avgXP = groups[type].total / groups[type].count
    return groups
  }, {} as Record<string, { total: number, count: number, avgXP: number }>)

  // Find the strongest area (highest average XP)
  const strongestArea = Object.entries(activityGroups)
    .filter(([_, data]) => data.count >= 3) // Need at least 3 activities
    .sort(([_, a], [__, b]) => b.avgXP - a.avgXP)[0]

  if (!strongestArea || strongestArea[1].avgXP < 50) return null

  return {
    type: 'strength_identified',
    confidence: Math.min(strongestArea[1].avgXP / 100, 1),
    description: `Strong performance in ${strongestArea[0]} activities`,
    data: {
      activityType: strongestArea[0],
      averageXP: strongestArea[1].avgXP,
      totalActivities: strongestArea[1].count,
      comparison: Object.entries(activityGroups).map(([type, data]) => ({
        type,
        avgXP: data.avgXP,
        count: data.count
      }))
    },
    timeframe: 'last 30 days'
  }
}

/**
 * Analyze specific behavior patterns
 */
function analyzeBehaviorPatterns(activities: LearningActivity[]): LearningPattern[] {
  const patterns: LearningPattern[] = []

  // Pattern: Repeated attempts at same concept
  const conceptAttempts = analyzeConceptRepetition(activities)
  if (conceptAttempts) patterns.push(conceptAttempts)

  // Pattern: Time-of-day preferences
  const timePattern = analyzeTimePreferences(activities)
  if (timePattern) patterns.push(timePattern)

  // Pattern: Voice coaching usage
  const voicePattern = analyzeVoiceCoachingUsage(activities)
  if (voicePattern) patterns.push(voicePattern)

  return patterns
}

/**
 * Analyze concept repetition patterns
 */
function analyzeConceptRepetition(activities: LearningActivity[]): LearningPattern | null {
  // Group by content_id to find repeated attempts
  const contentAttempts = activities.reduce((groups, activity) => {
    if (!activity.content_id) return groups
    
    const id = activity.content_id
    if (!groups[id]) {
      groups[id] = []
    }
    groups[id].push(activity)
    return groups
  }, {} as Record<string, LearningActivity[]>)

  // Find content with multiple attempts
  const repeatedContent = Object.entries(contentAttempts)
    .filter(([_, attempts]) => attempts.length >= 3)
    .sort(([_, a], [__, b]) => b.length - a.length)[0]

  if (!repeatedContent) return null

  const [contentId, attempts] = repeatedContent
  const avgXP = attempts.reduce((sum, a) => sum + (a.xp_earned || 0), 0) / attempts.length

  return {
    type: 'pattern_detected',
    confidence: Math.min(attempts.length / 5, 1),
    description: `Repeated attempts at same concept (${attempts.length} times)`,
    data: {
      contentId,
      attempts: attempts.length,
      averageXP: avgXP,
      timeSpan: calculateTimeSpan(attempts),
      improvementTrend: calculateImprovementTrend(attempts)
    },
    timeframe: 'recent activities'
  }
}

/**
 * Analyze time-of-day learning preferences
 */
function analyzeTimePreferences(activities: LearningActivity[]): LearningPattern | null {
  if (activities.length < 10) return null

  const hourCounts = activities.reduce((counts, activity) => {
    const hour = new Date(activity.created_at).getHours()
    counts[hour] = (counts[hour] || 0) + 1
    return counts
  }, {} as Record<number, number>)

  const sortedHours = Object.entries(hourCounts)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)

  const topHour = sortedHours[0]
  const percentage = (parseInt(topHour[1]) / activities.length) * 100

  if (percentage < 25) return null // Not a strong enough pattern

  const timeLabel = getTimeLabel(parseInt(topHour[0]))

  return {
    type: 'pattern_detected',
    confidence: percentage / 100,
    description: `Prefers learning during ${timeLabel} (${percentage.toFixed(1)}% of activities)`,
    data: {
      preferredHour: parseInt(topHour[0]),
      percentage,
      timeLabel,
      hourDistribution: hourCounts
    },
    timeframe: 'all activities'
  }
}

/**
 * Analyze voice coaching usage patterns
 */
function analyzeVoiceCoachingUsage(activities: LearningActivity[]): LearningPattern | null {
  const voiceActivities = activities.filter(a => a.voice_coaching_used)
  
  if (voiceActivities.length === 0) return null

  const voicePercentage = (voiceActivities.length / activities.length) * 100
  const avgVoiceXP = voiceActivities.reduce((sum, a) => sum + (a.xp_earned || 0), 0) / voiceActivities.length
  const avgNonVoiceXP = activities
    .filter(a => !a.voice_coaching_used)
    .reduce((sum, a) => sum + (a.xp_earned || 0), 0) / (activities.length - voiceActivities.length)

  const performanceDiff = avgVoiceXP - avgNonVoiceXP

  return {
    type: 'pattern_detected',
    confidence: Math.min(voicePercentage / 50, 1),
    description: `Uses voice coaching ${voicePercentage.toFixed(1)}% of the time`,
    data: {
      voiceUsagePercentage: voicePercentage,
      voiceActivities: voiceActivities.length,
      totalActivities: activities.length,
      avgVoiceXP,
      avgNonVoiceXP,
      performanceDifference: performanceDiff
    },
    timeframe: 'all activities'
  }
}

/**
 * Create insights from patterns
 */
function createVelocityInsight(pattern: LearningPattern): Omit<LearningInsight, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  const isImproving = pattern.data.changePercentage > 0
  
  return {
    insight_type: 'velocity_change' as InsightType,
    title: isImproving ? '🚀 Learning Velocity Increased!' : '📉 Learning Pace Slowed',
    message: isImproving 
      ? `Great progress! You're learning ${pattern.data.changePercentage.toFixed(1)}% faster than last week. At this rate, you'll master new concepts even quicker!`
      : `Your learning pace has decreased by ${Math.abs(pattern.data.changePercentage).toFixed(1)}% this week. Consider setting aside more focused study time.`,
    action_recommended: isImproving 
      ? 'Keep up the momentum with more challenging topics'
      : 'Try shorter, more frequent study sessions',
    priority: isImproving ? 'low' : 'medium',
    dismissed: false,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    metadata: {
      pattern_type: 'velocity_change',
      confidence: pattern.confidence,
      data: pattern.data
    }
  }
}

function createRetentionInsight(pattern: LearningPattern): Omit<LearningInsight, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  return {
    insight_type: 'retention_risk' as InsightType,
    title: '⏰ Time to Get Back on Track',
    message: `You haven't practiced in ${pattern.data.daysSinceLastActivity} days. Regular practice helps retain what you've learned!`,
    action_recommended: 'Start with a quick 5-minute review challenge',
    priority: pattern.data.daysSinceLastActivity >= 7 ? 'high' : 'medium',
    dismissed: false,
    expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    metadata: {
      pattern_type: 'retention_risk',
      confidence: pattern.confidence,
      data: pattern.data
    }
  }
}

function createStrengthInsight(pattern: LearningPattern): Omit<LearningInsight, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  return {
    insight_type: 'strength_identified' as InsightType,
    title: '💪 Strength Identified!',
    message: `You excel at ${pattern.data.activityType} activities! Your average performance is ${pattern.data.averageXP.toFixed(0)} XP per session.`,
    action_recommended: 'Try teaching this concept to AI peers for bonus XP',
    priority: 'low',
    dismissed: false,
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
    metadata: {
      pattern_type: 'strength_identified',
      confidence: pattern.confidence,
      data: pattern.data
    }
  }
}

function createBehaviorInsight(pattern: LearningPattern): Omit<LearningInsight, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  return {
    insight_type: 'pattern_detected' as InsightType,
    title: '🔍 Learning Pattern Detected',
    message: pattern.description,
    action_recommended: generatePatternRecommendation(pattern),
    priority: 'medium',
    dismissed: false,
    expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days
    metadata: {
      pattern_type: 'behavior_pattern',
      confidence: pattern.confidence,
      data: pattern.data
    }
  }
}

/**
 * Generate recommendations based on patterns
 */
function generateRecommendations(patterns: LearningPattern[]): string[] {
  const recommendations: string[] = []

  patterns.forEach(pattern => {
    switch (pattern.type) {
      case 'velocity_change':
        if (pattern.data.changePercentage > 0) {
          recommendations.push('Consider tackling more advanced topics to maintain growth')
        } else {
          recommendations.push('Try breaking down complex topics into smaller chunks')
        }
        break
      
      case 'retention_risk':
        recommendations.push('Set up daily reminders for consistent practice')
        break
      
      case 'strength_identified':
        recommendations.push(`Leverage your ${pattern.data.activityType} skills to help AI peers`)
        break
      
      case 'pattern_detected':
        recommendations.push(generatePatternRecommendation(pattern))
        break
    }
  })

  return recommendations
}

function generatePatternRecommendation(pattern: LearningPattern): string {
  if (pattern.description.includes('Repeated attempts')) {
    return 'Consider asking AI peers for help or trying voice coaching'
  }
  
  if (pattern.description.includes('Prefers learning during')) {
    return `Schedule your most challenging topics during ${pattern.data.timeLabel}`
  }
  
  if (pattern.description.includes('voice coaching')) {
    if (pattern.data.performanceDifference > 0) {
      return 'Voice coaching seems to help - use it more often!'
    } else {
      return 'Try combining voice coaching with visual learning'
    }
  }
  
  return 'Continue with your current learning approach'
}

/**
 * Helper functions
 */
function calculateAverageGap(activities: LearningActivity[]): number {
  if (activities.length < 2) return 0
  
  const gaps = []
  for (let i = 0; i < activities.length - 1; i++) {
    const gap = new Date(activities[i].created_at).getTime() - new Date(activities[i + 1].created_at).getTime()
    gaps.push(gap / (24 * 60 * 60 * 1000)) // Convert to days
  }
  
  return gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
}

function calculateTimeSpan(activities: LearningActivity[]): number {
  if (activities.length < 2) return 0
  
  const earliest = new Date(activities[activities.length - 1].created_at)
  const latest = new Date(activities[0].created_at)
  
  return Math.floor((latest.getTime() - earliest.getTime()) / (24 * 60 * 60 * 1000))
}

function calculateImprovementTrend(activities: LearningActivity[]): 'improving' | 'declining' | 'stable' {
  if (activities.length < 3) return 'stable'
  
  const recent = activities.slice(0, Math.ceil(activities.length / 2))
  const older = activities.slice(Math.ceil(activities.length / 2))
  
  const recentAvg = recent.reduce((sum, a) => sum + (a.xp_earned || 0), 0) / recent.length
  const olderAvg = older.reduce((sum, a) => sum + (a.xp_earned || 0), 0) / older.length
  
  const diff = recentAvg - olderAvg
  
  if (diff > 10) return 'improving'
  if (diff < -10) return 'declining'
  return 'stable'
}

function getTimeLabel(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}