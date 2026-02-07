/**
 * Lesson Recommendation Engine
 * AI-powered lesson recommendation algorithm with peer personality integration
 * Requirements: 21.17, 23.4
 */

import type { UserProfile, KnowledgeGraphNode, LearningActivity, AIPeerProfile } from '@/types/database'

export interface LessonMetadata {
  id: string
  title: string
  description: string
  topic: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string // e.g., "2.5 hours"
  durationMinutes: number
  prerequisites: string[]
  learningObjectives: string[]
  tags: string[]
  category: string
  xpReward: number
  thumbnail?: string
}

export interface RecommendedLesson extends LessonMetadata {
  recommendedBy: string // AI peer ID
  recommendationReason: string
  relevanceScore: number
  difficultyMatch: number
  prerequisitesMet: boolean
}

export interface RecommendationContext {
  userProfile: UserProfile
  knowledgeGraph: KnowledgeGraphNode[]
  recentActivities: LearningActivity[]
  aiPeers: AIPeerProfile[]
  mistakePatterns?: Array<{ error_type: string; frequency: number }>
}

/**
 * Calculate relevance score based on user behavior and content
 */
export function calculateRelevanceScore(
  lesson: LessonMetadata,
  context: RecommendationContext
): number {
  let score = 0
  
  // Factor 1: Skill level match (0-30 points)
  const skillLevelMatch = getSkillLevelMatch(lesson.difficulty, context.userProfile.skill_level)
  score += skillLevelMatch * 30
  
  // Factor 2: Topic alignment with primary domain (0-25 points)
  const topicAlignment = getTopicAlignment(lesson.topic, context.userProfile.primary_domain)
  score += topicAlignment * 25
  
  // Factor 3: Learning goal alignment (0-20 points)
  const goalAlignment = getGoalAlignment(lesson, context.userProfile.learning_goal)
  score += goalAlignment * 20
  
  // Factor 4: Recent activity patterns (0-15 points)
  const activityAlignment = getActivityAlignment(lesson, context.recentActivities)
  score += activityAlignment * 15
  
  // Factor 5: Mistake pattern relevance (0-10 points)
  if (context.mistakePatterns) {
    const mistakeRelevance = getMistakeRelevance(lesson, context.mistakePatterns)
    score += mistakeRelevance * 10
  }
  
  return Math.min(100, Math.max(0, score))
}

/**
 * Match lesson difficulty with user skill level
 */
function getSkillLevelMatch(
  lessonDifficulty: 'beginner' | 'intermediate' | 'advanced',
  userSkillLevel: string
): number {
  const difficultyMap: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3
  }
  
  const lessonLevel = difficultyMap[lessonDifficulty] || 2
  const userLevel = difficultyMap[userSkillLevel] || 2
  
  // Perfect match = 1.0, one level off = 0.7, two levels off = 0.3
  const diff = Math.abs(lessonLevel - userLevel)
  if (diff === 0) return 1.0
  if (diff === 1) return 0.7
  return 0.3
}

/**
 * Calculate topic alignment with user's primary domain
 */
function getTopicAlignment(lessonTopic: string, primaryDomain: string): number {
  const topicLower = lessonTopic.toLowerCase()
  const domainLower = primaryDomain.toLowerCase()
  
  // Direct match
  if (topicLower.includes(domainLower) || domainLower.includes(topicLower)) {
    return 1.0
  }
  
  // Related topics
  const relatedTopics: Record<string, string[]> = {
    javascript: ['react', 'node', 'typescript', 'web', 'frontend'],
    python: ['django', 'flask', 'data', 'ml', 'backend'],
    java: ['spring', 'android', 'backend', 'enterprise'],
    web: ['html', 'css', 'javascript', 'react', 'frontend']
  }
  
  const related = relatedTopics[domainLower] || []
  if (related.some(r => topicLower.includes(r))) {
    return 0.7
  }
  
  return 0.3
}

/**
 * Align lesson with user's learning goal
 */
