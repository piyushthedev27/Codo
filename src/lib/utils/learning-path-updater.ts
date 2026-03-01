/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Learning Path Updater for Mistake-Driven Learning
 * 
 * This module updates user learning paths based on their mistake patterns
 * to provide personalized, adaptive learning experiences.
 */

import { MistakePattern, MistakeAnalysis } from './mistake-pattern-tracker'
import { ParsedError } from './error-parsing'
import { supabase } from '../database/supabase-client'

export interface LearningPath {
  id: string
  userId: string
  currentFocus: string[]
  priorityTopics: LearningTopic[]
  recommendedLessons: RecommendedLesson[]
  knowledgeGaps: KnowledgeGap[]
  adaptiveAdjustments: AdaptiveAdjustment[]
  progressMilestones: ProgressMilestone[]
  lastUpdated: Date
  metadata: {
    mistakeBasedAdjustments: number
    totalAdjustments: number
    learningVelocity: number
    confidenceScore: number
  }
}

export interface LearningTopic {
  id: string
  name: string
  category: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimatedDuration: number
  prerequisites: string[]
  relatedMistakes: string[]
  masteryLevel: number // 0-100
  lastPracticed?: Date
  difficultyLevel: 1 | 2 | 3 | 4 | 5
}

export interface RecommendedLesson {
  id: string
  title: string
  type: 'micro-lesson' | 'practice-challenge' | 'concept-review' | 'voice-coaching' | 'collaborative-coding'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  estimatedDuration: number
  targetMistakes: string[]
  learningObjectives: string[]
  xpReward: number
  unlockConditions?: string[]
  adaptiveReason: string
}

export interface KnowledgeGap {
  id: string
  concept: string
  category: string
  severity: 'critical' | 'major' | 'minor'
  evidenceMistakes: string[]
  suggestedResources: string[]
  estimatedTimeToFill: number
  dependencies: string[]
}

export interface AdaptiveAdjustment {
  id: string
  timestamp: Date
  adjustmentType: 'priority-boost' | 'topic-addition' | 'difficulty-adjustment' | 'pace-modification'
  reason: string
  triggerMistakes: string[]
  impact: string
  confidence: number
}

export interface ProgressMilestone {
  id: string
  title: string
  description: string
  targetDate: Date
  completed: boolean
  completedDate?: Date
  relatedTopics: string[]
  xpReward: number
}

/**
 * Update learning path based on new mistake
 */
export async function updateLearningPathFromMistake(
  userId: string,
  parsedError: ParsedError,
  mistakePattern: MistakePattern
): Promise<LearningPath> {
  try {
    // Get current learning path
    let _learningPath = await getLearningPath(userId)
    
    if (!_learningPath) {
      // Create initial learning path if none exists
      _learningPath = await createInitialLearningPath(userId)
    }

    // Analyze the mistake and determine adjustments
    const adjustments = await analyzeMistakeForPathAdjustments(parsedError, mistakePattern, _learningPath)

    // Apply adjustments to learning path
    const updatedPath = await applyPathAdjustments(_learningPath, adjustments)

    // Save updated learning path
    return await saveLearningPath(updatedPath)
  } catch (error) {
    console.error('Error updating learning path from mistake:', error)
    throw new Error('Failed to update learning path')
  }
}

/**
 * Update learning path based on comprehensive mistake analysis
 */
export async function updateLearningPathFromAnalysis(
  userId: string,
  mistakeAnalysis: MistakeAnalysis
): Promise<LearningPath> {
  try {
    let _learningPath = await getLearningPath(userId)
    
    if (!_learningPath) {
      _learningPath = await createInitialLearningPath(userId)
    }

    // Generate comprehensive adjustments based on analysis
    const adjustments = await generateComprehensiveAdjustments(mistakeAnalysis, _learningPath)

    // Apply all adjustments
    const updatedPath = await applyPathAdjustments(_learningPath, adjustments)

    // Update progress milestones based on trends
    updatedPath.progressMilestones = updateProgressMilestones(
      updatedPath.progressMilestones,
      mistakeAnalysis
    )

    return await saveLearningPath(updatedPath)
  } catch (error) {
    console.error('Error updating learning path from analysis:', error)
    throw new Error('Failed to update learning path from analysis')
  }
}

/**
 * Get current learning path for user
 */
