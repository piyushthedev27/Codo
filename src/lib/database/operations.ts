/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Database Operations
 * Common database operations for the Codo platform
 */

import { supabase, supabaseAdmin } from './supabase-client'
import type {
  UserProfile,
  AIPeerProfile,
  KnowledgeGraphNode,
  MistakePattern,
  Lesson,
  LearningInsight,
  Challenge,
  ChallengeAttempt
} from '../../types/database'

// User Profile Operations
export const userProfileOperations = {
  async create(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) {
    // Use admin client for user creation to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByClerkId(clerkUserId: string) {
    // Use admin client to bypass RLS for user lookup
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async update(clerkUserId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('clerk_user_id', clerkUserId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateXP(clerkUserId: string, xpToAdd: number) {
    const profile = await this.getByClerkId(clerkUserId)
    if (!profile) throw new Error('User profile not found')

    const newXP = profile.current_xp + xpToAdd
    const newLevel = Math.floor(newXP / 1000) + 1 // 1000 XP per level

    return this.update(clerkUserId, {
      current_xp: newXP,
      current_level: newLevel
    })
  },

  async updateStreak(clerkUserId: string, increment: boolean = true) {
    const profile = await this.getByClerkId(clerkUserId)
    if (!profile) throw new Error('User profile not found')

    const newStreak = increment ? profile.learning_streak + 1 : 0

    return this.update(clerkUserId, {
      learning_streak: newStreak
    })
  }
}

// AI Peer Profile Operations
export const aiPeerOperations = {
  async createForUser(userId: string, peers: Omit<AIPeerProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) {
    const peersWithUserId = peers.map(peer => ({ ...peer, user_id: userId }))

    // Use admin client for initial peer creation to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('ai_peer_profiles')
      .insert(peersWithUserId)
      .select()

    if (error) throw error
    return data
  },

  async getByUserId(userId: string) {
    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('ai_peer_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) throw error
    return data || []
  },

  async update(peerId: string, updates: Partial<AIPeerProfile>) {
    const { data, error } = await supabase
      .from('ai_peer_profiles')
      .update(updates)
      .eq('id', peerId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Knowledge Graph Operations
export const knowledgeGraphOperations = {
  async initializeForUser(userId: string, concepts: string[]) {
    const nodes = concepts.map((concept, index) => ({
      user_id: userId,
      concept,
      category: 'programming',
      position: { x: Math.random() * 800, y: Math.random() * 600 },
      status: index === 0 ? 'in_progress' : 'locked' as const,
      mastery_percentage: 0
    }))

    // Use admin client for initial knowledge graph creation to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('knowledge_graph_nodes')
      .insert(nodes)
      .select()

    if (error) throw error
    return data
  },

  async getByUserId(userId: string) {
    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('knowledge_graph_nodes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  async updateNodeStatus(nodeId: string, status: 'locked' | 'in_progress' | 'mastered', masteryPercentage?: number) {
    const updates: any = { status }
    if (masteryPercentage !== undefined) {
      updates.mastery_percentage = masteryPercentage
    }

    const { data, error } = await supabase
      .from('knowledge_graph_nodes')
      .update(updates)
      .eq('id', nodeId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async unlockNextNodes(userId: string, _completedConcept: string) {
    // This would contain logic to unlock dependent nodes
    // For now, we'll just unlock the next node in sequence
    const { data: nodes } = await supabase
      .from('knowledge_graph_nodes')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'locked')
      .limit(1)

    if (nodes && nodes.length > 0) {
      return this.updateNodeStatus(nodes[0].id, 'in_progress')
    }

    return null
  }
}

// Mistake Pattern Operations
export const mistakePatternOperations = {
  async record(userId: string, errorType: string, errorMessage: string, codeContext?: string) {
    // Check if this mistake pattern already exists
    const { data: existing } = await supabase
      .from('mistake_patterns')
      .select('*')
      .eq('user_id', userId)
      .eq('error_type', errorType)
      .single()

    if (existing) {
      // Update frequency and last occurrence
      const { data, error } = await supabase
        .from('mistake_patterns')
        .update({
          frequency: existing.frequency + 1,
          last_occurrence: new Date().toISOString(),
          code_context: codeContext || existing.code_context
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new mistake pattern
      const { data, error } = await supabase
        .from('mistake_patterns')
        .insert({
          user_id: userId,
          error_type: errorType,
          error_message: errorMessage,
          code_context: codeContext,
          frequency: 1
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  async getByUserId(userId: string, unresolved: boolean = false) {
    let query = supabase
      .from('mistake_patterns')
      .select('*')
      .eq('user_id', userId)

    if (unresolved) {
      query = query.eq('resolved', false)
    }

    const { data, error } = await query.order('frequency', { ascending: false })

    if (error) throw error
    return data || []
  },

  async markResolved(patternId: string, resolutionNotes?: string) {
    const { data, error } = await supabase
      .from('mistake_patterns')
      .update({
        resolved: true,
        resolution_notes: resolutionNotes
      })
      .eq('id', patternId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Learning Insights Operations
export const learningInsightsOperations = {
  async create(userId: string, insight: Omit<LearningInsight, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('learning_insights')
      .insert({ ...insight, user_id: userId })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getActiveByUserId(userId: string) {
    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('learning_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('dismissed', false)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async dismiss(insightId: string) {
    const { data, error } = await supabase
      .from('learning_insights')
      .update({
        dismissed: true,
        dismissed_at: new Date().toISOString()
      })
      .eq('id', insightId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Challenge Operations
export const challengeOperations = {
  async getAll(difficulty?: number, category?: string) {
    let query = supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)

    if (difficulty) {
      query = query.eq('difficulty_level', difficulty)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query.order('difficulty_level', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getById(challengeId: string) {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single()

    if (error) throw error
    return data
  },

  async getRecommendedForUser(userId: string, limit: number = 5) {
    // Get user's skill level and recent attempts to recommend appropriate challenges
    const profile = await userProfileOperations.getByClerkId(userId)
    if (!profile) return []

    const difficultyMap: Record<string, number[]> = {
      'beginner': [1, 2],
      'intermediate': [2, 3],
      'advanced': [3, 4, 5]
    }

    const difficulties = difficultyMap[profile.skill_level] || [1, 2]

    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .in('difficulty_level', difficulties)
      .limit(limit)

    if (error) throw error
    return data || []
  }
}

// Challenge Attempt Operations
export const challengeAttemptOperations = {
  async create(attempt: Omit<ChallengeAttempt, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('challenge_attempts')
      .insert(attempt)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(attemptId: string, updates: Partial<ChallengeAttempt>) {
    const { data, error } = await supabase
      .from('challenge_attempts')
      .update(updates)
      .eq('id', attemptId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByUserId(userId: string, limit?: number) {
    let query = supabase
      .from('challenge_attempts')
      .select(`
        *,
        challenges (
          title,
          difficulty_level,
          category
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async getUserStats(userId: string) {
    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('challenge_attempts')
      .select('status, score, difficulty_level:challenges(difficulty_level)')
      .eq('user_id', userId)

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      completed: data?.filter(a => a.status === 'completed').length || 0,
      averageScore: 0,
      byDifficulty: {
        beginner: 0,
        intermediate: 0,
        advanced: 0
      }
    }

    if (data && data.length > 0) {
      const completedAttempts = data.filter(a => a.status === 'completed')
      stats.averageScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
    }

    return stats
  }
}

// Utility function to test database connection
export async function testDatabaseConnection() {
  try {
    // Use admin client to test connection with a simple query
    // Query user_profiles which should always exist
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .limit(1)

    if (error) {
      // If RLS is blocking, that's actually a good sign - the table exists
      if (error.code === 'PGRST301' || error.message.includes('row-level security')) {
        return { success: true, message: 'Database connection successful (RLS active)' }
      }
      throw error
    }

    return { success: true, message: 'Database connection successful' }
  } catch (error) {
    return {
      success: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Initialize user data after signup
export async function initializeUserData(clerkUserId: string, userData: {
  email?: string
  firstName?: string
  lastName?: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  learningGoal: 'learning' | 'projects' | 'placement' | 'productivity'
  primaryDomain: string
  preferredLearningStyle?: string
  voiceCoachingEnabled?: boolean
}) {
  try {
    // Create user profile
    const profile = await userProfileOperations.create({
      clerk_user_id: clerkUserId,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      skill_level: userData.skillLevel,
      learning_goal: userData.learningGoal,
      primary_domain: userData.primaryDomain,
      current_xp: 0,
      current_level: 1,
      learning_streak: 0,
      voice_coaching_enabled: userData.voiceCoachingEnabled ?? true,
      preferred_learning_style: userData.preferredLearningStyle || 'mixed',
      timezone: 'UTC'
    })

    // Create AI peer profiles
    const defaultPeers = [
      {
        name: 'Sarah',
        personality: 'curious' as const,
        skill_level: 'beginner' as const,
        avatar_url: '/images/avatars/sarah-3d.png',
        common_mistakes: ['Array method confusion', 'Variable scope issues'],
        interaction_style: 'Asks thoughtful questions and seeks clarification',
        backstory: 'A curious learner who loves understanding the "why" behind code',
        is_active: true
      },
      {
        name: 'Alex',
        personality: 'analytical' as const,
        skill_level: 'intermediate' as const,
        avatar_url: '/images/avatars/alex-3d.png',
        common_mistakes: ['Async/await mixing', 'Performance optimization'],
        interaction_style: 'Methodical and detail-oriented, likes to compare approaches',
        backstory: 'An analytical thinker who enjoys breaking down complex problems',
        is_active: true
      },
      {
        name: 'Jordan',
        personality: 'supportive' as const,
        skill_level: 'advanced' as const,
        avatar_url: '/images/avatars/jordan-3d.png',
        common_mistakes: ['Architecture decisions', 'Code organization'],
        interaction_style: 'Encouraging and helpful, provides guidance and mentorship',
        backstory: 'A supportive mentor who helps others learn from mistakes',
        is_active: true
      }
    ]

    await aiPeerOperations.createForUser(profile.id, defaultPeers)

    // Initialize knowledge graph with basic concepts
    const basicConcepts = [
      'Variables & Data Types',
      'Functions',
      'Arrays & Objects',
      'Loops & Conditionals',
      'DOM Manipulation',
      'Async Programming',
      'Error Handling',
      'Testing'
    ]

    await knowledgeGraphOperations.initializeForUser(profile.id, basicConcepts)

    return { success: true, profile }
  } catch (error) {
    console.error('Error initializing user data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}