function getGoalAlignment(lesson: LessonMetadata, learningGoal: string): number {
  const goalLower = learningGoal.toLowerCase()
  
  if (goalLower === 'learning') {
    // Prefer foundational and comprehensive lessons
    return lesson.difficulty === 'beginner' ? 1.0 : 0.7
  }
  
  if (goalLower === 'projects') {
    // Prefer practical, project-based lessons
    const projectKeywords = ['build', 'create', 'project', 'app', 'application']
    const hasProjectKeyword = projectKeywords.some(kw => 
      lesson.title.toLowerCase().includes(kw) || 
      lesson.description.toLowerCase().includes(kw)
    )
    return hasProjectKeyword ? 1.0 : 0.5
  }
  
  if (goalLower === 'placement' || goalLower === 'interview') {
    // Prefer algorithm, data structure, system design lessons
    const interviewKeywords = ['algorithm', 'data structure', 'system design', 'interview', 'coding challenge']
    const hasInterviewKeyword = interviewKeywords.some(kw => 
      lesson.title.toLowerCase().includes(kw) || 
      lesson.description.toLowerCase().includes(kw)
    )
    return hasInterviewKeyword ? 1.0 : 0.4
  }
  
  if (goalLower === 'productivity') {
    // Prefer advanced patterns, tools, best practices
    return lesson.difficulty === 'advanced' ? 1.0 : 0.6
  }
  
  return 0.5
}

/**
 * Calculate alignment with recent activity patterns
 */
function getActivityAlignment(lesson: LessonMetadata, recentActivities: LearningActivity[]): number {
  if (!recentActivities || recentActivities.length === 0) return 0.5
  
  // Check if lesson topic appears in recent activities
  const recentTopics = recentActivities
    .slice(0, 10)
    .map(a => a.content_id || '')
    .filter(Boolean)
  
  // If user has been working on related topics, recommend continuation
  const topicMatch = recentTopics.some(topic => 
    lesson.topic.toLowerCase().includes(topic.toLowerCase()) ||
    topic.toLowerCase().includes(lesson.topic.toLowerCase())
  )
  
  return topicMatch ? 0.8 : 0.5
}

/**
 * Calculate relevance based on user's mistake patterns
 */
function getMistakeRelevance(
  lesson: LessonMetadata,
  mistakePatterns: Array<{ error_type: string; frequency: number }>
): number {
  if (!mistakePatterns || mistakePatterns.length === 0) return 0.5
  
  // Check if lesson addresses common mistakes
  const relevantMistakes = mistakePatterns.filter(pattern => 
    lesson.tags.some(tag => 
      pattern.error_type.toLowerCase().includes(tag.toLowerCase()) ||
      tag.toLowerCase().includes(pattern.error_type.toLowerCase())
    )
  )
  
  if (relevantMistakes.length === 0) return 0.3
  
  // Weight by frequency
  const totalFrequency = mistakePatterns.reduce((sum, p) => sum + p.frequency, 0)
  const relevantFrequency = relevantMistakes.reduce((sum, p) => sum + p.frequency, 0)
  
  return Math.min(1.0, relevantFrequency / totalFrequency)
}

/**
 * Check if user has completed prerequisites
 */
export function checkPrerequisites(
  lesson: LessonMetadata,
  knowledgeGraph: KnowledgeGraphNode[]
): boolean {
  if (!lesson.prerequisites || lesson.prerequisites.length === 0) return true
  
  const completedConcepts = knowledgeGraph
    .filter(node => node.status === 'mastered')
    .map(node => node.concept.toLowerCase())
  
  return lesson.prerequisites.every(prereq => 
    completedConcepts.some(concept => 
      concept.includes(prereq.toLowerCase()) || 
      prereq.toLowerCase().includes(concept)
    )
  )
}

/**
 * Assign AI peer recommendation based on lesson and peer specialty
 */
