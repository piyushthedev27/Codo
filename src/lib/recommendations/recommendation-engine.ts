/**
 * Recommendation Engine Backend
 * Implements user behavior analysis, collaborative filtering, and content-based filtering
 * Requirements: 23.4
 */

import type { UserProfile, KnowledgeGraphNode, LearningActivity, AIPeerProfile } from '@/types/database'
import type { LessonMetadata, RecommendedLesson, RecommendationContext } from './lesson-recommender'
import { generateRecommendations, calculateRelevanceScore } from './lesson-recommender'

/**
 * User behavior patterns extracted from activity history
 */
export interface UserBehaviorProfile {
  preferredTopics: Array<{ topic: string; frequency: number }>
  averageSessionDuration: number
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced'
  learningVelocity: number // lessons per week
  engagementScore: number // 0-100
  peakLearningTimes: string[] // e.g., ['morning', 'evening']
  completionRate: number // 0-1
  mistakePatterns: Array<{ error_type: string; frequency: number; resolved: boolean }>
}

/**
 * Collaborative filtering data structure
 */
export interface CollaborativeFilteringData {
  userId: string
  similarUsers: Array<{ userId: string; similarityScore: number }>
  popularLessons: Array<{ lessonId: string; completionCount: number; avgRating: number }>
}

/**
 * Content-based filtering features
 */
export interface ContentFeatures {
  lessonId: string
  topicVector: number[] // Topic embeddings
  difficultyScore: number
  durationMinutes: number
  prerequisiteCount: number
  tags: string[]
}

/**
 * Analyze user behavior from activity history
 */
export function analyzeUserBehavior(
  activities: LearningActivity[],
  profile: UserProfile
): UserBehaviorProfile {
  if (!activities || activities.length === 0) {
    return {
      preferredTopics: [],
      averageSessionDuration: 30,
      preferredDifficulty: profile.skill_level as 'beginner' | 'intermediate' | 'advanced',
      learningVelocity: 0,
      engagementScore: 50,
      peakLearningTimes: ['evening'],
      completionRate: 0,
      mistakePatterns: []
    }
  }

  // Extract preferred topics
  const topicFrequency = new Map<string, number>()
  activities.forEach(activity => {
    if (activity.content_id) {
      const count = topicFrequency.get(activity.content_id) || 0
      topicFrequency.set(activity.content_id, count + 1)
    }
  })
  
  const preferredTopics = Array.from(topicFrequency.entries())
    .map(([topic, frequency]) => ({ topic, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5)

  // Calculate average session duration
  const totalDuration = activities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0)
  const averageSessionDuration = activities.length > 0 ? totalDuration / activities.length : 30

  // Determine preferred difficulty based on completion patterns
  const completedActivities = activities.filter(a => 
    a.activity_type === 'lesson' || a.activity_type === 'challenge'
  )
  const preferredDifficulty = profile.skill_level as 'beginner' | 'intermediate' | 'advanced'

  // Calculate learning velocity (lessons per week)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const recentActivities = activities.filter(a => 
    new Date(a.created_at) > oneWeekAgo
  )
  const learningVelocity = recentActivities.length

  // Calculate engagement score
  const engagementScore = calculateEngagementScore(activities, profile)

  // Determine peak learning times
  const peakLearningTimes = determinePeakLearningTimes(activities)

  // Calculate completion rate
  const startedLessons = activities.filter(a => 
    a.activity_type === 'lesson'
  ).length
  const completedLessons = activities.filter(a => 
    a.activity_type === 'lesson' && a.completion_percentage === 100
  ).length
  const completionRate = startedLessons > 0 ? completedLessons / startedLessons : 0

  // Extract mistake patterns (would come from mistake_patterns table in real implementation)
  const mistakePatterns: Array<{ error_type: string; frequency: number; resolved: boolean }> = []

  return {
    preferredTopics,
    averageSessionDuration,
    preferredDifficulty,
    learningVelocity,
    engagementScore,
    peakLearningTimes,
    completionRate,
    mistakePatterns
  }
}

