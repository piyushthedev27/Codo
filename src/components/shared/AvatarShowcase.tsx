/**
 * Avatar Showcase Component
 * Demonstrates the enhanced avatar system with all visual identity features
 */

'use client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, _useEffect } from 'react'
import { 
  Avatar, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _PeerAvatarSmall, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _PeerAvatarMedium, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _PeerAvatarLarge,
  TypingAvatar,
  InteractiveAvatar,
  AvatarGroup,
  CollaborativeAvatarStack
} from './Avatar'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getAllPeers, _getPersonalityEmoji, _getPersonalityDescription } from '@/lib/avatars'
import { useAvatarInteraction } from '@/contexts/AvatarContext'

export function AvatarShowcase() {
  const [activeDemo, setActiveDemo] = useState<string>('basic')
  const [activePeer, setActivePeer] = useState<string>('sarah')
  const peers = getAllPeers()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Enhanced Avatar System
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Engaging visual identity for synthetic peer learning
        </p>
      </div>

      {/* Demo Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { id: 'basic', label: 'Basic Avatars' },
          { id: 'interactive', label: 'Interactive' },
          { id: 'status', label: 'Status Indicators' },
          { id: 'groups', label: 'Avatar Groups' },
          { id: 'collaborative', label: 'Collaborative' }
        ].map(demo => (
          <button
            key={demo.id}
            onClick={() => setActiveDemo(demo.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeDemo === demo.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {demo.label}
          </button>
        ))}
      </div>

      {/* Basic Avatars Demo */}
      {activeDemo === 'basic' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Avatar Sizes</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <Avatar peerId="sarah" size="sm" showTooltip />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Small</p>
            </div>
            <div className="text-center">
              <Avatar peerId="alex" size="md" showTooltip />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Medium</p>
            </div>
            <div className="text-center">
              <Avatar peerId="jordan" size="lg" showTooltip />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Large</p>
            </div>
            <div className="text-center">
              <Avatar peerId="sarah" size="xl" showTooltip />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Extra Large</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Personality Badges</h3>
          <div className="flex items-center justify-center gap-8">
            {peers.map(peer => (
              <div key={peer.id} className="text-center">
                <Avatar 
                  peerId={peer.id} 
                  size="lg" 
                  showPersonalityBadge 
                  showTooltip 
                />
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{peer.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{peer.personality}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Demo */}
      {activeDemo === 'interactive' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Interactive Avatars</h3>
          <div className="flex items-center justify-center gap-8">
            {peers.map(peer => (
              <InteractiveAvatarDemo key={peer.id} peerId={peer.id} />
            ))}
          </div>
        </div>
      )}

      {/* Status Indicators Demo */}
      {activeDemo === 'status' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Status Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Avatar peerId="sarah" size="lg" showStatus status="online" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Online</p>
            </div>
            <div className="text-center">
              <Avatar peerId="alex" size="lg" showStatus status="typing" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Typing</p>
            </div>
            <div className="text-center">
              <Avatar peerId="jordan" size="lg" showStatus status="thinking" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Thinking</p>
            </div>
            <div className="text-center">
              <Avatar peerId="sarah" size="lg" showStatus status="offline" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Offline</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Typing Indicator</h3>
          <div className="flex justify-center">
            <TypingAvatar peerId="sarah" />
          </div>
        </div>
      )}

      {/* Avatar Groups Demo */}
      {activeDemo === 'groups' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Avatar Groups</h3>
          <div className="space-y-4">
            <div className="text-center">
              <AvatarGroup 
                peerIds={['sarah', 'alex', 'jordan']} 
                interactive 
                showStatus 
              />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Interactive Group</p>
            </div>
            <div className="text-center">
              <AvatarGroup 
                peerIds={['sarah', 'alex', 'jordan', 'sarah', 'alex']} 
                maxDisplay={3}
                size="md"
              />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Overflow Group</p>
            </div>
          </div>
        </div>
      )}

      {/* Collaborative Demo */}
      {activeDemo === 'collaborative' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Collaborative Coding</h3>
          <div className="flex justify-center">
            <CollaborativeAvatarStack 
              peerIds={['sarah', 'alex', 'jordan']}
              activeId={activePeer}
              onPeerClick={setActivePeer}
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click on avatars to see active states
            </p>
          </div>
        </div>
      )}

      {/* Feature Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Enhanced Avatar Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Visual Identity</h4>
            <ul className="mt-2 space-y-1">
              <li>• 3D rendered avatar images</li>
              <li>• Personality-based ring colors</li>
              <li>• Personality badges with emojis</li>
              <li>• Gradient overlays for personalities</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Interactions</h4>
            <ul className="mt-2 space-y-1">
              <li>• Hover effects and animations</li>
              <li>• Status indicators (online, typing, thinking)</li>
              <li>• Interactive tooltips with descriptions</li>
              <li>• Click animations and feedback</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Performance</h4>
            <ul className="mt-2 space-y-1">
              <li>• Image preloading and caching</li>
              <li>• Lazy loading for non-critical avatars</li>
              <li>• Error fallbacks and recovery</li>
              <li>• Optimized animations (60fps)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Accessibility</h4>
            <ul className="mt-2 space-y-1">
              <li>• WCAG 2.1 AA compliant</li>
              <li>• Screen reader support</li>
              <li>• Keyboard navigation</li>
              <li>• Reduced motion preferences</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Interactive Avatar Demo Component
function InteractiveAvatarDemo({ peerId }: { peerId: string }) {
  const [isActive, setIsActive] = useState(false)
  const { celebrate } = useAvatarInteraction(peerId)

  const handleClick = () => {
    setIsActive(!isActive)
    celebrate()
  }

  return (
    <div className="text-center">
      <InteractiveAvatar 
        peerId={peerId} 
        isActive={isActive}
        onClick={handleClick}
      />
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Click to interact
      </p>
    </div>
  )
}