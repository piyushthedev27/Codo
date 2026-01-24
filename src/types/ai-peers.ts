// AI Peer system types

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