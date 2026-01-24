/**
 * Centralized Avatar Management System
 * Provides consistent 3D avatar URLs and utilities for AI peers throughout the platform
 */

export interface AIPeerProfile {
  id: string
  name: string
  personality: 'curious' | 'analytical' | 'supportive' | 'competitive' | 'mentor' | 'challenger' | 'peer' | 'specialist'
  skill_level: 'beginner' | 'intermediate' | 'advanced'
  avatar_url: string
  common_mistakes: string[]
  interaction_style: string
  backstory: string
}

// Core AI Peer Profiles with 3D Avatars
export const AI_PEERS: Record<string, AIPeerProfile> = {
  sarah: {
    id: 'sarah',
    name: 'Sarah',
    personality: 'curious',
    skill_level: 'beginner',
    avatar_url: '/images/avatars/sarah-3d.png',
    common_mistakes: ['Array method confusion', 'Variable scope issues'],
    interaction_style: 'Asks thoughtful questions and seeks clarification',
    backstory: 'A curious learner who loves understanding the "why" behind code'
  },
  alex: {
    id: 'alex', 
    name: 'Alex',
    personality: 'analytical',
    skill_level: 'intermediate',
    avatar_url: '/images/avatars/alex-3d.png',
    common_mistakes: ['Async/await mixing', 'Performance optimization'],
    interaction_style: 'Methodical and detail-oriented, likes to compare approaches',
    backstory: 'An analytical thinker who enjoys breaking down complex problems'
  },
  jordan: {
    id: 'jordan',
    name: 'Jordan', 
    personality: 'supportive',
    skill_level: 'advanced',
    avatar_url: '/images/avatars/jordan-3d.png',
    common_mistakes: ['Architecture decisions', 'Code organization'],
    interaction_style: 'Encouraging and helpful, provides guidance and mentorship',
    backstory: 'A supportive mentor who helps others learn from mistakes'
  }
}

// Avatar utility functions
export const getAvatarUrl = (peerId: string): string => {
  const peer = AI_PEERS[peerId.toLowerCase()]
  return peer?.avatar_url || '/images/avatars/sarah-3d.png' // Default fallback
}

export const getPeerProfile = (peerId: string): AIPeerProfile | null => {
  return AI_PEERS[peerId.toLowerCase()] || null
}

export const getAllPeers = (): AIPeerProfile[] => {
  return Object.values(AI_PEERS)
}

// Avatar component props interface
export interface AvatarProps {
  peerId: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showRing?: boolean
  ringColor?: string
  showStatus?: boolean
  status?: 'online' | 'typing' | 'thinking' | 'offline'
  animated?: boolean
  interactive?: boolean
}

// Size mappings for consistent avatar sizing
export const AVATAR_SIZES = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
}

// Ring color mappings for different personalities
export const PERSONALITY_RINGS = {
  curious: 'ring-pink-400',
  analytical: 'ring-blue-400', 
  supportive: 'ring-green-400',
  competitive: 'ring-red-400',
  mentor: 'ring-purple-400',
  challenger: 'ring-orange-400',
  peer: 'ring-indigo-400',
  specialist: 'ring-yellow-400'
}

// Status indicator colors and animations
export const STATUS_INDICATORS = {
  online: 'bg-green-400 animate-pulse',
  typing: 'bg-blue-400 animate-bounce',
  thinking: 'bg-yellow-400 animate-pulse',
  offline: 'bg-gray-400'
}

// Personality-based background gradients for enhanced visual identity
export const PERSONALITY_GRADIENTS = {
  curious: 'from-pink-100 to-pink-50 dark:from-pink-900/20 dark:to-pink-800/10',
  analytical: 'from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10',
  supportive: 'from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10',
  competitive: 'from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-800/10',
  mentor: 'from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/10',
  challenger: 'from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10',
  peer: 'from-indigo-100 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-800/10',
  specialist: 'from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10'
}

// Generate avatar component class names
export const getAvatarClasses = (props: AvatarProps): string => {
  const { peerId, size = 'md', className = '', showRing = true, ringColor, animated = false, interactive = false } = props
  const peer = getPeerProfile(peerId)
  
  const sizeClass = AVATAR_SIZES[size]
  const ringClass = showRing 
    ? ringColor || (peer ? PERSONALITY_RINGS[peer.personality] : 'ring-gray-400')
    : ''
  
  const animationClass = animated ? 'transition-all duration-300 ease-in-out' : ''
  const interactiveClass = interactive ? 'hover:scale-110 hover:shadow-lg cursor-pointer' : ''
  
  return `${sizeClass} rounded-full overflow-hidden ${showRing ? `ring-2 ${ringClass}` : ''} ${animationClass} ${interactiveClass} ${className}`.trim()
}

// Get status indicator classes
export const getStatusClasses = (status: string): string => {
  return STATUS_INDICATORS[status as keyof typeof STATUS_INDICATORS] || STATUS_INDICATORS.offline
}

// Get personality gradient classes
export const getPersonalityGradient = (personality: string): string => {
  return PERSONALITY_GRADIENTS[personality as keyof typeof PERSONALITY_GRADIENTS] || PERSONALITY_GRADIENTS.peer
}

// Preload avatars for better performance
export const preloadAvatars = (): void => {
  if (typeof window !== 'undefined') {
    Object.values(AI_PEERS).forEach(peer => {
      const img = new Image()
      img.src = peer.avatar_url
    })
  }
}

// Avatar accessibility helpers
export const getAvatarAlt = (peerId: string): string => {
  const peer = getPeerProfile(peerId)
  return peer ? `${peer.name} - ${peer.personality} AI peer` : 'AI peer avatar'
}

export const getAvatarAriaLabel = (peerId: string): string => {
  const peer = getPeerProfile(peerId)
  return peer 
    ? `${peer.name}, ${peer.personality} AI study buddy, ${peer.skill_level} level`
    : 'AI study buddy'
}

// Enhanced avatar interaction helpers
export const getPersonalityEmoji = (personality: string): string => {
  const emojiMap = {
    curious: '🤔',
    analytical: '🧠',
    supportive: '🤝',
    competitive: '🏆',
    mentor: '👨‍🏫',
    challenger: '⚡',
    peer: '👥',
    specialist: '🎯'
  }
  return emojiMap[personality as keyof typeof emojiMap] || '🤖'
}

export const getPersonalityDescription = (personality: string): string => {
  const descriptions = {
    curious: 'Asks thoughtful questions and loves exploring new concepts',
    analytical: 'Methodical thinker who breaks down complex problems',
    supportive: 'Encouraging mentor who helps others learn from mistakes',
    competitive: 'Thrives on challenges and friendly competition',
    mentor: 'Experienced guide who provides wisdom and direction',
    challenger: 'Pushes boundaries and encourages growth',
    peer: 'Collaborative learner who shares the journey',
    specialist: 'Expert in specific domains with deep knowledge'
  }
  return descriptions[personality as keyof typeof descriptions] || 'AI learning companion'
}

// Avatar animation presets
export const AVATAR_ANIMATIONS = {
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  ping: 'animate-ping',
  wiggle: 'animate-wiggle', // Custom animation
  glow: 'animate-glow' // Custom animation
}