/**
 * Calculate user engagement score
 */
function calculateEngagementScore(activities: LearningActivity[], profile: UserProfile): number {
  let score = 0

  // Factor 1: Activity frequency (0-30 points)
  const recentActivityCount = activities.filter(a => {
    const activityDate = new Date(a.created_at)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return activityDate > oneWeekAgo
  }).length
  score += Math.min(30, recentActivityCount * 3)

  // Factor 2: Streak (0-25 points)
  score += Math.min(25, profile.learning_streak * 2.5)

  // Factor 3: XP progression (0-25 points)
  const xpScore = Math.min(25, (profile.current_xp / 1000) * 25)
  score += xpScore

  // Factor 4: Variety of activities (0-20 points)
  const activityTypes = new Set(activities.map(a => a.activity_type))
  score += Math.min(20, activityTypes.size * 5)

  return Math.min(100, score)
}

/**
 * Determine peak learning times from activity timestamps
 */
function determinePeakLearningTimes(activities: LearningActivity[]): string[] {
  const timeSlots = {
    morning: 0,   // 6-12
    afternoon: 0, // 12-18
    evening: 0,   // 18-24
    night: 0      // 0-6
  }

  activities.forEach(activity => {
    const hour = new Date(activity.created_at).getHours()
    if (hour >= 6 && hour < 12) timeSlots.morning++
    else if (hour >= 12 && hour < 18) timeSlots.afternoon++
    else if (hour >= 18 && hour < 24) timeSlots.evening++
    else timeSlots.night++
  })

  const sortedSlots = Object.entries(timeSlots)
    .sort(([, a], [, b]) => b - a)
    .map(([slot]) => slot)

  return sortedSlots.slice(0, 2)
}

/**
 * Collaborative filtering: Find similar users and their preferences
 */
export function collaborativeFiltering(
  userId: string,
  allUsers: Array<{ userId: string; activities: LearningActivity[]; profile: UserProfile }>,
  currentUserActivities: LearningActivity[]
): CollaborativeFilteringData {
  // Calculate similarity with other users
  const similarUsers = allUsers
    .filter(u => u.userId !== userId)
    .map(user => ({
      userId: user.userId,
      similarityScore: calculateUserSimilarity(currentUserActivities, user.activities)
    }))
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 10)

  // Find popular lessons among similar users
  const lessonCounts = new Map<string, { count: number; ratings: number[] }>()
  
  similarUsers.forEach(({ userId: similarUserId }) => {
    const similarUser = allUsers.find(u => u.userId === similarUserId)
    if (similarUser) {
      similarUser.activities.forEach(activity => {
        if (activity.content_id) {
          const current = lessonCounts.get(activity.content_id) || { count: 0, ratings: [] }
          lessonCounts.set(activity.content_id, {
            count: current.count + 1,
            ratings: [...current.ratings, activity.xp_earned || 0]
          })
        }
      })
    }
  })

  const popularLessons = Array.from(lessonCounts.entries())
    .map(([lessonId, data]) => ({
      lessonId,
      completionCount: data.count,
      avgRating: data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length
    }))
    .sort((a, b) => b.completionCount - a.completionCount)
    .slice(0, 10)

  return {
    userId,
    similarUsers,
    popularLessons
  }
}

/**
 * Calculate similarity between two users based on their activities
 */
function calculateUserSimilarity(
  activities1: LearningActivity[],
  activities2: LearningActivity[]
): number {
  // Extract content IDs from both users
  const content1 = new Set(activities1.map(a => a.content_id).filter(Boolean))
  const content2 = new Set(activities2.map(a => a.content_id).filter(Boolean))

  // Calculate Jaccard similarity
  const intersection = new Set([...content1].filter(x => content2.has(x)))
  const union = new Set([...content1, ...content2])

  if (union.size === 0) return 0
  return intersection.size / union.size
}

/**
 * Content-based filtering: Extract features from lessons
 */