export function assignPeerRecommendation(
  lesson: LessonMetadata,
  aiPeers: AIPeerProfile[]
): { peerId: string; reason: string } {
  if (!aiPeers || aiPeers.length === 0) {
    return { peerId: 'sarah', reason: 'General recommendation' }
  }
  
  // Match lesson difficulty with peer skill level
  const difficultyToPeerLevel: Record<string, string> = {
    beginner: 'beginner',
    intermediate: 'intermediate',
    advanced: 'advanced'
  }
  
  const targetLevel = difficultyToPeerLevel[lesson.difficulty]
  
  // Find peers matching the skill level
  const matchingPeers = aiPeers.filter(peer => peer.skill_level === targetLevel)
  
  if (matchingPeers.length > 0) {
    const peer = matchingPeers[0]
    const reasons: Record<string, string> = {
      curious: `${peer.name} thinks this will answer your questions about ${lesson.topic}`,
      analytical: `${peer.name} recommends this for deep understanding of ${lesson.topic}`,
      supportive: `${peer.name} believes this will help you master ${lesson.topic}`,
      competitive: `${peer.name} challenges you to tackle ${lesson.topic}`,
      mentor: `${peer.name} suggests this as the next step in your journey`,
      challenger: `${peer.name} thinks you're ready for ${lesson.topic}`,
      peer: `${peer.name} wants to learn ${lesson.topic} together`,
      specialist: `${peer.name} is an expert in ${lesson.topic} and recommends this`
    }
    
    return {
      peerId: peer.id,
      reason: reasons[peer.personality] || `${peer.name} recommends this lesson`
    }
  }
  
  // Fallback to first available peer
  const peer = aiPeers[0]
  return {
    peerId: peer.id,
    reason: `${peer.name} suggests exploring ${lesson.topic}`
  }
}

/**
 * Generate personalized lesson recommendations
 */
export function generateRecommendations(
  availableLessons: LessonMetadata[],
  context: RecommendationContext,
  count: number = 3
): RecommendedLesson[] {
  // Calculate relevance scores for all lessons
  const scoredLessons = availableLessons.map(lesson => {
    const relevanceScore = calculateRelevanceScore(lesson, context)
    const prerequisitesMet = checkPrerequisites(lesson, context.knowledgeGraph)
    const difficultyMatch = getSkillLevelMatch(lesson.difficulty, context.userProfile.skill_level)
    const peerRecommendation = assignPeerRecommendation(lesson, context.aiPeers)
    
    return {
      ...lesson,
      recommendedBy: peerRecommendation.peerId,
      recommendationReason: peerRecommendation.reason,
      relevanceScore,
      difficultyMatch,
      prerequisitesMet
    }
  })
  
  // Filter out lessons with unmet prerequisites
  const eligibleLessons = scoredLessons.filter(lesson => lesson.prerequisitesMet)
  
  // Sort by relevance score (descending)
  const sortedLessons = eligibleLessons.sort((a, b) => b.relevanceScore - a.relevanceScore)
  
  // Return top N recommendations
  return sortedLessons.slice(0, count)
}

/**
 * Refresh recommendations based on recent activity
 */
export function refreshRecommendations(
  currentRecommendations: RecommendedLesson[],
  newActivity: LearningActivity,
  context: RecommendationContext
): RecommendedLesson[] {
  // Add new activity to context
  const updatedContext = {
    ...context,
    recentActivities: [newActivity, ...context.recentActivities]
  }
  
  // Filter out completed lessons
  const availableLessons = currentRecommendations.filter(
    lesson => lesson.id !== newActivity.content_id
  )
  
  // If we need more recommendations, generate new ones
  if (availableLessons.length < 3) {
    // This would fetch more lessons from the database
    // For now, return what we have
    return availableLessons
  }
  
  // Recalculate scores for remaining lessons
  return availableLessons.map(lesson => ({
    ...lesson,
    relevanceScore: calculateRelevanceScore(lesson, updatedContext)
  })).sort((a, b) => b.relevanceScore - a.relevanceScore)
}
