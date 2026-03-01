/**
 * Peer Status Management System
 * Manages AI peer status simulation, specialties, and activity tracking
 */

import { AIPeerProfile } from './avatars'

export type PeerStatus = 'online' | 'coding' | 'away' | 'studying'

export interface PeerStatusInfo {
  status: PeerStatus
  lastActive: Date
  currentActivity?: string
  specialty: string
  level: number
  recentMessage?: {
    content: string
    timestamp: Date
  }
}

export interface PeerActivityMessage {
  peerId: string
  message: string
  timestamp: Date
  type: 'status' | 'activity' | 'achievement'
}

// Specialty assignments based on peer personality and skill level
const PEER_SPECIALTIES: Record<string, string> = {
  sarah: 'React Hooks & State Management',
  alex: 'Algorithm Optimization & Performance',
  jordan: 'Code Architecture & Best Practices'
}

// Level calculation based on skill level
const SKILL_LEVEL_TO_RATING: Record<string, number> = {
  beginner: 3,
  intermediate: 4,
  advanced: 5
}

// Status rotation patterns for realistic simulation
const STATUS_PATTERNS: Record<string, PeerStatus[]> = {
  sarah: ['online', 'studying', 'online', 'away', 'online'],
  alex: ['coding', 'online', 'coding', 'studying', 'online'],
  jordan: ['online', 'coding', 'online', 'away', 'studying']
}

// Activity messages for different statuses
const ACTIVITY_MESSAGES: Record<PeerStatus, string[]> = {
  online: [
    'Ready to help with your questions!',
    'Available for collaboration',
    'Let\'s learn together!'
  ],
  coding: [
    'Working on a challenging problem',
    'Practicing algorithm implementations',
    'Building a new project'
  ],
  studying: [
    'Learning about advanced patterns',
    'Reviewing core concepts',
    'Exploring new frameworks'
  ],
  away: [
    'Taking a short break',
    'Will be back soon',
    'Stepping away briefly'
  ]
}

// Recent message templates
const RECENT_MESSAGES: Record<string, string[]> = {
  sarah: [
    'Can you help me understand why we use async/await?',
    'I\'m confused about array methods. Could you explain?',
    'Great job on that component! Want to try a challenge?',
    'I learned something new today about closures!'
  ],
  alex: [
    'I found an interesting algorithm approach...',
    'Let\'s compare our solutions to this problem',
    'Have you considered the time complexity here?',
    'This optimization could improve performance by 40%'
  ],
  jordan: [
    'Let me help you debug that function',
    'Here\'s a better way to structure this code',
    'Great progress! You\'re really improving',
    'I noticed a pattern in your code that we can refactor'
  ]
}

/**
 * Get peer specialty based on their profile
 */
export function getPeerSpecialty(peerId: string): string {
  return PEER_SPECIALTIES[peerId.toLowerCase()] || 'General Programming'
}

/**
 * Calculate peer level with star rating (1-5)
 */
export function getPeerLevel(skillLevel: string): number {
  return SKILL_LEVEL_TO_RATING[skillLevel.toLowerCase()] || 3
}

/**
 * Simulate realistic peer status based on time and patterns
 */
export function simulatePeerStatus(peerId: string, userLearningFocus?: string): PeerStatus {
  const patterns = STATUS_PATTERNS[peerId.toLowerCase()] || ['online', 'away', 'studying']
  const hour = new Date().getHours()
  const index = Math.floor(hour / 5) % patterns.length

  // Adjust status based on user's learning focus
  if (userLearningFocus === 'active-learning' && patterns[index] === 'away') {
    return 'online' // Keep peers available during active learning
  }

  return patterns[index]
}

/**
 * Get activity message for current peer status
 */
export function getActivityMessage(status: PeerStatus): string {
  const messages = ACTIVITY_MESSAGES[status]
  const randomIndex = Math.floor(Math.random() * messages.length)
  return messages[randomIndex]
}

/**
 * Get recent message for a peer
 */
export function getRecentMessage(peerId: string): string {
  const messages = RECENT_MESSAGES[peerId.toLowerCase()] || ['Let\'s learn together!']
  const randomIndex = Math.floor(Math.random() * messages.length)
  return messages[randomIndex]
}

/**
 * Generate complete peer status info
 */
export function generatePeerStatusInfo(
  peer: AIPeerProfile,
  userLearningFocus?: string
): PeerStatusInfo {
  const status = simulatePeerStatus(peer.id, userLearningFocus)
  const specialty = getPeerSpecialty(peer.id)
  const level = getPeerLevel(peer.skill_level)

  return {
    status,
    lastActive: new Date(),
    currentActivity: getActivityMessage(status),
    specialty,
    level,
    recentMessage: {
      content: getRecentMessage(peer.id),
      timestamp: new Date(Date.now() - Math.random() * 7200000) // Random time within last 2 hours
    }
  }
}

/**
 * Get all peer statuses
 */
export function getAllPeerStatuses(
  peers: AIPeerProfile[],
  userLearningFocus?: string
): Map<string, PeerStatusInfo> {
  const statusMap = new Map<string, PeerStatusInfo>()

  peers.forEach(peer => {
    statusMap.set(peer.id, generatePeerStatusInfo(peer, userLearningFocus))
  })

  return statusMap
}

/**
 * Format time ago string
 */
export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}

/**
 * Get status indicator color classes
 */
export function getStatusColor(status: PeerStatus): string {
  const colors = {
    online: 'bg-green-500',
    coding: 'bg-blue-500',
    away: 'bg-gray-400',
    studying: 'bg-orange-500'
  }
  return colors[status] || 'bg-gray-400'
}

/**
 * Get status display text
 */
export function getStatusText(status: PeerStatus): string {
  const texts = {
    online: 'Online',
    coding: 'Coding',
    away: 'Away',
    studying: 'Studying'
  }
  return texts[status]
}

/**
 * Generate peer activity update
 */
export function generatePeerActivity(peerId: string, status: PeerStatus): PeerActivityMessage {
  return {
    peerId,
    message: getActivityMessage(status),
    timestamp: new Date(),
    type: 'activity'
  }
}
