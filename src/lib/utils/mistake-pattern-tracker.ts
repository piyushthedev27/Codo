/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mistake Pattern Tracker for Codo AI Learning Platform
 * 
 * This module tracks user mistake patterns over time to identify learning gaps
 * and provide personalized recommendations for improvement.
 */

import { ParsedError } from './error-parsing'
import { supabase } from '../database/supabase-client'

export interface MistakePattern {
  id: string
  userId: string
  errorType: string
  errorMessage: string
  codeContext?: string
  language: string
  frequency: number
  lastOccurrence: Date
  resolved: boolean
  microLessonGenerated: boolean
  resolutionNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface MistakeAnalysis {
  userId: string
  totalMistakes: number
  uniqueErrorTypes: number
  mostCommonErrors: MistakeFrequency[]
  improvementAreas: string[]
  learningRecommendations: LearningRecommendation[]
  progressTrend: ProgressTrend
  mistakesByCategory: CategoryBreakdown[]
  timeBasedAnalysis: TimeBasedAnalysis
}

export interface MistakeFrequency {
  errorType: string
  category: string
  frequency: number
  lastSeen: Date
  resolved: boolean
  averageResolutionTime?: number
}

export interface LearningRecommendation {
  id: string
  type: 'micro-lesson' | 'practice-challenge' | 'concept-review' | 'voice-coaching'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  estimatedDuration: number
  relatedErrors: string[]
  xpReward: number
}

export interface ProgressTrend {
  direction: 'improving' | 'stable' | 'declining'
  changePercentage: number
  timeframe: string
  keyInsights: string[]
}

export interface CategoryBreakdown {
  category: string
  count: number
  percentage: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface TimeBasedAnalysis {
  dailyAverage: number
  weeklyTrend: number[]
  peakErrorTimes: string[]
  learningVelocity: number
}

/**
 * Track a new mistake or update existing pattern
 */
export async function trackMistake(
  userId: string,
  parsedError: ParsedError
): Promise<MistakePattern> {
  try {
    // Check if this error pattern already exists for the user
    const existingPattern = await findExistingPattern(userId, parsedError)
    
    if (existingPattern) {
      // Update existing pattern
      return await updateMistakePattern(existingPattern.id, {
        frequency: existingPattern.frequency + 1,
        lastOccurrence: new Date(),
        codeContext: parsedError.codeContext || existingPattern.codeContext,
        resolved: false // Reset resolved status if error occurs again
      })
    } else {
      // Create new pattern
      return await createMistakePattern(userId, parsedError)
    }
  } catch (error) {
    console.error('Error tracking mistake:', error)
    throw new Error('Failed to track mistake pattern')
  }
}

/**
 * Find existing mistake pattern for user and error
 */
async function findExistingPattern(
  userId: string,
  parsedError: ParsedError
): Promise<MistakePattern | null> {
  try {
    const { data, error } = await supabase
      .from('mistake_patterns')
      .select('*')
      .eq('user_id', userId)
      .eq('error_type', parsedError.errorType)
      .eq('language', parsedError.language)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return data ? mapDatabaseToMistakePattern(data) : null
  } catch (error) {
    console.error('Error finding existing pattern:', error)
    return null
  }
}

/**
 * Create new mistake pattern
 */
async function createMistakePattern(
  userId: string,
  parsedError: ParsedError
): Promise<MistakePattern> {
  try {
    const { data, error } = await supabase
      .from('mistake_patterns')
      .insert({
        user_id: userId,
        error_type: parsedError.errorType,
        error_message: parsedError.originalError,
        code_context: parsedError.codeContext,
        language: parsedError.language,
        frequency: 1,
        last_occurrence: new Date().toISOString(),
        resolved: false,
        micro_lesson_generated: parsedError.microLessonNeeded
      })
      .select()
      .single()

    if (error) throw error

    return mapDatabaseToMistakePattern(data)
  } catch (error) {
    console.error('Error creating mistake pattern:', error)
    throw new Error('Failed to create mistake pattern')
  }
}

/**
 * Update existing mistake pattern
 */
async function updateMistakePattern(
  patternId: string,
  updates: Partial<{
    frequency: number
    lastOccurrence: Date
    codeContext: string
    resolved: boolean
    resolutionNotes: string
    microLessonGenerated: boolean
  }>
): Promise<MistakePattern> {
  try {
    const updateData: any = {}
    
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency
    if (updates.lastOccurrence) updateData.last_occurrence = updates.lastOccurrence.toISOString()
    if (updates.codeContext) updateData.code_context = updates.codeContext
    if (updates.resolved !== undefined) updateData.resolved = updates.resolved
    if (updates.resolutionNotes) updateData.resolution_notes = updates.resolutionNotes
    if (updates.microLessonGenerated !== undefined) updateData.micro_lesson_generated = updates.microLessonGenerated

    const { data, error } = await supabase
      .from('mistake_patterns')
      .update(updateData)
      .eq('id', patternId)
      .select()
      .single()

    if (error) throw error

    return mapDatabaseToMistakePattern(data)
  } catch (error) {
    console.error('Error updating mistake pattern:', error)
    throw new Error('Failed to update mistake pattern')
  }
}

/**
 * Mark a mistake pattern as resolved
 */
export async function markMistakeResolved(
  patternId: string,
  resolutionNotes?: string
): Promise<MistakePattern> {
  return await updateMistakePattern(patternId, {
    resolved: true,
    resolutionNotes
  })
}

/**
 * Get all mistake patterns for a user
 */
export async function getUserMistakePatterns(
  userId: string,
  options: {
    resolved?: boolean
    language?: string
    limit?: number
    sortBy?: 'frequency' | 'recent' | 'created'
  } = {}
): Promise<MistakePattern[]> {
  try {
    let query = supabase
      .from('mistake_patterns')
      .select('*')
      .eq('user_id', userId)

    if (options.resolved !== undefined) {
      query = query.eq('resolved', options.resolved)
    }

    if (options.language) {
      query = query.eq('language', options.language)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    // Apply sorting
    switch (options.sortBy) {
      case 'frequency':
        query = query.order('frequency', { ascending: false })
        break
      case 'recent':
        query = query.order('last_occurrence', { ascending: false })
        break
      case 'created':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data, error } = await query

    if (error) throw error

    return data?.map(mapDatabaseToMistakePattern) || []
  } catch (error) {
    console.error('Error getting user mistake patterns:', error)
    return []
  }
}

/**
 * Analyze user mistake patterns and generate insights
 */
export async function analyzeMistakePatterns(userId: string): Promise<MistakeAnalysis> {
  try {
    const patterns = await getUserMistakePatterns(userId)
    const recentPatterns = await getUserMistakePatterns(userId, { 
      limit: 50,
      sortBy: 'recent'
    })

    // Calculate basic statistics
    const totalMistakes = patterns.reduce((sum, pattern) => sum + pattern.frequency, 0)
    const uniqueErrorTypes = new Set(patterns.map(p => p.errorType)).size

    // Find most common errors
    const mostCommonErrors = patterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
      .map(pattern => ({
        errorType: pattern.errorType,
        category: categorizeErrorType(pattern.errorType),
        frequency: pattern.frequency,
        lastSeen: pattern.lastOccurrence,
        resolved: pattern.resolved,
        averageResolutionTime: calculateAverageResolutionTime(pattern)
      }))

    // Identify improvement areas
    const improvementAreas = identifyImprovementAreas(patterns)

    // Generate learning recommendations
    const learningRecommendations = generateLearningRecommendations(patterns)

    // Calculate progress trend
    const progressTrend = calculateProgressTrend(recentPatterns)

    // Break down mistakes by category
    const mistakesByCategory = calculateCategoryBreakdown(patterns)

    // Time-based analysis
    const timeBasedAnalysis = calculateTimeBasedAnalysis(recentPatterns)

    return {
      userId,
      totalMistakes,
      uniqueErrorTypes,
      mostCommonErrors,
      improvementAreas,
      learningRecommendations,
      progressTrend,
      mistakesByCategory,
      timeBasedAnalysis
    }
  } catch (error) {
    console.error('Error analyzing mistake patterns:', error)
    throw new Error('Failed to analyze mistake patterns')
  }
}

/**
 * Identify areas that need improvement based on mistake patterns
 */
function identifyImprovementAreas(patterns: MistakePattern[]): string[] {
  const categoryFrequency: Record<string, number> = {}
  
  patterns.forEach(pattern => {
    const category = categorizeErrorType(pattern.errorType)
    categoryFrequency[category] = (categoryFrequency[category] || 0) + pattern.frequency
  })

  // Return categories with high frequency (top 5)
  return Object.entries(categoryFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category]) => category)
}

/**
 * Generate personalized learning recommendations
 */
function generateLearningRecommendations(patterns: MistakePattern[]): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = []
  const unresolvedPatterns = patterns.filter(p => !p.resolved)