export function extractContentFeatures(lesson: LessonMetadata): ContentFeatures {
  // Simple topic vectorization (in production, use embeddings)
  const topicVector = lesson.tags.map(tag => tag.charCodeAt(0) / 255)

  const difficultyScores = {
    beginner: 0.33,
    intermediate: 0.66,
    advanced: 1.0
  }

  return {
    lessonId: lesson.id,
    topicVector,
    difficultyScore: difficultyScores[lesson.difficulty],
    durationMinutes: lesson.durationMinutes,
    prerequisiteCount: lesson.prerequisites.length,
    tags: lesson.tags
  }
}

/**
 * Calculate content similarity between two lessons
 */
export function calculateContentSimilarity(
  features1: ContentFeatures,
  features2: ContentFeatures
): number {
  // Tag overlap
  const tags1 = new Set(features1.tags)
  const tags2 = new Set(features2.tags)
  const tagIntersection = new Set([...tags1].filter(x => tags2.has(x)))
  const tagSimilarity = tagIntersection.size / Math.max(tags1.size, tags2.size)

  // Difficulty similarity
  const difficultySimilarity = 1 - Math.abs(features1.difficultyScore - features2.difficultyScore)

  // Duration similarity (normalized)
  const durationDiff = Math.abs(features1.durationMinutes - features2.durationMinutes)
  const durationSimilarity = Math.max(0, 1 - durationDiff / 180) // 180 min = 3 hours

  // Weighted average
  return (tagSimilarity * 0.5) + (difficultySimilarity * 0.3) + (durationSimilarity * 0.2)
}

/**
 * Assign peer recommendations based on lesson specialty matching
 */
export function assignPeerRecommendations(
  recommendations: RecommendedLesson[],
  aiPeers: AIPeerProfile[],
  userBehavior: UserBehaviorProfile
): RecommendedLesson[] {
  return recommendations.map(lesson => {
    // Find best matching peer based on specialty and lesson topic
    const matchingPeer = findBestMatchingPeer(lesson, aiPeers, userBehavior)
    
    return {
      ...lesson,
      recommendedBy: matchingPeer.id,
      recommendationReason: generateRecommendationReason(lesson, matchingPeer, userBehavior)
    }
  })
}

/**
 * Find the best matching AI peer for a lesson
 */
