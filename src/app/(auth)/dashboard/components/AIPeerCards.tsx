/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Enhanced AI Peer Cards Component
 * Displays AI learning companions with 3D avatars, status indicators, and interaction features
 * Requirements: 21.7, 21.8, 21.9, 21.10, 23.2, 24.4
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { _Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/shared/Avatar'
import { MessageCircle, Settings, Star, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import type { AIPeerProfile } from '@/types/database'
import {
  getAllPeerStatuses,
  getStatusColor,
  getStatusText,
  formatTimeAgo,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type _PeerStatusInfo
} from '@/lib/peer-status'
import { useMemo } from 'react'

interface AIPeerCardsProps {
  peers: AIPeerProfile[]
}

export function AIPeerCards({ peers }: AIPeerCardsProps) {
  // Generate realistic peer statuses with specialty and level info
  const peerStatusMap = useMemo(() => {
    // Convert database peers to library format for status generation
    const libraryPeers = peers.map(p => ({
      id: p.name.toLowerCase(),
      name: p.name,
      personality: p.personality as any,
      skill_level: p.skill_level as any,
      avatar_url: p.avatar_url || '',
      common_mistakes: p.common_mistakes || [],
      interaction_style: p.interaction_style || '',
      backstory: p.backstory || ''
    }))

    return getAllPeerStatuses(libraryPeers)
  }, [peers])

  // Get personality-based button colors (pink/blue/green per requirements)
  const getPeerButtonColor = (peerName: string): string => {
    const colorMap: Record<string, string> = {
      sarah: 'bg-pink-500 hover:bg-pink-600 hover:shadow-pink-500/50',
      alex: 'bg-blue-500 hover:bg-blue-600 hover:shadow-blue-500/50',
      jordan: 'bg-green-500 hover:bg-green-600 hover:shadow-green-500/50'
    }
    return colorMap[peerName.toLowerCase()] || 'bg-gray-500 hover:bg-gray-600'
  }

  // Get personality-based glow effect for hover animations
  const getPeerGlowColor = (peerName: string): string => {
    const glowMap: Record<string, string> = {
      sarah: 'group-hover:shadow-pink-400/50',
      alex: 'group-hover:shadow-blue-400/50',
      jordan: 'group-hover:shadow-green-400/50'
    }
    return glowMap[peerName.toLowerCase()] || 'group-hover:shadow-gray-400/50'
  }

  // Get most recent message across all peers for preview
  const mostRecentMessage = useMemo(() => {
    let latest = { peerId: 'sarah', peerName: 'Sarah', content: '', timestamp: new Date(0) }

    peerStatusMap.forEach((status, peerId) => {
      if (status.recentMessage && status.recentMessage.timestamp > latest.timestamp) {
        const peer = peers.find(p => p.name.toLowerCase() === peerId)
        latest = {
          peerId,
          peerName: peer?.name || peerId,
          content: status.recentMessage.content,
          timestamp: status.recentMessage.timestamp
        }
      }
    })

    return latest
  }, [peerStatusMap, peers])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Your AI Learning Companions
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/settings/peers'}
          >
            <Settings className="w-4 h-4 mr-1" />
            Manage Peers
          </Button>
        </div>
        <CardDescription>
          Your personalized study buddies are ready to help you learn
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 3 Peer Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {peers.map((peer, index) => {
            const peerName = peer.name.toLowerCase()
            const statusInfo = peerStatusMap.get(peerName)
            if (!statusInfo) return null

            return (
              <motion.div
                key={peer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:scale-105 hover:shadow-xl ${getPeerGlowColor(peerName)} transition-all duration-300 cursor-pointer`}
              >
                {/* Status Indicator with colored dot */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(statusInfo.status)} animate-pulse`} />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {getStatusText(statusInfo.status)}
                  </span>
                </div>

                {/* 3D Avatar with Ring */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <Avatar
                    peerId={peerName}
                    size="lg"
                    className="ring-4 ring-white dark:ring-gray-800 shadow-lg group-hover:ring-offset-2 transition-all"
                  />
                </div>

                {/* Peer Name */}
                <h3 className="text-center font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-1">
                  {peer.name}
                </h3>

                {/* Specialty */}
                <p className="text-center text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                  {statusInfo.specialty}
                </p>

                {/* Level with Star Rating (1-5 stars) */}
                <div className="flex items-center justify-center gap-1 mb-3 sm:mb-4">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Level {statusInfo.level}
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < statusInfo.level ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Chat Now Button with Personality Color (pink/blue/green) */}
                <Button
                  className={`w-full ${getPeerButtonColor(peer.name)} text-white py-2 px-3 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2`}
                  size="sm"
                  onClick={() => {
                    // Navigate to a specific demo lesson with this peer as companion
                    const lessonMap: Record<string, string> = {
                      sarah: 'react-hooks',
                      alex: 'javascript-async',
                      jordan: 'typescript-basics'
                    }
                    const topic = lessonMap[peerName] || 'react-hooks'
                    window.location.href = `/lessons/${topic}?peer=${peerName}`
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat Now
                </Button>
              </motion.div>
            )
          })}
        </div>

        {/* Recent Message Preview */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Recent Messages:
          </h4>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800"
          >
            <Avatar peerId={mostRecentMessage.peerId} size="sm" className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {mostRecentMessage.peerName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(mostRecentMessage.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                💬 &quot;{mostRecentMessage.content}&quot;
              </p>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}