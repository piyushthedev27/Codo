/**
 * Dashboard-specific Database Operations
 * Operations for enhanced dashboard functionality
 * Requirements: 23.1, 23.2, 23.3, 23.4, 23.5
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { supabase as _supabase, supabaseAdmin } from './supabase-client'

// ============================================================================
// User Learning Stats Operations (Requirement 23.1)
// ============================================================================

export interface UserLearningStats {
  id: string
  user_id: string
  learning_progress_percentage: number
  lessons_completed_count: number
  weekly_lessons_completed: number
  previous_week_lessons: number
  progress_trend: 'up' | 'down' | 'stable'
  current_streak_days: number
  best_streak_days: number
  streak_milestone_message: string | null
  last_activity_date: string | null
  skills_mastered_count: number
  recent_skills_mastered: string[]
  monthly_skills_acquired: number
  previous_month_skills: number
  skills_trend: 'up' | 'down' | 'stable'
  coding_time_this_week_minutes: number
  daily_average_minutes: number
  previous_week_minutes: number
  coding_time_trend: 'up' | 'down' | 'stable'
  created_at: string
  updated_at: string
}

export const userLearningStatsOperations = {
  async getByUserId(userId: string): Promise<UserLearningStats | null> {
    const { data, error } = await supabaseAdmin
      .from('user_learning_stats')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createOrUpdate(userId: string, stats: Partial<UserLearningStats>): Promise<UserLearningStats> {
    const existing = await this.getByUserId(userId)
    
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('user_learning_stats')
        .update(stats)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabaseAdmin
        .from('user_learning_stats')
        .insert({ user_id: userId, ...stats })
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  async updateProgress(userId: string, lessonsCompleted: number): Promise<UserLearningStats> {
    const existing = await this.getByUserId(userId)
    const previousWeek = existing?.weekly_lessons_completed || 0
    
    const trend = lessonsCompleted > previousWeek ? 'up' : 
                  lessonsCompleted < previousWeek ? 'down' : 'stable'
    
    return this.createOrUpdate(userId, {
      weekly_lessons_completed: lessonsCompleted,
      previous_week_lessons: previousWeek,
      progress_trend: trend,
      last_activity_date: new Date().toISOString().split('T')[0]
    })
  },

  async updateStreak(userId: string, currentStreak: number): Promise<UserLearningStats> {
    const existing = await this.getByUserId(userId)
    const bestStreak = Math.max(currentStreak, existing?.best_streak_days || 0)
    
    let milestoneMessage = null
    if (currentStreak === 7) milestoneMessage = "🎉 One week streak! You're on fire!"
    else if (currentStreak === 30) milestoneMessage = "🏆 30 day streak! Incredible dedication!"
    else if (currentStreak === 100) milestoneMessage = "💎 100 day streak! You're a legend!"
    
    return this.createOrUpdate(userId, {
      current_streak_days: currentStreak,
      best_streak_days: bestStreak,
      streak_milestone_message: milestoneMessage,
      last_activity_date: new Date().toISOString().split('T')[0]
    })
  },

  async updateSkills(userId: string, skillsMastered: number, recentSkills: string[]): Promise<UserLearningStats> {
    const existing = await this.getByUserId(userId)
    const previousMonth = existing?.monthly_skills_acquired || 0
    
    const trend = skillsMastered > previousMonth ? 'up' : 
                  skillsMastered < previousMonth ? 'down' : 'stable'
    
    return this.createOrUpdate(userId, {
      skills_mastered_count: skillsMastered,
      recent_skills_mastered: recentSkills.slice(0, 3),
      monthly_skills_acquired: skillsMastered,
      previous_month_skills: previousMonth,
      skills_trend: trend
    })
  },

  async updateCodingTime(userId: string, minutesThisWeek: number): Promise<UserLearningStats> {
    const existing = await this.getByUserId(userId)
    const previousWeek = existing?.coding_time_this_week_minutes || 0
    const dailyAverage = Math.round(minutesThisWeek / 7)
    
    const trend = minutesThisWeek > previousWeek ? 'up' : 
                  minutesThisWeek < previousWeek ? 'down' : 'stable'
    
    return this.createOrUpdate(userId, {
      coding_time_this_week_minutes: minutesThisWeek,
      daily_average_minutes: dailyAverage,
      previous_week_minutes: previousWeek,
      coding_time_trend: trend
    })
  }
}

// ============================================================================
// User AI Peers Operations (Requirement 23.2)
// ============================================================================

export interface UserAIPeer {
  id: string
  user_id: string
  peer_id: string
  status: 'online' | 'coding' | 'away' | 'studying' | 'offline'
  specialty_area: string | null
  skill_level_stars: number
  last_interaction_at: string | null
  total_interactions: number
  current_activity: string | null
  created_at: string
  updated_at: string
}

export const userAIPeersOperations = {
  async getByUserId(userId: string): Promise<UserAIPeer[]> {
    const { data, error } = await supabaseAdmin
      .from('user_ai_peers')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data || []
  },

  async createOrUpdate(userId: string, peerId: string, updates: Partial<UserAIPeer>): Promise<UserAIPeer> {
    const { data: existing } = await supabaseAdmin
      .from('user_ai_peers')
      .select('*')
      .eq('user_id', userId)
      .eq('peer_id', peerId)
      .single()
    
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('user_ai_peers')
        .update(updates)
        .eq('user_id', userId)
        .eq('peer_id', peerId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabaseAdmin
        .from('user_ai_peers')
        .insert({ user_id: userId, peer_id: peerId, ...updates })
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  async updateStatus(userId: string, peerId: string, status: UserAIPeer['status'], activity?: string): Promise<UserAIPeer> {
    return this.createOrUpdate(userId, peerId, {
      status,
      current_activity: activity || null
    })
  },

  async recordInteraction(userId: string, peerId: string): Promise<UserAIPeer> {
    const existing = await this.createOrUpdate(userId, peerId, {})
    
    return this.createOrUpdate(userId, peerId, {
      last_interaction_at: new Date().toISOString(),
      total_interactions: (existing.total_interactions || 0) + 1
    })
  }
}

// ============================================================================
// Peer Messages Operations (Requirement 23.2)
// ============================================================================

export interface PeerMessage {
  id: string
  user_id: string
  peer_id: string
  message_type: 'question' | 'encouragement' | 'tip' | 'comment' | 'suggestion'
  content: string
  context: string | null
  is_read: boolean
  requires_response: boolean
  conversation_thread_id: string | null
  created_at: string
  updated_at: string
}

export const peerMessagesOperations = {
  async getRecentByUserId(userId: string, limit: number = 10): Promise<PeerMessage[]> {
    const { data, error } = await supabaseAdmin
      .from('peer_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  async getByPeerId(userId: string, peerId: string, limit: number = 5): Promise<PeerMessage[]> {
    const { data, error } = await supabaseAdmin
      .from('peer_messages')
      .select('*')
      .eq('user_id', userId)
      .eq('peer_id', peerId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  async create(message: Omit<PeerMessage, 'id' | 'created_at' | 'updated_at'>): Promise<PeerMessage> {
    const { data, error } = await supabaseAdmin
      .from('peer_messages')
      .insert(message)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async markAsRead(messageId: string): Promise<PeerMessage> {
    const { data, error } = await supabaseAdmin
      .from('peer_messages')
      .update({ is_read: true })
      .eq('id', messageId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('peer_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    
    if (error) throw error
    return count || 0
  }
}

// ============================================================================
// Learning Tracks Operations (Requirement 23.3)
// ============================================================================

export interface LearningTrack {
  id: string
  name: string
  description: string | null
  category: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  total_lessons: number
  estimated_duration_hours: number
  prerequisites: string[]
  tags: string[]
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export const learningTracksOperations = {
  async getAll(): Promise<LearningTrack[]> {
    const { data, error } = await supabaseAdmin
      .from('learning_tracks')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async getById(trackId: string): Promise<LearningTrack | null> {
    const { data, error } = await supabaseAdmin
      .from('learning_tracks')
      .select('*')
      .eq('id', trackId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getByCategory(category: string): Promise<LearningTrack[]> {
    const { data, error } = await supabaseAdmin
      .from('learning_tracks')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data || []
  }
}

// ============================================================================
// User Track Progress Operations (Requirement 23.3)
// ============================================================================

export interface UserTrackProgress {
  id: string
  user_id: string
  track_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  progress_percentage: number
  lessons_completed: number
  current_lesson_id: string | null
  next_milestone_id: string | null
  milestones_completed: number
  time_spent_minutes: number
  estimated_completion_date: string | null
  started_at: string | null
  completed_at: string | null
  last_activity_at: string | null
  created_at: string
  updated_at: string
}

export const userTrackProgressOperations = {
  async getByUserId(userId: string): Promise<UserTrackProgress[]> {
    const { data, error } = await supabaseAdmin
      .from('user_track_progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getCurrentTrack(userId: string): Promise<UserTrackProgress | null> {
    const { data, error } = await supabaseAdmin
      .from('user_track_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .order('last_activity_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createOrUpdate(userId: string, trackId: string, updates: Partial<UserTrackProgress>): Promise<UserTrackProgress> {
    const { data: existing } = await supabaseAdmin
      .from('user_track_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('track_id', trackId)
      .single()
    
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('user_track_progress')
        .update(updates)
        .eq('user_id', userId)
        .eq('track_id', trackId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabaseAdmin
        .from('user_track_progress')
        .insert({ user_id: userId, track_id: trackId, ...updates })
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  async updateProgress(userId: string, trackId: string, lessonsCompleted: number, totalLessons: number): Promise<UserTrackProgress> {
    const progressPercentage = Math.round((lessonsCompleted / totalLessons) * 100)
    const status = progressPercentage === 100 ? 'completed' : 'in_progress'
    
    return this.createOrUpdate(userId, trackId, {
      lessons_completed: lessonsCompleted,
      progress_percentage: progressPercentage,
      status,
      last_activity_at: new Date().toISOString(),
      ...(status === 'completed' && { completed_at: new Date().toISOString() })
    })
  }
}

// ============================================================================
// Lesson Recommendations Operations (Requirement 23.4)
// ============================================================================

export interface LessonRecommendation {
  id: string
  user_id: string
  lesson_id: string | null
  title: string
  description: string | null
  duration_minutes: number
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  recommended_by_peer_id: string | null
  recommendation_reason: string | null
  relevance_score: number
  thumbnail_url: string | null
  topic_tags: string[]
  learning_objectives: string[]
  prerequisites: string[]
  is_active: boolean
  is_completed: boolean
  user_rating: number | null
  recommended_at: string
  expires_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export const lessonRecommendationsOperations = {
  async getActiveByUserId(userId: string, limit: number = 3): Promise<LessonRecommendation[]> {
    const { data, error } = await supabaseAdmin
      .from('lesson_recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_completed', false)
      .order('relevance_score', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  async create(recommendation: Omit<LessonRecommendation, 'id' | 'created_at' | 'updated_at' | 'recommended_at'>): Promise<LessonRecommendation> {
    const { data, error } = await supabaseAdmin
      .from('lesson_recommendations')
      .insert(recommendation)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async markCompleted(recommendationId: string, rating?: number): Promise<LessonRecommendation> {
    const { data, error } = await supabaseAdmin
      .from('lesson_recommendations')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        ...(rating && { user_rating: rating })
      })
      .eq('id', recommendationId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// ============================================================================
// Enhanced Activities Operations (Requirement 23.5)
// ============================================================================

export interface EnhancedActivity {
  id: string
  user_id: string
  activity_type: 'lesson_completed' | 'achievement' | 'collaboration' | 'practice' | 'challenge_completed' | 'peer_interaction' | 'voice_coaching' | 'milestone_reached'
  title: string
  description: string | null
  xp_earned: number
  bonus_xp: number
  xp_multiplier: number
  peer_involved_id: string | null
  peer_contribution_type: 'teaching' | 'collaboration' | 'encouragement' | 'challenge' | null
  category: string | null
  background_color: string | null
  icon_name: string | null
  priority_level: number
  duration_minutes: number
  completion_quality: number | null
  mistakes_made: number
  achievement_badge: string | null
  achievement_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | null
  celebration_shown: boolean
  activity_timestamp: string
  created_at: string
  updated_at: string
}

export const enhancedActivitiesOperations = {
  async getRecentByUserId(userId: string, limit: number = 10): Promise<EnhancedActivity[]> {
    const { data, error } = await supabaseAdmin
      .from('enhanced_activities')
      .select('*')
      .eq('user_id', userId)
      .order('activity_timestamp', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  async create(activity: Omit<EnhancedActivity, 'id' | 'created_at' | 'updated_at'>): Promise<EnhancedActivity> {
    const { data, error } = await supabaseAdmin
      .from('enhanced_activities')
      .insert(activity)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getTotalXP(userId: string, timeframe?: 'day' | 'week' | 'month'): Promise<number> {
    let query = supabaseAdmin
      .from('enhanced_activities')
      .select('xp_earned, bonus_xp')
      .eq('user_id', userId)
    
    if (timeframe) {
      const now = new Date()
      let startDate: Date
      
      if (timeframe === 'day') {
        startDate = new Date(now.setHours(0, 0, 0, 0))
      } else if (timeframe === 'week') {
        startDate = new Date(now.setDate(now.getDate() - 7))
      } else {
        startDate = new Date(now.setMonth(now.getMonth() - 1))
      }
      
      query = query.gte('activity_timestamp', startDate.toISOString())
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return (data || []).reduce((total, activity) => {
      return total + (activity.xp_earned || 0) + (activity.bonus_xp || 0)
    }, 0)
  }
}