async function getLearningPath(userId: string): Promise<LearningPath | null> {
  try {
    // For now, we'll store learning paths in the knowledge_graph_nodes table
    // In a full implementation, you'd have a dedicated learning_paths table
    const { data, error } = await supabase
      .from('knowledge_graph_nodes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) return null

    // Convert knowledge graph nodes to learning path format
    return convertKnowledgeGraphToLearningPath(userId, data)
  } catch (error) {
    console.error('Error getting learning path:', error)
    return null
  }
}

/**
 * Create initial learning path for new user
 */
async function createInitialLearningPath(userId: string): Promise<LearningPath> {
  const initialPath: LearningPath = {
    id: `path_${userId}_${Date.now()}`,
    userId,
    currentFocus: ['JavaScript Basics', 'Syntax Fundamentals'],
    priorityTopics: [
      {
        id: 'topic_js_syntax',
        name: 'JavaScript Syntax',
        category: 'Fundamentals',
        priority: 'high',
        estimatedDuration: 30,
        prerequisites: [],
        relatedMistakes: [],
        masteryLevel: 0,
        difficultyLevel: 1
      },
      {
        id: 'topic_variables',
        name: 'Variables and Scope',
        category: 'Fundamentals',
        priority: 'high',
        estimatedDuration: 45,
        prerequisites: ['topic_js_syntax'],
        relatedMistakes: [],
        masteryLevel: 0,
        difficultyLevel: 2
      }
    ],
    recommendedLessons: [],
    knowledgeGaps: [],
    adaptiveAdjustments: [],
    progressMilestones: [
      {
        id: 'milestone_basics',
        title: 'Master JavaScript Basics',
        description: 'Complete fundamental JavaScript concepts',
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        completed: false,
        relatedTopics: ['topic_js_syntax', 'topic_variables'],
        xpReward: 200
      }
    ],
    lastUpdated: new Date(),
    metadata: {
      mistakeBasedAdjustments: 0,
      totalAdjustments: 0,
      learningVelocity: 1.0,
      confidenceScore: 0.5
    }
  }

  return initialPath
}

/**
 * Analyze mistake for path adjustments
 */
async function analyzeMistakeForPathAdjustments(
  parsedError: ParsedError,
  mistakePattern: MistakePattern,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _learningPath: LearningPath
): Promise<AdaptiveAdjustment[]> {
  const adjustments: AdaptiveAdjustment[] = []

  // High-frequency mistakes get priority boost
  if (mistakePattern.frequency >= 3) {
    adjustments.push({
      id: `adj_priority_${Date.now()}`,
      timestamp: new Date(),
      adjustmentType: 'priority-boost',
      reason: `Frequent ${parsedError.errorType} errors (${mistakePattern.frequency} times)`,
      triggerMistakes: [parsedError.id],
      impact: `Boosted priority for ${parsedError.category} topics`,
      confidence: 0.9
    })
  }

  // New error categories get topic addition
  const hasRelatedTopic = learningPath.priorityTopics.some(topic =>
    topic.relatedMistakes.includes(parsedError.errorType) ||
    topic.category.toLowerCase().includes(parsedError.category.toLowerCase())
  )

  if (!hasRelatedTopic) {
    adjustments.push({
      id: `adj_topic_${Date.now()}`,
      timestamp: new Date(),
      adjustmentType: 'topic-addition',
      reason: `New error category detected: ${parsedError.category}`,
      triggerMistakes: [parsedError.id],
      impact: `Added ${parsedError.category} to learning topics`,
      confidence: 0.8
    })
  }

  // High severity errors get difficulty adjustment
  if (parsedError.severity === 'high') {
    adjustments.push({
      id: `adj_difficulty_${Date.now()}`,
      timestamp: new Date(),
      adjustmentType: 'difficulty-adjustment',
      reason: `High severity error requires foundational review`,
      triggerMistakes: [parsedError.id],
      impact: `Reduced difficulty level for related topics`,
      confidence: 0.7
    })
  }

  return adjustments
}

/**
 * Generate comprehensive adjustments from mistake analysis
 */
async function generateComprehensiveAdjustments(
  mistakeAnalysis: MistakeAnalysis,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _learningPath: LearningPath
): Promise<AdaptiveAdjustment[]> {
  const adjustments: AdaptiveAdjustment[] = []

  // Adjust based on improvement areas
  for (const area of mistakeAnalysis.improvementAreas) {
    adjustments.push({
      id: `adj_improvement_${Date.now()}_${area}`,
      timestamp: new Date(),
      adjustmentType: 'priority-boost',
      reason: `${area} identified as improvement area`,
      triggerMistakes: mistakeAnalysis.mostCommonErrors
        .filter(e => e.category === area)
        .map(e => e.errorType),
      impact: `Increased focus on ${area}`,
      confidence: 0.85
    })
  }

  // Adjust based on progress trend
  if (mistakeAnalysis.progressTrend.direction === 'declining') {
    adjustments.push({
      id: `adj_pace_${Date.now()}`,
      timestamp: new Date(),
      adjustmentType: 'pace-modification',
      reason: `Declining progress trend detected (${mistakeAnalysis.progressTrend.changePercentage}% increase in mistakes)`,
      triggerMistakes: mistakeAnalysis.mostCommonErrors.map(e => e.errorType),
      impact: 'Slowed learning pace and added review sessions',
      confidence: 0.75
    })
  }

  return adjustments
}

/**
 * Apply adjustments to learning path
 */
async function applyPathAdjustments(
  _learningPath: LearningPath,
  adjustments: AdaptiveAdjustment[]
): Promise<LearningPath> {
  const updatedPath = { ..._learningPath }

  for (const adjustment of adjustments) {
    switch (adjustment.adjustmentType) {
      case 'priority-boost':
        updatedPath.priorityTopics = boostTopicPriorities(
          updatedPath.priorityTopics,
          adjustment.triggerMistakes
        )
        break

      case 'topic-addition':
        updatedPath.priorityTopics = addNewTopics(
          updatedPath.priorityTopics,
          adjustment.triggerMistakes
        )
        break

      case 'difficulty-adjustment':
        updatedPath.priorityTopics = adjustTopicDifficulty(
          updatedPath.priorityTopics,
          adjustment.triggerMistakes
        )
        break

      case 'pace-modification':
        updatedPath.recommendedLessons = adjustLearningPace(
          updatedPath.recommendedLessons,
          adjustment.impact.includes('Slowed')
        )
        break
    }

    // Add adjustment to history
    updatedPath.adaptiveAdjustments.push(adjustment)
  }

  // Update metadata
  updatedPath.metadata.mistakeBasedAdjustments += adjustments.length
  updatedPath.metadata.totalAdjustments += adjustments.length
  updatedPath.lastUpdated = new Date()

  // Generate new recommended lessons based on updated priorities
  updatedPath.recommendedLessons = generateRecommendedLessons(updatedPath)

  // Update knowledge gaps
  updatedPath.knowledgeGaps = identifyKnowledgeGaps(updatedPath)

  return updatedPath
}

/**
 * Boost priority of topics related to frequent mistakes
 */
function boostTopicPriorities(
  topics: LearningTopic[],
  triggerMistakes: string[]
): LearningTopic[] {
  return topics.map(topic => {
    const hasRelatedMistake = triggerMistakes.some(mistake =>
      topic.relatedMistakes.includes(mistake) ||
      mistake.toLowerCase().includes(topic.name.toLowerCase())
    )

    if (hasRelatedMistake) {
      // Boost priority
      const priorityMap = { low: 'medium', medium: 'high', high: 'critical', critical: 'critical' }
      return {
        ...topic,
        priority: priorityMap[topic.priority] as any
      }
    }

    return topic
  })
}

/**
 * Add new topics based on mistake patterns
 */
function addNewTopics(
  existingTopics: LearningTopic[],
  triggerMistakes: string[]
): LearningTopic[] {
  const newTopics: LearningTopic[] = []

  // Map common mistake types to learning topics
  const mistakeToTopicMap: Record<string, Partial<LearningTopic>> = {
    'SyntaxError': {
      name: 'JavaScript Syntax Mastery',
      category: 'Fundamentals',
      priority: 'high',
      estimatedDuration: 25,
      difficultyLevel: 1
    },
    'ReferenceError': {
      name: 'Variable Scope and Declaration',
      category: 'Fundamentals',
      priority: 'high',
      estimatedDuration: 35,
      difficultyLevel: 2
    },
    'TypeError': {
      name: 'Data Types and Type Safety',
      category: 'Intermediate',
      priority: 'medium',
      estimatedDuration: 40,
      difficultyLevel: 3
    },
    'async': {
      name: 'Asynchronous JavaScript',
      category: 'Advanced',
      priority: 'medium',
      estimatedDuration: 60,
      difficultyLevel: 4
    }
  }

  for (const mistake of triggerMistakes) {
    for (const [mistakeType, topicTemplate] of Object.entries(mistakeToTopicMap)) {
      if (mistake.includes(mistakeType)) {
        const topicExists = existingTopics.some(topic =>
          topic.name === topicTemplate.name
        )

        if (!topicExists) {
          newTopics.push({
            id: `topic_${mistakeType.toLowerCase()}_${Date.now()}`,
            name: topicTemplate.name!,
            category: topicTemplate.category!,
            priority: topicTemplate.priority as any,
            estimatedDuration: topicTemplate.estimatedDuration!,
            prerequisites: [],
            relatedMistakes: [mistake],
            masteryLevel: 0,
            difficultyLevel: topicTemplate.difficultyLevel!
          })
        }
      }
    }
  }

  return [...existingTopics, ...newTopics]
}

/**
 * Adjust topic difficulty based on mistake patterns
 */
function adjustTopicDifficulty(
  topics: LearningTopic[],
  triggerMistakes: string[]
): LearningTopic[] {
  return topics.map(topic => {
    const hasRelatedMistake = triggerMistakes.some(mistake =>
      topic.relatedMistakes.includes(mistake)
    )

    if (hasRelatedMistake && topic.difficultyLevel > 1) {
      return {
        ...topic,
        difficultyLevel: Math.max(1, topic.difficultyLevel - 1) as any
      }
    }

    return topic
  })
}

/**
 * Adjust learning pace based on performance
 */
function adjustLearningPace(
  lessons: RecommendedLesson[],
  shouldSlowDown: boolean
): RecommendedLesson[] {
  return lessons.map(lesson => ({
    ...lesson,
    estimatedDuration: shouldSlowDown
      ? Math.round(lesson.estimatedDuration * 1.3)
      : lesson.estimatedDuration
  }))
}

/**
 * Generate recommended lessons based on learning path
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateRecommendedLessons(_learningPath: LearningPath): RecommendedLesson[] {
  const lessons: RecommendedLesson[] = []

  // Generate lessons for high-priority topics
  const highPriorityTopics = learningPath.priorityTopics
    .filter(topic => topic.priority === 'critical' || topic.priority === 'high')
    .slice(0, 5)

  for (const topic of highPriorityTopics) {
    lessons.push({
      id: `lesson_${topic.id}_${Date.now()}`,
      title: `Master ${topic.name}`,
      type: 'micro-lesson',
      priority: topic.priority === 'critical' ? 'urgent' : 'high',
      estimatedDuration: Math.round(topic.estimatedDuration * 0.6),
      targetMistakes: topic.relatedMistakes,
      learningObjectives: [
        `Understand ${topic.name} fundamentals`,
        `Apply ${topic.name} in practice`,
        `Avoid common ${topic.name} mistakes`
      ],
      xpReward: topic.difficultyLevel * 25,
      adaptiveReason: `High priority topic with ${topic.relatedMistakes.length} related mistakes`
    })

    // Add practice challenge for each topic
    lessons.push({
      id: `challenge_${topic.id}_${Date.now()}`,
      title: `Practice: ${topic.name}`,
      type: 'practice-challenge',
      priority: 'medium',
      estimatedDuration: Math.round(topic.estimatedDuration * 0.4),
      targetMistakes: topic.relatedMistakes,
      learningObjectives: [
        `Practice ${topic.name} skills`,
        `Build confidence with ${topic.name}`
      ],
      xpReward: topic.difficultyLevel * 35,
      adaptiveReason: `Practice reinforcement for ${topic.name}`
    })
  }

  return lessons.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

/**
 * Identify knowledge gaps based on learning path
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function identifyKnowledgeGaps(_learningPath: LearningPath): KnowledgeGap[] {
  const gaps: KnowledgeGap[] = []

  // Find topics with low mastery and related mistakes
  const problematicTopics = learningPath.priorityTopics.filter(
    topic => topic.masteryLevel < 50 && topic.relatedMistakes.length > 0
  )

  for (const topic of problematicTopics) {
    gaps.push({
      id: `gap_${topic.id}`,
      concept: topic.name,
      category: topic.category,
      severity: topic.priority === 'critical' ? 'critical' : 
                topic.priority === 'high' ? 'major' : 'minor',
      evidenceMistakes: topic.relatedMistakes,
      suggestedResources: [
        `${topic.name} micro-lesson`,
        `${topic.name} practice challenges`,
        `Voice coaching for ${topic.name}`
      ],
      estimatedTimeToFill: topic.estimatedDuration,
      dependencies: topic.prerequisites
    })
  }

  return gaps
}

/**
 * Update progress milestones based on mistake analysis
 */
function updateProgressMilestones(
  milestones: ProgressMilestone[],
  mistakeAnalysis: MistakeAnalysis
): ProgressMilestone[] {
  return milestones.map(milestone => {
    // Check if milestone should be marked as completed
    const relatedTopicsImproved = milestone.relatedTopics.every(topicId => {
      // Check if mistakes for this topic have decreased
      const relatedErrors = mistakeAnalysis.mostCommonErrors.filter(error =>
        error.errorType.toLowerCase().includes(topicId.toLowerCase())
      )
      return relatedErrors.length === 0 || relatedErrors.every(error => error.resolved)
    })

    if (relatedTopicsImproved && !milestone.completed) {
      return {
        ...milestone,
        completed: true,
        completedDate: new Date()
      }
    }

    return milestone
  })
}

/**
 * Convert knowledge graph nodes to learning path format
 */
function convertKnowledgeGraphToLearningPath(
  userId: string,
  nodes: any[]
): LearningPath {
  const priorityTopics: LearningTopic[] = nodes.map(node => ({
    id: node.id,
    name: node.concept,
    category: node.category || 'General',
    priority: node.status === 'in_progress' ? 'high' : 'medium',
    estimatedDuration: node.estimated_duration_minutes || 30,
    prerequisites: node.prerequisites || [],
    relatedMistakes: [],
    masteryLevel: node.mastery_percentage || 0,
    difficultyLevel: node.difficulty_level || 2
  }))

  return {
    id: `path_${userId}_converted`,
    userId,
    currentFocus: nodes
      .filter(node => node.status === 'in_progress')
      .map(node => node.concept)
      .slice(0, 3),
    priorityTopics,
    recommendedLessons: [],
    knowledgeGaps: [],
    adaptiveAdjustments: [],
    progressMilestones: [],
    lastUpdated: new Date(),
    metadata: {
      mistakeBasedAdjustments: 0,
      totalAdjustments: 0,
      learningVelocity: 1.0,
      confidenceScore: 0.6
    }
  }
}

/**
 * Save learning path to database
 */
async function saveLearningPath(_learningPath: LearningPath): Promise<LearningPath> {
  try {
    // For now, we'll update the knowledge graph nodes
    // In a full implementation, you'd have a dedicated learning_paths table
    
    for (const topic of learningPath.priorityTopics) {
      await supabase
        .from('knowledge_graph_nodes')
        .upsert({
          id: topic.id,
          user_id: learningPath.userId,
          concept: topic.name,
          category: topic.category,
          status: topic.masteryLevel > 80 ? 'mastered' : 
                  topic.masteryLevel > 0 ? 'in_progress' : 'locked',
          mastery_percentage: topic.masteryLevel,
          difficulty_level: topic.difficultyLevel,
          estimated_duration_minutes: topic.estimatedDuration,
          updated_at: new Date().toISOString()
        })
    }

    return _learningPath
  } catch (error) {
    console.error('Error saving learning path:', error)
    throw new Error('Failed to save learning path')
  }
}

/**
 * Get learning path summary for dashboard
 */
export async function getLearningPathSummary(userId: string): Promise<{
  currentFocus: string[]
  nextRecommendations: string[]
  progressPercentage: number
  adaptiveAdjustments: number
}> {
  try {
    const _learningPath = await getLearningPath(userId)
    
    if (!_learningPath) {
      return {
        currentFocus: [],
        nextRecommendations: [],
        progressPercentage: 0,
        adaptiveAdjustments: 0
      }
    }

    const nextRecommendations = learningPath.recommendedLessons
      .slice(0, 3)
      .map(lesson => lesson.title)

    const totalTopics = learningPath.priorityTopics.length
    const masteredTopics = learningPath.priorityTopics.filter(
      topic => topic.masteryLevel >= 80
    ).length
    
    const progressPercentage = totalTopics > 0 
      ? Math.round((masteredTopics / totalTopics) * 100)
      : 0

    return {
      currentFocus: learningPath.currentFocus,
      nextRecommendations,
      progressPercentage,
      adaptiveAdjustments: learningPath.metadata.mistakeBasedAdjustments
    }
  } catch (error) {
    console.error('Error getting learning path summary:', error)
    return {
      currentFocus: [],
      nextRecommendations: [],
      progressPercentage: 0,
      adaptiveAdjustments: 0
    }
  }
}