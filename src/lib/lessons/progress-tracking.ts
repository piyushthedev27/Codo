/**
 * Lesson Progress Tracking
 * Manages lesson progress, completion status, and XP rewards
 */

import { supabase } from '@/lib/database/supabase-client'
import { userProfileOperations } from '@/lib/database/operations'
import type { Lesson, CompletionStatus } from '@/types/database'

export interface LessonProgress {
  lessonId: string
  userId: string
  currentSection: number
  totalSections: number
  progressPercentage: number
  timeSpentMinutes: number
  sectionsCompleted: string[]
  interactionsCompleted: string[]
  voiceCoachingUsed: boolean
  mistakesMade: number
  xpEarned: number
  status: CompletionStatus
  lastAccessedAt: string
}

export interface ProgressUpdate {
  sectionId?: string
  interactionId?: string
  timeSpent?: number
  mistakesMade?: number
  voiceCoachingUsed?: boolean
  xpEarned?: number
}

/**
 * Initialize lesson progress for a user
 */
export async function initializeLessonProgress(
  userId: string,
  lessonId: string,
  totalSections: number
): Promise<LessonProgress> {
  const progress: LessonProgress = {
    lessonId,
    userId,
    currentSection: 0,
    totalSections,
    progressPercentage: 0,
    timeSpentMinutes: 0,
    sectionsCompleted: [],
    interactionsCompleted: [],
    voiceCoachingUsed: false,
    mistakesMade: 0,
    xpEarned: 0,
    status: 'not_started',
    lastAccessedAt: new Date().toISOString()
  }

  // Store in database
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      id: lessonId,
      user_id: userId,
      title: 'Generated Lesson',
      topic: 'Programming',
      difficulty_level: 1,
      content: {},
      peer_interactions: [],
      voice_coaching_points: [],
      completion_status: 'not_started',
      progress_percentage: 0,
      time_spent_minutes: 0,
      xp_earned: 0,
      mistakes_made: 0,
      peer_interactions_count: 0,
      voice_coaching_used: false
    })
    .select()
    .single()

  if (error) {
    console.error('Error initializing lesson progress:', error)
    throw error
  }

  return progress
}

/**
 * Get lesson progress for a user
 */
export async function getLessonProgress(
  userId: string,
  lessonId: string
): Promise<LessonProgress | null> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('user_id', userId)
      .eq('id', lessonId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      lessonId: data.id,
      userId: data.user_id,
      currentSection: Math.floor(data.progress_percentage / 100 * (data.content?.sections?.length || 1)),
      totalSections: data.content?.sections?.length || 1,
      progressPercentage: data.progress_percentage,
      timeSpentMinutes: data.time_spent_minutes,
      sectionsCompleted: data.content?.sectionsCompleted || [],
      interactionsCompleted: data.content?.interactionsCompleted || [],
      voiceCoachingUsed: data.voice_coaching_used,
      mistakesMade: data.mistakes_made,
      xpEarned: data.xp_earned,
      status: data.completion_status,
      lastAccessedAt: data.updated_at
    }
  } catch (error) {
    console.error('Error getting lesson progress:', error)
    return null
  }
}