function findBestMatchingPeer(
  lesson: LessonMetadata,
  aiPeers: AIPeerProfile[],
  userBehavior: UserBehaviorProfile
): AIPeerProfile {
  if (!aiPeers || aiPeers.length === 0) {
    // Return default peer
    return {
      id: 'sarah',
      user_id: '',
      name: 'Sarah',
      personality: 'curious',
      skill_level: 'beginner',
      avatar_url: '/images/avatars/sarah-3d.png',
      common_mistakes: [],
      interaction_style: '',
      backstory: '',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  // Match based on difficulty and personality
  const difficultyToPeerLevel: Record<string, string> = {
    beginner: 'beginner',
    intermediate: 'intermediate',
    advanced: 'advanced'
  }

  const targetLevel = difficultyToPeerLevel[lesson.difficulty]
  const matchingPeers = aiPeers.filter(peer => peer.skill_level === targetLevel)

  if (matchingPeers.length > 0) {
    // Rotate through matching peers for variety
    const index = Math.floor(Math.random() * matchingPeers.length)
    return matchingPeers[index]
  }

  // Fallback to first peer
  return aiPeers[0]
}

/**
 * Generate personalized recommendation reason
 */
function generateRecommendationReason(
  lesson: LessonMetadata,
  peer: AIPeerProfile,
  userBehavior: UserBehaviorProfile
): string {
  const reasons: Record<string, string[]> = {
    curious: [
      `${peer.name} thinks this will answer your questions about ${lesson.topic}`,
      `${peer.name} is curious about ${lesson.topic} and wants to explore it with you`,
      `${peer.name} believes this will help you understand ${lesson.topic} better`
    ],
    analytical: [
      `${peer.name} recommends this for deep understanding of ${lesson.topic}`,
      `${peer.name} has analyzed your progress and suggests ${lesson.topic}`,
      `${peer.name} thinks you're ready to master ${lesson.topic}`
    ],
    supportive: [
      `${peer.name} believes this will help you grow in ${lesson.topic}`,
      `${peer.name} is here to support you through ${lesson.topic}`,
      `${peer.name} knows you can succeed with ${lesson.topic}`
    ],
    competitive: [
      `${peer.name} challenges you to tackle ${lesson.topic}`,
      `${peer.name} thinks you can beat this ${lesson.topic} challenge`,
      `${peer.name} wants to see you excel at ${lesson.topic}`
    ],
    mentor: [
      `${peer.name} suggests this as your next step in ${lesson.topic}`,
      `${peer.name} has guided many through ${lesson.topic}`,
      `${peer.name} recommends ${lesson.topic} based on your journey`
    ],
    challenger: [
      `${peer.name} thinks you're ready for ${lesson.topic}`,
      `${peer.name} challenges you to push your limits with ${lesson.topic}`,
      `${peer.name} believes ${lesson.topic} will level up your skills`
    ],
    peer: [
      `${peer.name} wants to learn ${lesson.topic} together`,
      `${peer.name} is excited to explore ${lesson.topic} with you`,
      `${peer.name} thinks ${lesson.topic} would be fun to learn together`
    ],
    specialist: [
      `${peer.name} is an expert in ${lesson.topic} and highly recommends this`,
      `${peer.name} specializes in ${lesson.topic} and thinks you'll love it`,
      `${peer.name} has mastered ${lesson.topic} and wants to share it`
    ]
  }

  const personalityReasons = reasons[peer.personality] || reasons.curious
  const index = Math.floor(Math.random() * personalityReasons.length)
  return personalityReasons[index]
}

/**
 * Refresh recommendations based on new activity
 */
export function refreshRecommendationsEngine(
  currentRecommendations: RecommendedLesson[],
  newActivity: LearningActivity,
  context: RecommendationContext,
  availableLessons: LessonMetadata[]
): RecommendedLesson[] {
  // Update context with new activity
  const updatedContext = {
    ...context,
    recentActivities: [newActivity, ...context.recentActivities]
  }

  // Analyze updated behavior
  const userBehavior = analyzeUserBehavior(updatedContext.recentActivities, context.userProfile)

  // Filter out completed lesson
  const remainingLessons = availableLessons.filter(
    lesson => lesson.id !== newActivity.content_id
  )

  // Generate fresh recommendations
  const newRecommendations = generateRecommendations(remainingLessons, updatedContext, 3)

  // Assign peer recommendations
  return assignPeerRecommendations(newRecommendations, context.aiPeers, userBehavior)
}

/**
 * Main recommendation engine that combines all strategies
 */
export function generateHybridRecommendations(
  availableLessons: LessonMetadata[],
  context: RecommendationContext,
  collaborativeData?: CollaborativeFilteringData,
  count: number = 3
): RecommendedLesson[] {
  // Analyze user behavior
  const userBehavior = analyzeUserBehavior(context.recentActivities, context.userProfile)

  // Generate content-based recommendations
  const contentBasedRecs = generateRecommendations(availableLessons, context, count * 2)

  // If collaborative data is available, boost popular lessons
  if (collaborativeData) {
    contentBasedRecs.forEach(rec => {
      const popularLesson = collaborativeData.popularLessons.find(
        pl => pl.lessonId === rec.id
      )
      if (popularLesson) {
        // Boost score based on popularity
        rec.relevanceScore = rec.relevanceScore * 0.7 + (popularLesson.completionCount / 10) * 0.3
      }
    })
  }

  // Re-sort after boosting
  const sortedRecs = contentBasedRecs.sort((a, b) => b.relevanceScore - a.relevanceScore)

  // Take top N and assign peer recommendations
  const topRecs = sortedRecs.slice(0, count)
  return assignPeerRecommendations(topRecs, context.aiPeers, userBehavior)
}
