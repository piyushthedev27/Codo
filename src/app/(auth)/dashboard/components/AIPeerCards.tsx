/**
 * AI Peer Cards Component
 * Displays AI learning companions with 3D avatars and interaction options
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/shared/Avatar'
import { MessageCircle, Settings, Star, Clock } from 'lucide-react'
import type { AIPeerProfile } from '@/types/database'

interface AIPeerCardsProps {
  peers: AIPeerProfile[]
}

export function AIPeerCards({ peers }: AIPeerCardsProps) {
  // Mock status data - in real app this would come from API
  const peerStatuses = {
    sarah: { status: 'online', lastMessage: 'Great job on that React component! Want to try...', time: '2 hours ago' },
    alex: { status: 'coding', lastMessage: 'I found an interesting algorithm approach...', time: '30 minutes ago' },
    jordan: { status: 'away', lastMessage: 'Let me help you debug that function...', time: '1 hour ago' }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'coding': return 'bg-blue-500'
      case 'away': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online'
      case 'coding': return 'Coding'
      case 'away': return 'Away'
      default: return 'Offline'
    }
  }

  const getPeerButtonColor = (peerName: string) => {
    switch (peerName.toLowerCase()) {
      case 'sarah': return 'bg-pink-500 hover:bg-pink-600 border-pink-200'
      case 'alex': return 'bg-blue-500 hover:bg-blue-600 border-blue-200'
      case 'jordan': return 'bg-purple-500 hover:bg-purple-600 border-purple-200'
      default: return 'bg-gray-500 hover:bg-gray-600 border-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Your AI Learning Companions
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4 mr-1" />
            Manage Peers
          </Button>
        </div>
        <CardDescription>
          Your personalized study buddies are ready to help you learn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {peers.map((peer) => {
            const peerName = peer.name.toLowerCase()
            const status = peerStatuses[peerName as keyof typeof peerStatuses] || { status: 'offline', lastMessage: '', time: '' }
            
            return (
              <div 
                key={peer.id} 
                className="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`}></div>
                </div>

                {/* Avatar */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Avatar 
                      peerId={peerName} 
                      size="lg" 
                      className="ring-4 ring-white dark:ring-gray-800 shadow-lg"
                    />
                  </div>
                </div>

                {/* Peer Info */}
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                    {peer.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {getStatusText(status.status)}
                  </p>
                  <Badge variant="secondary" className="capitalize mb-2">
                    {peer.personality}
                  </Badge>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {peer.interaction_style.split(',')[0]}
                  </p>
                  
                  {/* Level with stars */}
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Level {peer.skill_level === 'beginner' ? '5' : peer.skill_level === 'intermediate' ? '7' : '6'}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chat Button */}
                <Button 
                  className={`w-full text-white ${getPeerButtonColor(peer.name)} group-hover:shadow-md transition-all duration-200`}
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat Now
                </Button>
              </div>
            )
          })}
        </div>

        {/* Recent Conversation Preview */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recent Conversation:</h4>
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Avatar peerId="sarah" size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                💬 "Great job on that React component! Want to try..."
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-500">- Sarah</span>
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}