/**
 * Update lesson progress
 */
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  update: ProgressUpdate
): Promise<LessonProgress | null> {
  try {
    // Get current progress
    let currentProgress = await getLessonProgress(userId, lessonId)

    // If progress doesn't exist, initialize it first
    if (!currentProgress) {
      console.log('Lesson progress not found, initializing...')
      currentProgress = await initializeLessonProgress(userId, lessonId, 10) // Default 10 sections
    }

    // Calculate new progress
    const updatedSections = update.sectionId && !currentProgress.sectionsCompleted.includes(update.sectionId)
      ? [...currentProgress.sectionsCompleted, update.sectionId]
      : currentProgress.sectionsCompleted

    const updatedInteractions = update.interactionId && !currentProgress.interactionsCompleted.includes(update.interactionId)
      ? [...currentProgress.interactionsCompleted, update.interactionId]
      : currentProgress.interactionsCompleted

    const newProgressPercentage = Math.min(100, (updatedSections.length / currentProgress.totalSections) * 100)
    const newTimeSpent = currentProgress.timeSpentMinutes + (update.timeSpent || 0)
    const newMistakes = currentProgress.mistakesMade + (update.mistakesMade || 0)
    const newXP = currentProgress.xpEarned + (update.xpEarned || 0)
    const voiceUsed = currentProgress.voiceCoachingUsed || (update.voiceCoachingUsed || false)

    // Determine completion status
    let status: CompletionStatus = currentProgress.status
    if (newProgressPercentage === 100) {
      status = 'completed'
    } else if (newProgressPercentage > 0) {
      status = 'in_progress'
    }

    // Update in database
    const { data, error } = await supabase
      .from('lessons')
      .update({
        progress_percentage: newProgressPercentage,
        time_spent_minutes: newTimeSpent,
        mistakes_made: newMistakes,
        xp_earned: newXP,
        voice_coaching_used: voiceUsed,
        peer_interactions_count: updatedInteractions.length,
        completion_status: status,
        content: {
          ...currentProgress,
          sectionsCompleted: updatedSections,
          interactionsCompleted: updatedInteractions
        },
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('id', lessonId)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Award XP to user profile if lesson completed
    if (status === 'completed' && currentProgress.status !== 'completed' && newXP > 0) {
      await userProfileOperations.updateXP(userId, newXP)
    }

    // Return updated progress
    return await getLessonProgress(userId, lessonId)

  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return null
  }
}

/**
 * Mark section as completed
 */
export async function completeLessonSection(
  userId: string,
  lessonId: string,
  sectionId: string,
  timeSpent: number = 0,
  xpReward: number = 10
): Promise<LessonProgress | null> {
  return updateLessonProgress(userId, lessonId, {
    sectionId,
    timeSpent,
    xpEarned: xpReward
  })
}

/**
 * Record peer interaction completion
 */
export async function completePeerInteraction(
  userId: string,
  lessonId: string,
  interactionId: string,
  xpReward: number = 25
): Promise<LessonProgress | null> {
  return updateLessonProgress(userId, lessonId, {
    interactionId,
    xpEarned: xpReward
  })
}

/**
 * Record voice coaching usage
 */
export async function recordVoiceCoachingUsage(
  userId: string,
  lessonId: string,
  timeSpent: number = 1
): Promise<LessonProgress | null> {
  return updateLessonProgress(userId, lessonId, {
    voiceCoachingUsed: true,
    timeSpent
  })
}

/**
 * Record mistake made during lesson
 */
export async function recordLessonMistake(
  userId: string,
  lessonId: string,
  mistakeCount: number = 1
): Promise<LessonProgress | null> {
  return updateLessonProgress(userId, lessonId, {
    mistakesMade: mistakeCount
  })
}

/**
 * Get user's lesson history
 */
export async function getUserLessonHistory(
  userId: string,
  limit: number = 10
): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error getting lesson history:', error)
    return []
  }
}

/**
 * Get lesson statistics for a user
 */
export async function getLessonStats(userId: string): Promise<{
  totalLessons: number
  completedLessons: number
  totalTimeSpent: number
  totalXPEarned: number
  averageProgress: number
  peerInteractionsCount: number
  voiceCoachingUsage: number
}> {
  try {
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('completion_status, time_spent_minutes, xp_earned, progress_percentage, peer_interactions_count, voice_coaching_used')
      .eq('user_id', userId)

    if (error) {
      throw error
    }


    const completed = lessons.filter(l => l.completion_status === 'completed')
    const totalTime = lessons.reduce((sum, l) => sum + l.time_spent_minutes, 0)
    const totalXP = lessons.reduce((sum, l) => sum + l.xp_earned, 0)
    const avgProgress = lessons.length > 0
      ? lessons.reduce((sum, l) => sum + l.progress_percentage, 0) / lessons.length
      : 0
    const totalInteractions = lessons.reduce((sum, l) => sum + l.peer_interactions_count, 0)
    const voiceUsage = lessons.filter(l => l.voice_coaching_used).length

    return {
      totalLessons: lessons.length,
      completedLessons: completed.length,
      totalTimeSpent: totalTime,
      totalXPEarned: totalXP,
      averageProgress: Math.round(avgProgress),
      peerInteractionsCount: totalInteractions,
      voiceCoachingUsage: voiceUsage
    }
  } catch (error) {
    console.error('Error getting lesson stats:', error)
    return {
      totalLessons: 0,
      completedLessons: 0,
      totalTimeSpent: 0,
      totalXPEarned: 0,
      averageProgress: 0,
      peerInteractionsCount: 0,
      voiceCoachingUsage: 0
    }
  }
}

/**
 * Resume lesson from last position
 */
export async function resumeLesson(
  userId: string,
  lessonId: string
): Promise<{ sectionIndex: number; progress: LessonProgress } | null> {
  try {
    const progress = await getLessonProgress(userId, lessonId)
    if (!progress) {
      return null
    }

    // Update last accessed time
    await supabase
      .from('lessons')
      .update({ updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('id', lessonId)

    return {
      sectionIndex: progress.currentSection,
      progress
    }
  } catch (error) {
    console.error('Error resuming lesson:', error)
    return null
  }
}