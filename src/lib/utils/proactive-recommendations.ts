/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Proactive Recommendations System
 * Generates intelligent recommendations based on user behavior and learning patterns
 */

import { supabase } from '@/lib/database/supabase-client'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { LearningActivity, _LearningInsight, UserProfile, KnowledgeGraphNode } from '@/types/database'
import { analyzeUserLearningPatterns, LearningPattern } from './pattern-detection'

export interface ProactiveRecommendation {
  id: string
  type: 'next_topic' | 'review_needed' | 'skill_gap' | 'optimization' | 'motivation'
  title: string
  description: string
  action: string
  priority: 'low' | 'medium' | 'high'
  confidence: number
  metadata: any
  expires_at: string
}

export interface RecommendationContext {
  userProfile: UserProfile
  recentActivities: LearningActivity[]
  _knowledgeGraph: KnowledgeGraphNode[]
  patterns: LearningPattern[]
  currentStreak: number
  weeklyXP: number
}

/**
 * Generate proactive recommendations for a user
 */
export async function generateProactiveRecommendations(userId: string): Promise<ProactiveRecommendation[]> {
  try {
    // Gather context data
    const _context = await gatherRecommendationContext(userId)

    if (!_context) {
      return getDefaultRecommendations()
    }

    const recommendations: ProactiveRecommendation[] = []

    // Generate different types of recommendations
    recommendations.push(...generateNextTopicRecommendations(_context))
    recommendations.push(...generateReviewRecommendations(_context))
    recommendations.push(...generateSkillGapRecommendations(_context))
    recommendations.push(...generateOptimizationRecommendations(_context))
    recommendations.push(...generateMotivationRecommendations(_context))

    // Sort by priority and confidence
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return b.confidence - a.confidence
      })
      .slice(0, 5) // Limit to top 5 recommendations

  } catch (error) {
    console.error('Error generating proactive recommendations:', error)
    return getDefaultRecommendations()
  }
}

/**
 * Gather all context needed for recommendations
 */
async function gatherRecommendationContext(userId: string): Promise<RecommendationContext | null> {
  try {
    // Get user profile
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!userProfile) return null

    // Get recent activities (last 14 days)
    const { data: recentActivities } = await supabase
      .from('enhanced_activities')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_timestamp', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order('activity_timestamp', { ascending: false })

    // Get knowledge graph
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: _knowledgeGraph } = await supabase
      .from('knowledge_graph_nodes')
      .select('*')
      .eq('user_id', userId)

    // Analyze patterns
    const { patterns } = await analyzeUserLearningPatterns(userId)

    // Calculate current streak and weekly XP
    const currentStreak = calculateCurrentStreak(recentActivities || [])
    const weeklyXP = calculateWeeklyXP(recentActivities || [])

    return {
      userProfile,
      recentActivities: recentActivities || [],
      _knowledgeGraph: knowledgeGraph || [],
      patterns,
      currentStreak,
      weeklyXP
    }
  } catch (error) {
    console.error('Error gathering recommendation _context:', error)
    return null
  }
}

/**
 * Generate next topic recommendations
 */
