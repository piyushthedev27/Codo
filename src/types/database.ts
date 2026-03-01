/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Database Types
 * TypeScript interfaces for all database tables and operations
 */

import type { EnhancedStats } from '@/lib/utils/stats-calculations'

// Enum types matching database enums
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'
export type LearningGoal = 'learning' | 'projects' | 'placement' | 'productivity'
export type PersonalityType = 'curious' | 'analytical' | 'supportive' | 'competitive' | 'mentor' | 'challenger' | 'peer' | 'specialist'
export type NodeStatus = 'locked' | 'in_progress' | 'mastered'
export type SessionStatus = 'active' | 'completed' | 'paused'
export type InsightType = 'pattern_detected' | 'velocity_change' | 'retention_risk' | 'strength_identified'
export type PriorityLevel = 'low' | 'medium' | 'high'
export type ActivityType = 'lesson' | 'challenge' | 'voice_coaching' | 'collaborative_coding' | 'mistake_analysis'
export type CompletionStatus = 'not_started' | 'in_progress' | 'completed'

// Core database interfaces
export interface UserProfile {
  achievements_count: number
  id: string
  clerk_user_id: string
  email?: string
  first_name?: string
  last_name?: string
  skill_level: SkillLevel
  learning_goal: LearningGoal
  primary_domain: string
  current_xp: number
  current_level: number
  learning_streak: number
  voice_coaching_enabled: boolean
  preferred_learning_style: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface AIPeerProfile {
  id: string
  user_id: string
  name: string
  personality: PersonalityType
  skill_level: SkillLevel
  avatar_url?: string
  common_mistakes: string[]
  interaction_style?: string
  backstory?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface KnowledgeGraphNode {
  id: string
  user_id: string
  concept: string
  category: string
  prerequisites: string[]
  status: NodeStatus
  position: { x: number; y: number }
  connections: string[]
  mastery_percentage: number
  estimated_duration_minutes: number
  difficulty_level: number
  created_at: string
  updated_at: string
}

export interface MistakePattern {
  id: string
  user_id: string
  error_type: string
  error_message: string
  code_context?: string
  language: string
  frequency: number
  last_occurrence: string
  resolved: boolean
  micro_lesson_generated: boolean
  resolution_notes?: string
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  user_id: string
  title: string
  topic: string
  difficulty_level: number
  content: Record<string, any>
  peer_interactions: PeerInteraction[]
  voice_coaching_points: VoiceCoachingPoint[]
  completion_status: CompletionStatus
  progress_percentage: number
  time_spent_minutes: number
  xp_earned: number
  mistakes_made: number
  peer_interactions_count: number
  voice_coaching_used: boolean
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface PeerInteraction {
  id: string
  peer_id: string
  interaction_type: 'question' | 'comment' | 'mistake' | 'explanation_request'
  content: string
  trigger_point: number
  user_response_required: boolean
  xp_reward: number
}

export interface VoiceCoachingPoint {
  id: string
  trigger_condition: string
  voice_prompt: string
  context_data: any
  response_expected: boolean
}

export interface CollaborativeCodingSession {
  id: string
  challenge_id?: string
  user_id: string
  session_name?: string
  participants: (string | AIPeerProfile)[]
  code_state: string
  cursor_positions: CursorPosition[]
  chat_messages: ChatMessage[]
  session_status: SessionStatus
  language: string
  started_at: string
  ended_at?: string
  created_at: string
  updated_at: string
}

export interface CursorPosition {
  participant_id: string
  line: number
  column: number
  selection_start?: number
  selection_end?: number
  last_activity: string
}

export interface ChatMessage {
  id: string
  participant_id: string
  message: string
  timestamp: string
  message_type: 'text' | 'code' | 'system'
}

export interface LearningInsight {
  id: string
  user_id: string
  insight_type: InsightType
  title: string
  message: string
  action_recommended?: string
  priority: PriorityLevel
  dismissed: boolean
  dismissed_at?: string
  expires_at?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface LearningActivity {
  id: string
  user_id: string
  activity_type: ActivityType | string
  content_id?: string
  title?: string
  description?: string
  xp_earned: number
  duration_minutes: number
  peer_interactions_count: number
  voice_coaching_used: boolean
  mistakes_made: number
  completion_percentage: number
  metadata: Record<string, any>
  activity_timestamp?: string
  created_at: string
  updated_at: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  difficulty_level: number
  category: string
  language: string
  starter_code: string
  solution_code?: string
  test_cases: TestCase[]
  hints: string[]
  estimated_duration_minutes: number
  xp_reward: number
  tags: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TestCase {
  input: string
  expected: string
  description?: string
}

export interface ChallengeAttempt {
  id: string
  user_id: string
  challenge_id: string
  code_submission: string
  status: CompletionStatus
  score: number
  time_taken_minutes: number
  hints_used: number
  test_cases_passed: number
  total_test_cases: number
  peer_collaboration: boolean
  voice_coaching_used: boolean
  feedback?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface VoiceCoachingSession {
  id: string
  user_id: string
  lesson_id?: string
  challenge_id?: string
  session_duration_minutes: number
  questions_asked: number
  responses_given: number
  code_suggestions: number
  user_satisfaction_rating?: number
  transcript: VoiceTranscriptEntry[]
  created_at: string
  updated_at: string
}

export interface VoiceTranscriptEntry {
  timestamp: string
  speaker: 'user' | 'ai'
  content: string
  confidence?: number
}

// API Response types
export interface DatabaseResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  hasMore: boolean
}

// User onboarding data
export interface OnboardingData {
  skillLevel: SkillLevel
  learningGoal: LearningGoal
  primaryDomain: string
  preferredLearningStyle: string
  voiceCoachingEnabled: boolean
}

// Dashboard data aggregation
export interface DashboardData {
  profile: UserProfile
  aiPeers: AIPeerProfile[]
  knowledgeGraph: KnowledgeGraphNode[]
  recentActivities: EnhancedActivity[]
  activeInsights: LearningInsight[]
  currentStreak: number
  weeklyProgress: {
    xpEarned: number
    lessonsCompleted: number
    challengesAttempted: number
    voiceSessionsUsed: number
  }
  upcomingMilestones: {
    nextLevel: {
      current: number
      next: number
      xpNeeded: number
    }
    nextConcept: KnowledgeGraphNode | null
  }
  // Enhanced dashboard data
  enhancedStats?: EnhancedStats
  recommendedLessons?: RecommendedLesson[]
  // New enhanced fields (Requirements 23.1-23.5)
  peerStatuses?: any[]
  recentMessages?: any[]
  currentTrack?: any
  nextMilestone?: any
}

// Enhanced activity type for dashboard
export interface EnhancedActivity {
  id: string
  type: 'lesson_completed' | 'achievement' | 'collaboration' | 'practice'
  title: string
  description: string
  xpEarned?: number
  peerInvolved?: string
  rating?: number
  timestamp: string
}

// Recommended lesson type
export interface RecommendedLesson {
  id: string
  title: string
  duration: string
  difficulty: string
  description: string
  recommendedBy: string
  thumbnail: string
}

// Learning statistics
export interface LearningStats {
  totalXP: number
  currentLevel: number
  learningStreak: number
  conceptsMastered: number
  totalConcepts: number
  averageSessionTime: number
  mistakePatterns: {
    mostCommon: string[]
    resolved: number
    unresolved: number
  }
  peerInteractions: {
    questionsAsked: number
    explanationsGiven: number
    bonusXPEarned: number
  }
  voiceCoaching: {
    sessionsUsed: number
    averageRating: number
    totalMinutes: number
  }
}

// Knowledge graph visualization data
export interface KnowledgeGraphData {
  nodes: Array<{
    id: string
    concept: string
    status: NodeStatus
    position: { x: number; y: number }
    masteryPercentage: number
    difficultyLevel: number
    estimatedDuration: number
  }>
  edges: Array<{
    source: string
    target: string
    type: 'prerequisite' | 'related'
  }>
  userProgress: {
    totalNodes: number
    completedNodes: number
    inProgressNodes: number
    lockedNodes: number
  }
}

// Mistake analysis data
export interface MistakeAnalysisData {
  patterns: MistakePattern[]
  categories: Array<{
    category: string
    count: number
    resolved: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }>
  recommendations: Array<{
    type: 'micro_lesson' | 'practice' | 'review'
    title: string
    description: string
    priority: PriorityLevel
    estimatedTime: number
  }>
}

// Live insights data
export interface LiveInsightsData {
  insights: LearningInsight[]
  patterns: Array<{
    type: string
    description: string
    confidence: number
    actionable: boolean
  }>
  recommendations: Array<{
    title: string
    description: string
    action: string
    priority: PriorityLevel
  }>
}

// Export utility types
export type DatabaseTable =
  | 'user_profiles'
  | 'ai_peer_profiles'
  | 'knowledge_graph_nodes'
  | 'mistake_patterns'
  | 'lessons'
  | 'collaborative_coding_sessions'
  | 'learning_insights'
  | 'learning_activities'
  | 'enhanced_activities'
  | 'challenges'
  | 'challenge_attempts'
  | 'voice_coaching_sessions'

export type DatabaseOperation = 'select' | 'insert' | 'update' | 'delete'

// Supabase specific types
export interface SupabaseError {
  message: string
  details: string
  hint: string
  code: string
}

export interface SupabaseResponse<T> {
  data: T | null
  error: SupabaseError | null
  count?: number
  status: number
  statusText: string
}