  // High-frequency unresolved errors get micro-lessons
  unresolvedPatterns
    .filter(p => p.frequency >= 3)
    .slice(0, 3)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .forEach((pattern, index) => {
      recommendations.push({
        id: `rec_microlesson_${pattern.id}`,
        type: 'micro-lesson',
        title: `Master ${pattern.errorType}`,
        description: `You've encountered this error ${pattern.frequency} times. Let's fix it once and for all!`,
        priority: 'high',
        estimatedDuration: 8,
        relatedErrors: [pattern.errorType],
        xpReward: 50
      })
    })

  // Medium-frequency errors get practice challenges
  unresolvedPatterns
    .filter(p => p.frequency >= 2 && p.frequency < 3)
    .slice(0, 2)
    .forEach(pattern => {
      recommendations.push({
        id: `rec_practice_${pattern.id}`,
        type: 'practice-challenge',
        title: `Practice: ${categorizeErrorType(pattern.errorType)}`,
        description: `Strengthen your understanding with targeted practice exercises.`,
        priority: 'medium',
        estimatedDuration: 15,
        relatedErrors: [pattern.errorType],
        xpReward: 75
      })
    })

  // Recent errors get voice coaching
  const recentErrors = unresolvedPatterns
    .filter(p => {
      const daysSinceLastOccurrence = (Date.now() - p.lastOccurrence.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceLastOccurrence <= 7
    })
    .slice(0, 2)

  recentErrors.forEach(pattern => {
    recommendations.push({
      id: `rec_voice_${pattern.id}`,
      type: 'voice-coaching',
      title: `Voice Help: ${pattern.errorType}`,
      description: `Get real-time voice guidance to prevent this error in the future.`,
      priority: 'medium',
      estimatedDuration: 5,
      relatedErrors: [pattern.errorType],
      xpReward: 25
    })
  })

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

/**
 * Calculate progress trend based on recent patterns
 */
function calculateProgressTrend(recentPatterns: MistakePattern[]): ProgressTrend {
  if (recentPatterns.length < 5) {
    return {
      direction: 'stable',
      changePercentage: 0,
      timeframe: 'insufficient data',
      keyInsights: ['Need more data to determine trend']
    }
  }

  // Split patterns into two time periods
  const midpoint = Math.floor(recentPatterns.length / 2)
  const earlierPeriod = recentPatterns.slice(midpoint)
  const laterPeriod = recentPatterns.slice(0, midpoint)

  const earlierFrequency = earlierPeriod.reduce((sum, p) => sum + p.frequency, 0)
  const laterFrequency = laterPeriod.reduce((sum, p) => sum + p.frequency, 0)

  const changePercentage = earlierFrequency > 0 
    ? ((laterFrequency - earlierFrequency) / earlierFrequency) * 100
    : 0

  let direction: 'improving' | 'stable' | 'declining'
  if (changePercentage < -10) direction = 'improving'
  else if (changePercentage > 10) direction = 'declining'
  else direction = 'stable'

  const keyInsights = generateTrendInsights(direction, changePercentage, recentPatterns)

  return {
    direction,
    changePercentage: Math.abs(changePercentage),
    timeframe: 'last 30 days',
    keyInsights
  }
}

/**
 * Generate insights based on trend analysis
 */
function generateTrendInsights(
  direction: string,
  changePercentage: number,
  patterns: MistakePattern[]
): string[] {
  const insights: string[] = []

  if (direction === 'improving') {
    insights.push(`Great progress! You're making ${Math.abs(changePercentage).toFixed(1)}% fewer mistakes`)
    
    const resolvedCount = patterns.filter(p => p.resolved).length
    if (resolvedCount > 0) {
      insights.push(`You've successfully resolved ${resolvedCount} error patterns`)
    }
  } else if (direction === 'declining') {
    insights.push(`Mistakes have increased by ${changePercentage.toFixed(1)}% - let's focus on improvement`)
    
    const mostCommon = patterns
      .sort((a, b) => b.frequency - a.frequency)[0]
    if (mostCommon) {
      insights.push(`Focus on fixing: ${mostCommon.errorType}`)
    }
  } else {
    insights.push('Your error rate is stable - consistent learning pace')
  }

  return insights
}

/**
 * Calculate breakdown of mistakes by category
 */
function calculateCategoryBreakdown(patterns: MistakePattern[]): CategoryBreakdown[] {
  const categoryCount: Record<string, number> = {}
  const totalMistakes = patterns.reduce((sum, p) => sum + p.frequency, 0)

  patterns.forEach(pattern => {
    const category = categorizeErrorType(pattern.errorType)
    categoryCount[category] = (categoryCount[category] || 0) + pattern.frequency
  })

  return Object.entries(categoryCount)
    .map(([category, count]) => ({
      category,
      count,
      percentage: totalMistakes > 0 ? (count / totalMistakes) * 100 : 0,
      trend: 'stable' as const // TODO: Calculate actual trend
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Calculate time-based analysis
 */
function calculateTimeBasedAnalysis(patterns: MistakePattern[]): TimeBasedAnalysis {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const recentPatterns = patterns.filter(p => p.lastOccurrence >= thirtyDaysAgo)
  const totalRecentMistakes = recentPatterns.reduce((sum, p) => sum + p.frequency, 0)
  
  return {
    dailyAverage: totalRecentMistakes / 30,
    weeklyTrend: calculateWeeklyTrend(recentPatterns),
    peakErrorTimes: ['morning', 'afternoon'], // TODO: Calculate from actual data
    learningVelocity: calculateLearningVelocity(patterns)
  }
}

/**
 * Calculate weekly trend data
 */
function calculateWeeklyTrend(patterns: MistakePattern[]): number[] {
  const weeks = Array(4).fill(0)
  const now = new Date()

  patterns.forEach(pattern => {
    const daysDiff = Math.floor((now.getTime() - pattern.lastOccurrence.getTime()) / (1000 * 60 * 60 * 24))
    const weekIndex = Math.floor(daysDiff / 7)
    
    if (weekIndex < 4) {
      weeks[3 - weekIndex] += pattern.frequency
    }
  })

  return weeks
}

/**
 * Calculate learning velocity (mistakes resolved per week)
 */
function calculateLearningVelocity(patterns: MistakePattern[]): number {
  const resolvedPatterns = patterns.filter(p => p.resolved)
  const totalWeeks = 4 // Last 4 weeks
  
  return resolvedPatterns.length / totalWeeks
}

/**
 * Categorize error type into broader category
 */
function categorizeErrorType(errorType: string): string {
  const errorTypeLower = errorType.toLowerCase()
  
  if (errorTypeLower.includes('syntax')) return 'Syntax Errors'
  if (errorTypeLower.includes('reference')) return 'Variable Errors'
  if (errorTypeLower.includes('type')) return 'Type Errors'
  if (errorTypeLower.includes('async') || errorTypeLower.includes('promise')) return 'Async Errors'
  if (errorTypeLower.includes('array') || errorTypeLower.includes('map') || errorTypeLower.includes('filter')) return 'Array Errors'
  if (errorTypeLower.includes('object') || errorTypeLower.includes('property')) return 'Object Errors'
  if (errorTypeLower.includes('indentation')) return 'Python Syntax'
  if (errorTypeLower.includes('name')) return 'Python Variables'
  
  return 'Logic Errors'
}

/**
 * Calculate average resolution time for a pattern
 */
function calculateAverageResolutionTime(pattern: MistakePattern): number | undefined {
  if (!pattern.resolved) return undefined
  
  // Estimate based on frequency and time span
  const daysSinceCreated = (Date.now() - pattern.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  return daysSinceCreated / pattern.frequency
}

/**
 * Map database record to MistakePattern interface
 */
function mapDatabaseToMistakePattern(data: any): MistakePattern {
  return {
    id: data.id,
    userId: data.user_id,
    errorType: data.error_type,
    errorMessage: data.error_message,
    codeContext: data.code_context,
    language: data.language,
    frequency: data.frequency,
    lastOccurrence: new Date(data.last_occurrence),
    resolved: data.resolved,
    microLessonGenerated: data.micro_lesson_generated,
    resolutionNotes: data.resolution_notes,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

/**
 * Get mistake patterns summary for dashboard
 */
export async function getMistakePatternsSummary(userId: string): Promise<{
  totalPatterns: number
  unresolvedPatterns: number
  mostCommonError: string | null
  improvementRate: number
}> {
  try {
    const patterns = await getUserMistakePatterns(userId)
    const unresolvedPatterns = patterns.filter(p => !p.resolved)
    const resolvedPatterns = patterns.filter(p => p.resolved)
    
    const mostCommonError = patterns.length > 0 
      ? patterns.sort((a, b) => b.frequency - a.frequency)[0].errorType
      : null

    const improvementRate = patterns.length > 0
      ? (resolvedPatterns.length / patterns.length) * 100
      : 0

    return {
      totalPatterns: patterns.length,
      unresolvedPatterns: unresolvedPatterns.length,
      mostCommonError,
      improvementRate
    }
  } catch (error) {
    console.error('Error getting mistake patterns summary:', error)
    return {
      totalPatterns: 0,
      unresolvedPatterns: 0,
      mostCommonError: null,
      improvementRate: 0
    }
  }
}