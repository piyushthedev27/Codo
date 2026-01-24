/**
 * Reusable Avatar Component for AI Peers
 * Provides consistent 3D avatar display with accessibility, animations, and engaging visual identity
 */

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { 
  getAvatarUrl, 
  getPeerProfile, 
  getAvatarClasses, 
  getAvatarAlt, 
  getAvatarAriaLabel,
  getStatusClasses,
  getPersonalityGradient,
  getPersonalityEmoji,
  getPersonalityDescription,
  type AvatarProps 
} from '@/lib/avatars'

interface ExtendedAvatarProps extends AvatarProps {
  onClick?: () => void
  onHover?: () => void
  loading?: 'lazy' | 'eager'
  priority?: boolean
  showTooltip?: boolean
  showPersonalityBadge?: boolean
}

export function Avatar({ 
  peerId, 
  size = 'md', 
  className = '', 
  showRing = true, 
  ringColor,
  showStatus = false,
  status = 'online',
  animated = false,
  interactive = false,
  onClick,
  onHover,
  loading = 'lazy',
  priority = false,
  showTooltip = false,
  showPersonalityBadge = false
}: ExtendedAvatarProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const peer = getPeerProfile(peerId)
  const avatarUrl = getAvatarUrl(peerId)
  const avatarClasses = getAvatarClasses({ 
    peerId, 
    size, 
    className, 
    showRing, 
    ringColor, 
    animated: animated || interactive,
    interactive 
  })
  const altText = getAvatarAlt(peerId)
  const ariaLabel = getAvatarAriaLabel(peerId)
  const statusClasses = getStatusClasses(status)
  const personalityGradient = peer ? getPersonalityGradient(peer.personality) : ''
  const personalityEmoji = peer ? getPersonalityEmoji(peer.personality) : '🤖'
  const personalityDescription = peer ? getPersonalityDescription(peer.personality) : ''

  // Enhanced hover effects for interactive avatars
  const handleMouseEnter = () => {
    setIsHovered(true)
    onHover?.()
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // Enhanced click handling with visual feedback
  const handleClick = () => {
    if (onClick) {
      // Add click animation
      const element = document.getElementById(`avatar-${peerId}`)
      if (element) {
        element.classList.add('animate-pulse')
        setTimeout(() => element.classList.remove('animate-pulse'), 300)
      }
      onClick()
    }
  }

  return (
    <div className="relative inline-block group">
      {/* Main Avatar Container */}
      <div 
        id={`avatar-${peerId}`}
        className={`${avatarClasses} relative ${isHovered && interactive ? 'transform scale-110 shadow-xl' : ''} ${!imageLoaded ? 'animate-pulse bg-gray-200' : ''}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={ariaLabel}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        } : undefined}
      >
        {/* Personality Background Gradient (subtle) */}
        {peer && (
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${personalityGradient} opacity-20 -z-10`} />
        )}

        {/* Avatar Image */}
        <Image
          src={avatarUrl}
          alt={altText}
          width={80}
          height={80}
          className={`w-full h-full object-cover bg-white transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          {...(priority ? { priority: true } : { loading })}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Fallback to Sarah's avatar if image fails to load
            const target = e.target as HTMLImageElement
            target.src = '/images/avatars/sarah-3d.png'
            setImageLoaded(true)
          }}
        />
        
        {/* Status Indicator */}
        {showStatus && (
          <div 
            className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${statusClasses}`}
            title={`${peer?.name || 'AI Peer'} is ${status}`}
            aria-label={`Status: ${status}`}
          />
        )}

        {/* Personality Badge */}
        {showPersonalityBadge && peer && (
          <div 
            className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-xs border-2 border-gray-200 dark:border-gray-600"
            title={`${peer.name} - ${peer.personality}`}
          >
            {personalityEmoji}
          </div>
        )}

        {/* Interactive Glow Effect */}
        {interactive && isHovered && (
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${personalityGradient} opacity-30 animate-pulse`} />
        )}
      </div>

      {/* Enhanced Tooltip */}
      {showTooltip && peer && isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
          <div className="font-semibold">{peer.name}</div>
          <div className="text-xs opacity-75">{personalityDescription}</div>
          <div className="text-xs opacity-50">{peer.skill_level} level</div>
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
        </div>
      )}
    </div>
  )
}

// Specialized avatar variants for common use cases
export function PeerAvatarSmall({ peerId, onClick, status }: { 
  peerId: string, 
  onClick?: () => void,
  status?: 'online' | 'typing' | 'thinking' | 'offline'
}) {
  return (
    <Avatar 
      peerId={peerId} 
      size="sm" 
      onClick={onClick} 
      showStatus={true}
      status={status}
      animated={true}
      interactive={!!onClick}
    />
  )
}

export function PeerAvatarMedium({ peerId, onClick, showTooltip = false }: { 
  peerId: string, 
  onClick?: () => void,
  showTooltip?: boolean
}) {
  return (
    <Avatar 
      peerId={peerId} 
      size="md" 
      onClick={onClick} 
      showStatus={true}
      animated={true}
      interactive={!!onClick}
      showTooltip={showTooltip}
      showPersonalityBadge={true}
    />
  )
}

export function PeerAvatarLarge({ peerId, onClick, interactive = true }: { 
  peerId: string, 
  onClick?: () => void,
  interactive?: boolean
}) {
  return (
    <Avatar 
      peerId={peerId} 
      size="lg" 
      onClick={onClick} 
      priority 
      showStatus={true}
      animated={true}
      interactive={interactive}
      showTooltip={true}
      showPersonalityBadge={true}
    />
  )
}

// Typing indicator avatar for chat interfaces
export function TypingAvatar({ peerId }: { peerId: string }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar 
        peerId={peerId} 
        size="sm" 
        showStatus={true}
        status="typing"
        animated={true}
      />
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

// Animated avatar for lesson interactions
export function InteractiveAvatar({ peerId, isActive = false, onClick }: { 
  peerId: string, 
  isActive?: boolean,
  onClick?: () => void
}) {
  return (
    <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
      <Avatar 
        peerId={peerId} 
        size="md" 
        onClick={onClick}
        showStatus={true}
        status={isActive ? 'thinking' : 'online'}
        animated={true}
        interactive={true}
        showTooltip={true}
      />
      {isActive && (
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-ping" />
      )}
    </div>
  )
}

// Avatar group component for displaying multiple peers
export function AvatarGroup({ 
  peerIds, 
  maxDisplay = 3, 
  size = 'sm',
  interactive = false,
  showStatus = false 
}: { 
  peerIds: string[], 
  maxDisplay?: number,
  size?: 'sm' | 'md' | 'lg' | 'xl',
  interactive?: boolean,
  showStatus?: boolean
}) {
  const displayPeers = peerIds.slice(0, maxDisplay)
  const remainingCount = peerIds.length - maxDisplay

  return (
    <div className="flex -space-x-2 hover:space-x-1 transition-all duration-300">
      {displayPeers.map((peerId, index) => (
        <div 
          key={peerId}
          className={`transition-transform duration-300 hover:scale-110 hover:z-10`}
          style={{ zIndex: 10 - index }}
        >
          <Avatar 
            peerId={peerId} 
            size={size}
            className="border-2 border-white dark:border-gray-800"
            showStatus={showStatus}
            animated={interactive}
            interactive={interactive}
            showTooltip={interactive}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform duration-300">
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

// Collaborative avatar stack for coding sessions
export function CollaborativeAvatarStack({ 
  peerIds, 
  activeId,
  onPeerClick 
}: { 
  peerIds: string[], 
  activeId?: string,
  onPeerClick?: (peerId: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {peerIds.map((peerId) => (
        <div 
          key={peerId}
          className={`relative ${activeId === peerId ? 'ring-2 ring-blue-400 rounded-full' : ''}`}
        >
          <Avatar 
            peerId={peerId} 
            size="md"
            onClick={() => onPeerClick?.(peerId)}
            showStatus={true}
            status={activeId === peerId ? 'typing' : 'online'}
            animated={true}
            interactive={true}
            showTooltip={true}
          />
          {activeId === peerId && (
            <div className="absolute -inset-1 bg-blue-400 rounded-full opacity-20 animate-pulse" />
          )}
        </div>
      ))}
    </div>
  )
}