function generateNextTopicRecommendations(_context: RecommendationContext): ProactiveRecommendation[] {
  const recommendations: ProactiveRecommendation[] = []

  // Find unlocked but not started topics
  const availableTopics = context.knowledgeGraph.filter(node =>
    node.status === 'locked' && arePrerequisitesMet(node, context._knowledgeGraph)
  )

  if (availableTopics.length > 0) {
    const nextTopic = selectBestNextTopic(availableTopics, _context)

    recommendations.push({
      id: `next-topic-${nextTopic.id}`,
      type: 'next_topic',
      title: '🎯 Ready for Your Next Challenge',
      description: `You've mastered the prerequisites for "${nextTopic.concept}". This topic builds on your existing knowledge and fits your learning style.`,
      action: `Start learning ${nextTopic.concept}`,
      priority: 'high',
      confidence: 0.9,
      metadata: {
        topicId: nextTopic.id,
        concept: nextTopic.concept,
        prerequisites: nextTopic.prerequisites
      },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Suggest advanced topics for strong areas
  const strengthPattern = context.patterns.find(p => p.type === 'strength_identified')
  if (strengthPattern) {
    const advancedTopics = findAdvancedTopicsForStrength(strengthPattern.data.activityType, context._knowledgeGraph)

    if (advancedTopics.length > 0) {
      recommendations.push({
        id: `advanced-${strengthPattern.data.activityType}`,
        type: 'next_topic',
        title: '🚀 Level Up Your Strength',
        description: `You excel at ${strengthPattern.data.activityType}. Ready to tackle advanced concepts in this area?`,
        action: `Explore advanced ${strengthPattern.data.activityType} topics`,
        priority: 'medium',
        confidence: 0.8,
        metadata: {
          strengthArea: strengthPattern.data.activityType,
          advancedTopics: advancedTopics.map(t => t.concept)
        },
        expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
      })
    }
  }

  return recommendations
}

/**
 * Generate review recommendations
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateReviewRecommendations(_context: RecommendationContext): ProactiveRecommendation[] {
  const recommendations: ProactiveRecommendation[] = []

  // Find topics that need review (completed but not practiced recently)
  const completedTopics = context.knowledgeGraph.filter(node => node.status === 'mastered')
  const recentTopics = new Set(
    context.recentActivities
      .filter(a => a.content_id)
      .map(a => a.content_id)
  )

  const needsReview = completedTopics.filter(topic =>
    !recentTopics.has(topic.id) &&
    wasCompletedMoreThanDaysAgo(topic, 7, context.recentActivities)
  )

  if (needsReview.length > 0) {
    const reviewTopic = needsReview[0] // Pick the most important one

    recommendations.push({
      id: `review-${reviewTopic.id}`,
      type: 'review_needed',
      title: '🔄 Time for a Quick Review',
      description: `You learned "${reviewTopic.concept}" a while ago but haven't practiced recently. A quick review will help retain your knowledge.`,
      action: `Review ${reviewTopic.concept}`,
      priority: 'medium',
      confidence: 0.7,
      metadata: {
        topicId: reviewTopic.id,
        concept: reviewTopic.concept,
        daysSinceLastPractice: calculateDaysSinceLastPractice(reviewTopic.id, context.recentActivities)
      },
      expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Suggest review based on mistake patterns
  const mistakePatterns = context.patterns.filter(p =>
    p.type === 'pattern_detected' && p.description.includes('Repeated attempts')
  )

  if (mistakePatterns.length > 0) {
    const pattern = mistakePatterns[0]

    recommendations.push({
      id: `review-mistakes-${pattern.data.contentId}`,
      type: 'review_needed',
      title: '🎯 Focus on Challenging Areas',
      description: `You've attempted the same concept ${pattern.data.attempts} times. Let's break it down with a different approach.`,
      action: 'Try voice coaching or ask AI peers for help',
      priority: 'high',
      confidence: 0.85,
      metadata: {
        contentId: pattern.data.contentId,
        attempts: pattern.data.attempts,
        improvementTrend: pattern.data.improvementTrend
      },
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  return recommendations
}

/**
 * Generate skill gap recommendations
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateSkillGapRecommendations(_context: RecommendationContext): ProactiveRecommendation[] {
  const recommendations: ProactiveRecommendation[] = []

  // Identify gaps in knowledge graph
  const gaps = identifyKnowledgeGaps(context._knowledgeGraph)

  if (gaps.length > 0) {
    const criticalGap = gaps[0] // Most critical gap

    recommendations.push({
      id: `skill-gap-${criticalGap.area}`,
      type: 'skill_gap',
      title: '🔍 Skill Gap Identified',
      description: `There's a gap in your ${criticalGap.area} knowledge that might be holding you back from advanced topics.`,
      action: `Fill the gap: Learn ${criticalGap.missingConcepts[0]}`,
      priority: 'medium',
      confidence: 0.75,
      metadata: {
        gapArea: criticalGap.area,
        missingConcepts: criticalGap.missingConcepts,
        blockedTopics: criticalGap.blockedTopics
      },
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Suggest foundational skills based on user level
  if (context.userProfile.skill_level === 'beginner') {
    const foundationalGaps = identifyFoundationalGaps(context._knowledgeGraph)

    if (foundationalGaps.length > 0) {
      recommendations.push({
        id: 'foundational-skills',
        type: 'skill_gap',
        title: '🏗️ Strengthen Your Foundation',
        description: 'Building strong fundamentals will make advanced topics much easier to understand.',
        action: `Focus on ${foundationalGaps[0]}`,
        priority: 'high',
        confidence: 0.8,
        metadata: {
          foundationalSkills: foundationalGaps,
          userLevel: context.userProfile.skill_level
        },
        expires_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
      })
    }
  }

  return recommendations
}

/**
 * Generate optimization recommendations
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateOptimizationRecommendations(_context: RecommendationContext): ProactiveRecommendation[] {
  const recommendations: ProactiveRecommendation[] = []

  // Analyze learning efficiency
  const timePattern = context.patterns.find(p =>
    p.type === 'pattern_detected' && p.description.includes('Prefers learning during')
  )

  if (timePattern && timePattern.confidence > 0.6) {
    recommendations.push({
      id: 'optimize-timing',
      type: 'optimization',
      title: '⏰ Optimize Your Learning Schedule',
      description: `You learn best during ${timePattern.data.timeLabel}. Schedule your most challenging topics during this time for better results.`,
      action: `Plan difficult topics for ${timePattern.data.timeLabel}`,
      priority: 'low',
      confidence: timePattern.confidence,
      metadata: {
        preferredTime: timePattern.data.timeLabel,
        preferredHour: timePattern.data.preferredHour,
        percentage: timePattern.data.percentage
      },
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Voice coaching optimization
  const voicePattern = context.patterns.find(p =>
    p.type === 'pattern_detected' && p.description.includes('voice coaching')
  )

  if (voicePattern) {
    const isEffective = voicePattern.data.performanceDifference > 0

    recommendations.push({
      id: 'optimize-voice-coaching',
      type: 'optimization',
      title: isEffective ? '🎤 Voice Coaching is Working!' : '🎤 Try Different Learning Methods',
      description: isEffective
        ? `Voice coaching boosts your performance by ${voicePattern.data.performanceDifference.toFixed(0)} XP on average. Use it more often!`
        : 'Voice coaching might not be your preferred learning style. Try combining it with visual learning.',
      action: isEffective
        ? 'Use voice coaching for challenging topics'
        : 'Experiment with different learning approaches',
      priority: 'low',
      confidence: 0.6,
      metadata: {
        voiceEffective: isEffective,
        performanceDifference: voicePattern.data.performanceDifference,
        usagePercentage: voicePattern.data.voiceUsagePercentage
      },
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  return recommendations
}

/**
 * Generate motivation recommendations
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateMotivationRecommendations(_context: RecommendationContext): ProactiveRecommendation[] {
  const recommendations: ProactiveRecommendation[] = []

  // Streak motivation
  if (context.currentStreak >= 3) {
    recommendations.push({
      id: 'maintain-streak',
      type: 'motivation',
      title: '🔥 Keep Your Streak Alive!',
      description: `You're on a ${context.currentStreak}-day learning streak! Don't break the momentum.`,
      action: 'Complete today\'s learning goal',
      priority: 'medium',
      confidence: 0.8,
      metadata: {
        currentStreak: context.currentStreak,
        streakType: 'daily_learning'
      },
      expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Progress celebration
  const velocityPattern = context.patterns.find(p => p.type === 'velocity_change')
  if (velocityPattern && velocityPattern.data.changePercentage > 20) {
    recommendations.push({
      id: 'celebrate-progress',
      type: 'motivation',
      title: '🎉 Amazing Progress!',
      description: `You're learning ${velocityPattern.data.changePercentage.toFixed(1)}% faster than last week. You're on fire!`,
      action: 'Challenge yourself with a harder topic',
      priority: 'low',
      confidence: 0.9,
      metadata: {
        improvementPercentage: velocityPattern.data.changePercentage,
        timeframe: 'last week'
      },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Milestone approaching
  const completedNodes = context.knowledgeGraph.filter(n => n.status === 'mastered').length
  const totalNodes = context.knowledgeGraph.length
  const completionPercentage = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0

  const nextMilestone = getNextMilestone(completionPercentage)
  if (nextMilestone && (nextMilestone.percentage - completionPercentage) <= 10) {
    recommendations.push({
      id: 'milestone-approaching',
      type: 'motivation',
      title: '🏆 Milestone Within Reach!',
      description: `You're ${(nextMilestone.percentage - completionPercentage).toFixed(1)}% away from ${nextMilestone.name}!`,
      action: 'Complete a few more topics to reach your milestone',
      priority: 'medium',
      confidence: 0.7,
      metadata: {
        currentCompletion: completionPercentage,
        nextMilestone: nextMilestone,
        topicsNeeded: Math.ceil((nextMilestone.percentage - completionPercentage) / 100 * totalNodes)
      },
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  return recommendations
}

/**
 * Helper functions
 */
function arePrerequisitesMet(node: KnowledgeGraphNode, allNodes: KnowledgeGraphNode[]): boolean {
  if (!node.prerequisites || node.prerequisites.length === 0) return true

  return node.prerequisites.every(prereq => {
    const prereqNode = allNodes.find(n => n.concept === prereq)
    return prereqNode && prereqNode.status === 'mastered'
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function selectBestNextTopic(availableTopics: KnowledgeGraphNode[], _context: RecommendationContext): KnowledgeGraphNode {
  // Simple selection - could be enhanced with more sophisticated logic
  return availableTopics[0]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findAdvancedTopicsForStrength(activityType: string, _knowledgeGraph: KnowledgeGraphNode[]): KnowledgeGraphNode[] {
  // This would need to be enhanced with actual topic categorization
  return knowledgeGraph.filter(node =>
    node.status === 'locked' &&
    node.concept.toLowerCase().includes(activityType.toLowerCase())
  ).slice(0, 3)
}

function wasCompletedMoreThanDaysAgo(topic: KnowledgeGraphNode, days: number, activities: LearningActivity[]): boolean {
  const topicActivities = activities.filter(a => a.content_id === topic.id)
  if (topicActivities.length === 0) return true

  const lastActivity = new Date(topicActivities[0].activity_timestamp || topicActivities[0].created_at)
  const daysAgo = (Date.now() - lastActivity.getTime()) / (24 * 60 * 60 * 1000)

  return daysAgo > days
}

function calculateDaysSinceLastPractice(topicId: string, activities: LearningActivity[]): number {
  const topicActivities = activities.filter(a => a.content_id === topicId)
  if (topicActivities.length === 0) return 999

  const lastActivity = new Date(topicActivities[0].activity_timestamp || topicActivities[0].created_at)
  return Math.floor((Date.now() - lastActivity.getTime()) / (24 * 60 * 60 * 1000))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function identifyKnowledgeGaps(_knowledgeGraph: KnowledgeGraphNode[]): Array<{ area: string, missingConcepts: string[], blockedTopics: string[] }> {
  // This would need more sophisticated gap analysis
  // For now, return empty array
  return []
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function identifyFoundationalGaps(_knowledgeGraph: KnowledgeGraphNode[]): string[] {
  const foundationalConcepts = ['Variables', 'Functions', 'Loops', 'Conditionals', 'Data Types']
  const masteredConcepts = knowledgeGraph
    .filter(n => n.status === 'mastered')
    .map(n => n.concept)

  return foundationalConcepts.filter(concept =>
    !masteredConcepts.some(mastered => mastered.includes(concept))
  )
}

function calculateCurrentStreak(activities: LearningActivity[]): number {
  if (activities.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  const currentDate = new Date(today)

  for (let i = 0; i < 30; i++) { // Check last 30 days
    const dayActivities = activities.filter(a => {
      const activityDate = new Date(a.activity_timestamp || a.created_at)
      activityDate.setHours(0, 0, 0, 0)
      return activityDate.getTime() === currentDate.getTime()
    })

    if (dayActivities.length > 0) {
      streak++
    } else if (streak > 0) {
      break // Streak broken
    }

    currentDate.setDate(currentDate.getDate() - 1)
  }

  return streak
}

function calculateWeeklyXP(activities: LearningActivity[]): number {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  return activities
    .filter(a => new Date(a.activity_timestamp || a.created_at) >= oneWeekAgo)
    .reduce((sum, a) => sum + (a.xp_earned || 0), 0)
}

function getNextMilestone(currentPercentage: number): { name: string, percentage: number } | null {
  const milestones = [
    { name: 'Getting Started', percentage: 10 },
    { name: 'Making Progress', percentage: 25 },
    { name: 'Halfway There', percentage: 50 },
    { name: 'Almost Done', percentage: 75 },
    { name: 'Master Learner', percentage: 90 },
    { name: 'Complete', percentage: 100 }
  ]

  return milestones.find(m => m.percentage > currentPercentage) || null
}

function getDefaultRecommendations(): ProactiveRecommendation[] {
  return [
    {
      id: 'default-start-learning',
      type: 'next_topic',
      title: '🚀 Start Your Learning Journey',
      description: 'Begin with our skill assessment to get personalized recommendations.',
      action: 'Take the skill assessment',
      priority: 'high',
      confidence: 1.0,
      metadata: {},
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
}