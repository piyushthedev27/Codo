/**
 * Dashboard Peer Interactions Component
 * Displays AI peer interactions with 3D avatars
 */

'use client'

import { motion } from 'framer-motion'
import { MessageCircle, BookOpen, Trophy, Clock } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { getAllPeers } from '@/lib/avatars'

export function PeerInteractions() {
  const peers = getAllPeers()
  
  const recentInteractions = [
    {
      peerId: 'sarah',
      type: 'question',
      message: "Can you help me understand why we use async/await instead of promises?",
      timestamp: '2 minutes ago',
      status: 'pending'
    },
    {
      peerId: 'alex',
      type: 'collaboration',
      message: "Great job on the React component! Want to try a more complex challenge?",
      timestamp: '15 minutes ago',
      status: 'completed'
    },
    {
      peerId: 'jordan',
      type: 'teaching',
      message: "Thanks for explaining closures! I think I understand it better now.",
      timestamp: '1 hour ago',
      status: 'completed'
    }
  ]

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'question': return MessageCircle
      case 'collaboration': return BookOpen
      case 'teaching': return Trophy
      default: return MessageCircle
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Peer Interactions
        </h3>
        <div className="flex -space-x-2">
          {peers.map((peer) => (
            <Avatar 
              key={peer.id}
              peerId={peer.id} 
              size="sm" 
              className="border-2 border-white dark:border-gray-800"
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {recentInteractions.map((interaction, index) => {
          const Icon = getInteractionIcon(interaction.type)
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <Avatar peerId={interaction.peerId} size="sm" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {interaction.peerId}
                  </span>
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500 capitalize">
                    {interaction.type}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {interaction.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {interaction.timestamp}
                  </span>
                  
                  {interaction.status === 'pending' && (
                    <button className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      Respond
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200">
          Start New Collaboration Session
        </button>
      </div>
    </div>
  )
}