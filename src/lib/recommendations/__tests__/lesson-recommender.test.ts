/**
 * Tests for Lesson Recommendation Engine
 */

import { describe, it, expect } from '@jest/globals'
import {
  calculateRelevanceScore,
  checkPrerequisites,
  assignPeerRecommendation,
  generateRecommendations
} from '../lesson-recommender'
import type { LessonMetadata, RecommendationContext } from '../lesson-recommender'
import type { UserProfile, KnowledgeGraphNode, AIPeerProfile } from '@/types/database'

describe('Lesson Recommender', () => {
  const mockUserProfile: UserProfile = {
    id: 'user-1',
    clerk_user_id: 'clerk-1',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    skill_level: 'intermediate',
    learning_goal: 'learning',
    primary_domain: 'javascript',
    current_xp: 500,
    current_level: 2,
    learning_streak: 5,
    voice_coaching_enabled: true,
    preferred_learning_style: 'mixed',
    timezone: 'UTC',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const mockAIPeers: AIPeerProfile[] = [
    {
      id: 'sarah',
      user_id: 'user-1',
      name: 'Sarah',
      personality: 'curious',
      skill_level: 'beginner',
      avatar_url: '/images/avatars/sarah-3d.png',
      common_mistakes: [],
      interaction_style: 'Curious',
      backstory: 'A curious learner',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'alex',
      user_id: 'user-1',
      name: 'Alex',
      personality: 'analytical',
      skill_level: 'intermediate',
      avatar_url: '/images/avatars/alex-3d.png',
      common_mistakes: [],
      interaction_style: 'Analytical',
      backstory: 'An analytical thinker',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  const mockKnowledgeGraph: KnowledgeGraphNode[] = [
    {
      id: 'node-1',
      user_id: 'user-1',
      concept: 'JavaScript Basics',
      category: 'Programming',
      prerequisites: [],
      status: 'mastered',
      position: { x: 0, y: 0 },
      connections: [],
      mastery_percentage: 100,
      estimated_duration_minutes: 60,
      difficulty_level: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  const mockLesson: LessonMetadata = {
    id: 'lesson-1',
    title: 'React Hooks',
    description: 'Learn React Hooks',
    topic: 'React',
    difficulty: 'intermediate',
    duration: '2 hours',
    durationMinutes: 120,
    prerequisites: ['JavaScript Basics'],
    learningObjectives: ['Understand hooks'],
    tags: ['react', 'javascript'],
    category: 'Web Development',
    xpReward: 200
  }

  const mockContext: RecommendationContext = {
    userProfile: mockUserProfile,
    knowledgeGraph: mockKnowledgeGraph,
    recentActivities: [],
    aiPeers: mockAIPeers
  }

  describe('calculateRelevanceScore', () => {
    it('should calculate a relevance score between 0 and 100', () => {
      const score = calculateRelevanceScore(mockLesson, mockContext)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should give higher scores for matching skill levels', () => {
      const intermediateLesson = { ...mockLesson, difficulty: 'intermediate' as const }
      const advancedLesson = { ...mockLesson, difficulty: 'advanced' as const }
      
      const intermediateScore = calculateRelevanceScore(intermediateLesson, mockContext)
      const advancedScore = calculateRelevanceScore(advancedLesson, mockContext)
      
      expect(intermediateScore).toBeGreaterThan(advancedScore)
    })

    it('should give higher scores for matching topics', () => {
      const jsLesson = { ...mockLesson, topic: 'JavaScript' }
      const pythonLesson = { ...mockLesson, topic: 'Python' }
      
      const jsScore = calculateRelevanceScore(jsLesson, mockContext)
      const pythonScore = calculateRelevanceScore(pythonLesson, mockContext)
      
      expect(jsScore).toBeGreaterThan(pythonScore)
    })
  })

  describe('checkPrerequisites', () => {
    it('should return true when prerequisites are met', () => {
      const result = checkPrerequisites(mockLesson, mockKnowledgeGraph)
      expect(result).toBe(true)
    })

    it('should return false when prerequisites are not met', () => {
      const lessonWithUnmetPrereqs = {
        ...mockLesson,
        prerequisites: ['Advanced Algorithms']
      }
      const result = checkPrerequisites(lessonWithUnmetPrereqs, mockKnowledgeGraph)
      expect(result).toBe(false)
    })

    it('should return true when lesson has no prerequisites', () => {
      const lessonWithoutPrereqs = {
        ...mockLesson,
        prerequisites: []
      }
      const result = checkPrerequisites(lessonWithoutPrereqs, mockKnowledgeGraph)
      expect(result).toBe(true)
    })
  })

  describe('assignPeerRecommendation', () => {
    it('should assign a peer based on lesson difficulty', () => {
      const result = assignPeerRecommendation(mockLesson, mockAIPeers)
      expect(result.peerId).toBeDefined()
      expect(result.reason).toBeDefined()
      expect(result.reason).toContain('React')
    })

    it('should match intermediate lessons with intermediate peers', () => {
      const intermediateLesson = { ...mockLesson, difficulty: 'intermediate' as const }
      const result = assignPeerRecommendation(intermediateLesson, mockAIPeers)
      expect(result.peerId).toBe('alex')
    })

    it('should provide a fallback when no peers match', () => {
      const advancedLesson = { ...mockLesson, difficulty: 'advanced' as const }
      const result = assignPeerRecommendation(advancedLesson, mockAIPeers)
      expect(result.peerId).toBeDefined()
    })
  })

  describe('generateRecommendations', () => {
    it('should generate the requested number of recommendations', () => {
      const lessons = [mockLesson, { ...mockLesson, id: 'lesson-2' }, { ...mockLesson, id: 'lesson-3' }]
      const recommendations = generateRecommendations(lessons, mockContext, 2)
      expect(recommendations).toHaveLength(2)
    })

    it('should filter out lessons with unmet prerequisites', () => {
      const lessons = [
        mockLesson,
        { ...mockLesson, id: 'lesson-2', prerequisites: ['Unmet Prerequisite'] }
      ]
      const recommendations = generateRecommendations(lessons, mockContext, 3)
      expect(recommendations.every(rec => rec.prerequisitesMet)).toBe(true)
    })

    it('should sort recommendations by relevance score', () => {
      const lessons = [
        { ...mockLesson, id: 'lesson-1', topic: 'Python' },
        { ...mockLesson, id: 'lesson-2', topic: 'JavaScript' },
        { ...mockLesson, id: 'lesson-3', topic: 'React' }
      ]
      const recommendations = generateRecommendations(lessons, mockContext, 3)
      
      // Check that scores are in descending order
      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].relevanceScore).toBeGreaterThanOrEqual(
          recommendations[i + 1].relevanceScore
        )
      }
    })

    it('should include peer recommendations', () => {
      const recommendations = generateRecommendations([mockLesson], mockContext, 1)
      expect(recommendations[0].recommendedBy).toBeDefined()
      expect(recommendations[0].recommendationReason).toBeDefined()
    })
  })
})
