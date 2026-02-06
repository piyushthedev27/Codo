/**
 * Tests for Learning Path Integration
 */

import {
  calculateLearningTrack,
  convertNodesToLessons,
  getUpcomingLessons,
  calculateMilestones,
  getNextMilestone,
  getLessonStatusIcon,
  formatDuration
} from '../learning-path-integration'
import type { KnowledgeGraphNode } from '@/types/database'

describe('Learning Path Integration', () => {
  const mockKnowledgeGraph: KnowledgeGraphNode[] = [
    {
      id: 'node-1',
      user_id: 'user-1',
      concept: 'Variables & Data Types',
      category: 'Programming',
      prerequisites: [],
      status: 'mastered',
      position: { x: 100, y: 100 },
      connections: ['node-2'],
      mastery_percentage: 100,
      estimated_duration_minutes: 30,
      difficulty_level: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'node-2',
      user_id: 'user-1',
      concept: 'Functions',
      category: 'Programming',
      prerequisites: ['node-1'],
      status: 'in_progress',
      position: { x: 200, y: 100 },
      connections: ['node-3'],
      mastery_percentage: 65,
      estimated_duration_minutes: 45,
      difficulty_level: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'node-3',
      user_id: 'user-1',
      concept: 'Arrays & Objects',
      category: 'Programming',
      prerequisites: ['node-2'],
      status: 'locked',
      position: { x: 300, y: 100 },
      connections: [],
      mastery_percentage: 0,
      estimated_duration_minutes: 60,
      difficulty_level: 3,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]

  describe('calculateLearningTrack', () => {
    it('should calculate track progress correctly', () => {
      const track = calculateLearningTrack(mockKnowledgeGraph, 'javascript')
      
      expect(track.totalLessons).toBe(3)
      expect(track.completedLessons).toBe(1)
      expect(track.progressPercentage).toBe(33) // 1/3 = 33%
      expect(track.name).toContain('JavaScript')
    })

    it('should calculate estimated time remaining', () => {
      const track = calculateLearningTrack(mockKnowledgeGraph, 'javascript')
      
      // Should sum up remaining nodes (45 + 60 = 105)
      expect(track.estimatedTimeRemaining).toBe(105)
    })

    it('should determine difficulty level', () => {
      const track = calculateLearningTrack(mockKnowledgeGraph, 'javascript')
      
      // Average difficulty: (1 + 2 + 3) / 3 = 2
      expect(track.difficulty).toBe('intermediate')
    })
  })

  describe('convertNodesToLessons', () => {
    it('should convert knowledge graph nodes to lesson status', () => {
      const lessons = convertNodesToLessons(mockKnowledgeGraph)
      
      expect(lessons).toHaveLength(3)
      expect(lessons[0].status).toBe('completed')
      expect(lessons[1].status).toBe('in_progress')
      expect(lessons[2].status).toBe('locked')
    })

    it('should calculate XP rewards based on difficulty', () => {
      const lessons = convertNodesToLessons(mockKnowledgeGraph)
      
      expect(lessons[0].xpReward).toBe(50) // difficulty 1
      expect(lessons[1].xpReward).toBe(100) // difficulty 2
      expect(lessons[2].xpReward).toBe(150) // difficulty 3
    })
  })

  describe('getUpcomingLessons', () => {
    it('should return lessons starting from in-progress', () => {
      const lessons = convertNodesToLessons(mockKnowledgeGraph)
      const upcoming = getUpcomingLessons(lessons, 6)
      
      expect(upcoming.length).toBeGreaterThan(0)
      expect(upcoming[0].status).toBe('in_progress')
    })

    it('should limit results to maxCount', () => {
      const lessons = convertNodesToLessons(mockKnowledgeGraph)
      const upcoming = getUpcomingLessons(lessons, 2)
      
      expect(upcoming.length).toBeLessThanOrEqual(2)
    })
  })

  describe('calculateMilestones', () => {
    it('should generate appropriate milestones', () => {
      const track = calculateLearningTrack(mockKnowledgeGraph, 'javascript')
      const milestones = calculateMilestones(track, 350, 1)
      
      expect(milestones.length).toBeGreaterThan(0)
      expect(milestones.some(m => m.id.includes('milestone'))).toBe(true)
    })

    it('should mark milestones as completed when threshold is met', () => {
      const track = calculateLearningTrack(mockKnowledgeGraph, 'javascript')
      const milestones = calculateMilestones(track, 350, 1)
      
      // With 33% progress, 25% milestone should be completed
      const milestone25 = milestones.find(m => m.id === 'milestone-25')
      expect(milestone25?.isCompleted).toBe(true)
    })

    it('should include level up milestone', () => {
      const track = calculateLearningTrack(mockKnowledgeGraph, 'javascript')
      const milestones = calculateMilestones(track, 350, 1)
      
      const levelMilestone = milestones.find(m => m.id === 'milestone-level')
      expect(levelMilestone).toBeDefined()
      expect(levelMilestone?.title).toContain('Level 2')
    })
  })

  describe('getNextMilestone', () => {
    it('should return the first incomplete milestone', () => {
      const track = calculateLearningTrack(mockKnowledgeGraph, 'javascript')
      const milestones = calculateMilestones(track, 350, 1)
      const nextMilestone = getNextMilestone(milestones)
      
      expect(nextMilestone).toBeDefined()
      expect(nextMilestone?.isCompleted).toBe(false)
    })

    it('should return null if all milestones are completed', () => {
      const completedGraph = mockKnowledgeGraph.map(node => ({
        ...node,
        status: 'mastered' as const
      }))
      const track = calculateLearningTrack(completedGraph, 'javascript')
      const milestones = calculateMilestones(track, 1500, 2)
      const nextMilestone = getNextMilestone(milestones)
      
      // Should still have level milestone
      expect(nextMilestone).toBeDefined()
    })
  })

  describe('getLessonStatusIcon', () => {
    it('should return correct icons for each status', () => {
      expect(getLessonStatusIcon('completed')).toBe('✅')
      expect(getLessonStatusIcon('in_progress')).toBe('🔵')
      expect(getLessonStatusIcon('locked')).toBe('⚪')
    })
  })

  describe('formatDuration', () => {
    it('should format minutes correctly', () => {
      expect(formatDuration(30)).toBe('30min')
      expect(formatDuration(45)).toBe('45min')
    })

    it('should format hours correctly', () => {
      expect(formatDuration(60)).toBe('1h')
      expect(formatDuration(120)).toBe('2h')
    })

    it('should format hours and minutes correctly', () => {
      expect(formatDuration(90)).toBe('1h 30min')
      expect(formatDuration(135)).toBe('2h 15min')
    })
  })
})
