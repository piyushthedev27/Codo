// Collaborative coding types

export interface CollaborativeCodingSession {
  id: string
  challenge_id: string
  participants: (string | AIPeerProfile)[]
  code_state: string
  cursor_positions: CursorPosition[]
  chat_messages: ChatMessage[]
  session_status: 'active' | 'completed' | 'paused'
  created_at: Date
}

export interface CursorPosition {
  participant_id: string
  line: number
  column: number
  selection_start?: number
  selection_end?: number
  last_activity: Date
}

export interface ChatMessage {
  id: string
  participant_id: string
  message: string
  timestamp: Date
}

import type { AIPeerProfile } from './unique-features'