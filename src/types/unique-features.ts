// Core types for unique features

export interface AIPeerProfile {
  id: string
  name: string
  personality: 'curious' | 'analytical' | 'supportive' | 'competitive'
  skill_level: 'beginner' | 'intermediate' | 'advanced'
  avatar_url: string
  common_mistakes: string[]
  interaction_style: string
  backstory: string
}

export interface KnowledgeGraphNode {
  id: string
  concept: string
  prerequisites: string[]
  status: 'locked' | 'in_progress' | 'mastered'
  position: { x: number; y: number }
  connections: string[]
  mastery_percentage: number
}

export interface MistakePattern {
  id: string
  user_id: string
  error_type: string
  error_message: string
  frequency: number
  last_occurrence: Date
  resolved: boolean
  micro_lesson_generated: boolean
}

export interface LearningInsight {
  id: string
  user_id: string
  insight_type: 'pattern_detected' | 'velocity_change' | 'retention_risk' | 'strength_identified'
  message: string
  action_recommended: string
  priority: 'low' | 'medium' | 'high'
  dismissed: boolean
  created_at: Date
}