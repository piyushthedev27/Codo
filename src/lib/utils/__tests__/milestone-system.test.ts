/**
 * Tests for Milestone System
 */

import {
  checkMilestoneCriteria,
  calculateMilestoneProgress,
  getApplicableMilestones,
  createCelebrationEvent,
  applyMilestoneReward,
  getMilestonePreview,
  formatMilestoneReward,
  checkForNewCompletions,
  MILESTONE_DEFINITIONS
} from '../milestone-system'
import type { Milestone } from '../learning-path-integration'

describe('Milestone System', () => {
  describe('checkMilestoneCriteria', () => {
    it('should check gte criteria correctly', () => {
      const criteria = { metric: 'test', threshold: 50, comparison: 'gte' as const }
      
      expect(checkMilestoneCriteria(criteria, 60)).toBe(true)
      expect(checkMilestoneCriteria(criteria, 50)).toBe(true)
      expect(checkMilestoneCriteria(criteria, 40)).toBe(false)
    })

    it('should check lte criteria correctly', () => {
      const criteria = { metric: 'test', threshold: 50, comparison: 'lte' as const }
      
      expect(checkMilestoneCriteria(criteria, 40)).toBe(true)
      expect(checkMilestoneCriteria(criteria, 50)).toBe(true)
      expect(checkMilestoneCriteria(criteria, 60)).toBe(false)
    })

    it('should check eq criteria correctly', () => {
      const criteria = { metric: 'test', threshold: 50, comparison: 'eq' as const }
      
      expect(checkMilestoneCriteria(criteria, 50)).toBe(true)
      expect(checkMilestoneCriteria(criteria, 49)).toBe(false)
      expect(checkMilestoneCriteria(criteria, 51)).toBe(false)
    })
  })

  describe('calculateMilestoneProgress', () => {
    it('should calculate progress percentage correctly', () => {
      const milestone = MILESTONE_DEFINITIONS[0] // track-25
      const progress = calculateMilestoneProgress(milestone, 15, 'user-1')
      
      expect(progress.progressPercentage).toBe(60) // 15/25 * 100 = 60%
      expect(progress.isCompleted).toBe(false)
    })

    it('should mark as completed when threshold is met', () => {
      const milestone = MILESTONE_DEFINITIONS[0] // track-25
      const progress = calculateMilestoneProgress(milestone, 30, 'user-1')
      
      expect(progress.isCompleted).toBe(true)
      expect(progress.completedAt).toBeDefined()
    })

    it('should cap progress at 100%', () => {
      const milestone = MILESTONE_DEFINITIONS[0] // track-25
      const progress = calculateMilestoneProgress(milestone, 50, 'user-1')
      
      expect(progress.progressPercentage).toBe(100)
    })
  })

  describe('getApplicableMilestones', () => {
    it('should return milestones close to completion', () => {
      const metrics = {
        trackProgressPercentage: 20,
        learningStreak: 5,
        skillsMastered: 3,
        challengesCompleted: 2
      }
      
      const applicable = getApplicableMilestones(metrics)
      
      expect(applicable.length).toBeGreaterThan(0)
      // Should include track-25 milestone (20% is 80% of 25)
      expect(applicable.some(m => m.id === 'track-25')).toBe(true)
    })

    it('should not return milestones far from completion', () => {
      const metrics = {
        trackProgressPercentage: 10,
        learningStreak: 1,
        skillsMastered: 1,
        challengesCompleted: 0
      }
      
      const applicable = getApplicableMilestones(metrics)
      
      // Should not include track-75 milestone (10% is only 13% of 75)
      expect(applicable.some(m => m.id === 'track-75')).toBe(false)
    })
  })

  describe('createCelebrationEvent', () => {
    it('should create celebration event with correct properties', () => {
      const milestone = MILESTONE_DEFINITIONS[0]
      const event = createCelebrationEvent(milestone, 'user-1')
      
      expect(event.milestoneId).toBe(milestone.id)
      expect(event.userId).toBe('user-1')
      expect(event.title).toBe(milestone.title)
      expect(event.reward).toEqual(milestone.reward)
      expect(event.celebrationStyle).toBe(milestone.celebrationStyle)
      expect(event.dismissed).toBe(false)
    })

    it('should generate appropriate celebration message', () => {
      const milestone = MILESTONE_DEFINITIONS[0]
      const event = createCelebrationEvent(milestone, 'user-1')
      
      expect(event.message).toBeTruthy()
      expect(event.message.length).toBeGreaterThan(0)
    })
  })

  describe('applyMilestoneReward', () => {
    it('should apply XP reward correctly', () => {
      const reward = { type: 'xp' as const, value: 100, description: '+100 XP', icon: '⭐' }
      const result = applyMilestoneReward(reward, 350)
      
      expect(result.newXP).toBe(450)
      expect(result.badges).toHaveLength(0)
      expect(result.achievements).toHaveLength(0)
    })

    it('should apply badge reward correctly', () => {
      const reward = { type: 'badge' as const, value: 'Test Badge', description: 'Badge', icon: '🏅' }
      const result = applyMilestoneReward(reward, 350)
      
      expect(result.newXP).toBe(350)
      expect(result.badges).toContain('Test Badge')
    })

    it('should apply unlock reward correctly', () => {
      const reward = { type: 'unlock' as const, value: 'Advanced Topics', description: 'Unlock', icon: '🔓' }
      const result = applyMilestoneReward(reward, 350)
      
      expect(result.unlockedContent).toContain('Advanced Topics')
    })

    it('should apply achievement reward correctly', () => {
      const reward = { type: 'achievement' as const, value: 'Master', description: 'Achievement', icon: '🏆' }
      const result = applyMilestoneReward(reward, 350)
      
      expect(result.achievements).toContain('Master')
    })
  })

  describe('getMilestonePreview', () => {
    it('should return closest incomplete milestone', () => {
      const milestones: Milestone[] = [
        {
          id: 'm1',
          title: 'Milestone 1',
          description: 'Test',
          progress: 90,
          target: 100,
          current: 90,
          reward: { type: 'xp', value: 100, description: 'XP' },
          isCompleted: false
        },
        {
          id: 'm2',
          title: 'Milestone 2',
          description: 'Test',
          progress: 50,
          target: 100,
          current: 50,
          reward: { type: 'xp', value: 100, description: 'XP' },
          isCompleted: false
        }
      ]
      
      const preview = getMilestonePreview(milestones)
      
      expect(preview?.id).toBe('m1') // Closest to completion
    })

    it('should return null if all milestones are completed', () => {
      const milestones: Milestone[] = [
        {
          id: 'm1',
          title: 'Milestone 1',
          description: 'Test',
          progress: 100,
          target: 100,
          current: 100,
          reward: { type: 'xp', value: 100, description: 'XP' },
          isCompleted: true
        }
      ]
      
      const preview = getMilestonePreview(milestones)
      
      expect(preview).toBeNull()
    })
  })

  describe('formatMilestoneReward', () => {
    it('should format XP reward', () => {
      const reward = { type: 'xp' as const, value: 100, description: 'XP' }
      expect(formatMilestoneReward(reward)).toBe('+100 XP')
    })

    it('should format badge reward', () => {
      const reward = { type: 'badge' as const, value: 'Test Badge', description: 'Badge', icon: '🏅' }
      expect(formatMilestoneReward(reward)).toBe('🏅 Test Badge')
    })

    it('should format unlock reward', () => {
      const reward = { type: 'unlock' as const, value: 'Advanced Topics', description: 'Unlock' }
      expect(formatMilestoneReward(reward)).toBe('🔓 Advanced Topics')
    })

    it('should format achievement reward', () => {
      const reward = { type: 'achievement' as const, value: 'Master', description: 'Achievement' }
      expect(formatMilestoneReward(reward)).toBe('🏆 Master')
    })
  })

  describe('checkForNewCompletions', () => {
    it('should detect newly completed milestones', () => {
      const previous = {
        trackProgressPercentage: 20,
        learningStreak: 5,
        skillsMastered: 3
      }
      
      const current = {
        trackProgressPercentage: 30,
        learningStreak: 5,
        skillsMastered: 3
      }
      
      const newCompletions = checkForNewCompletions(previous, current)
      
      // Should detect track-25 milestone completion
      expect(newCompletions.some(m => m.id === 'track-25')).toBe(true)
    })

    it('should not detect already completed milestones', () => {
      const previous = {
        trackProgressPercentage: 30,
        learningStreak: 5,
        skillsMastered: 3
      }
      
      const current = {
        trackProgressPercentage: 35,
        learningStreak: 5,
        skillsMastered: 3
      }
      
      const newCompletions = checkForNewCompletions(previous, current)
      
      // track-25 was already completed, should not be in new completions
      expect(newCompletions.some(m => m.id === 'track-25')).toBe(false)
    })

    it('should detect multiple new completions', () => {
      const previous = {
        trackProgressPercentage: 20,
        learningStreak: 6,
        skillsMastered: 4
      }
      
      const current = {
        trackProgressPercentage: 30,
        learningStreak: 7,
        skillsMastered: 5
      }
      
      const newCompletions = checkForNewCompletions(previous, current)
      
      // Should detect both track-25 and streak-7 completions
      expect(newCompletions.length).toBeGreaterThan(0)
    })
  })
})
