/**
 * Synthetic Peer Chat Component for Lessons
 * Displays AI peer interactions during lessons with 3D avatars
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ThumbsUp, HelpCircle, Lightbulb } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { getPeerProfile } from '@/lib/avatars'
import React from 'react'

interface PeerMessage {
  id: string
  peerId: string
  type: 'question' | 'comment' | 'suggestion' | 'encouragement'
  message: string
  timestamp: Date
  requiresResponse?: boolean
}

export function SyntheticPeerChat() {
  const [messages, setMessages] = useState<PeerMessage[]>([
    {
      id: '1',
      peerId: 'sarah',
      type: 'question',
      message: "I'm a bit confused about the difference between let and const. Can you explain when to use each one?",
      // eslint-disable-next-line react-hooks/purity
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      requiresResponse: true
    },
    {
      id: '2', 
      peerId: 'alex',
      type: 'comment',
      message: "Great explanation! I like how you broke down the scoping rules step by step.",
      // eslint-disable-next-line react-hooks/purity
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
    },
    {
      id: '3',
      peerId: 'jordan',
      type: 'suggestion',
      message: "Have you considered showing a practical example with a for loop? That might help illustrate the difference.",
      // eslint-disable-next-line react-hooks/purity
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
    }
  ])

  const [userResponse, setUserResponse] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'question': return HelpCircle
      case 'suggestion': return Lightbulb
      case 'encouragement': return ThumbsUp
      default: return Send
    }
  }

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'suggestion': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'encouragement': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      default: return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
    }
  }

  const handleSendResponse = () => {
    if (!userResponse.trim()) return

    // Add user response (simulated)
    const newMessage: PeerMessage = {
      id: Date.now().toString(),
      peerId: 'user',
      type: 'comment',
      message: userResponse,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setUserResponse('')
    
    // Simulate AI peer response
    setIsTyping(true)
    setTimeout(() => {
      const peerResponse: PeerMessage = {
        id: (Date.now() + 1).toString(),
        peerId: 'sarah',
        type: 'encouragement',
        message: "Thanks for the explanation! That really helps me understand the concept better. 🎉",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, peerResponse])
      setIsTyping(false)
    }, 2000)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <Avatar peerId="sarah" size="sm" className="border-2 border-white" showStatus status="online" />
            <Avatar peerId="alex" size="sm" className="border-2 border-white" showStatus status="online" />
            <Avatar peerId="jordan" size="sm" className="border-2 border-white" showStatus status="online" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Study Group Chat</h3>
            <p className="text-blue-100 text-sm">Sarah, Alex, and Jordan are here to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 ${message.peerId === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {message.peerId !== 'user' && (
                <Avatar 
                  peerId={message.peerId} 
                  size="sm" 
                  showStatus 
                  status="online"
                  showTooltip
                />
              )}
              
              <div className={`flex-1 max-w-xs ${message.peerId === 'user' ? 'ml-auto' : ''}`}>
                {message.peerId !== 'user' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {getPeerProfile(message.peerId)?.name || message.peerId}
                    </span>
                    {React.createElement(getMessageIcon(message.type), {
                      className: "w-4 h-4 text-gray-500"
                    })}
                  </div>
                )}
                
                <div className={`p-3 rounded-lg border ${
                  message.peerId === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : getMessageColor(message.type)
                }`}>
                  <p className={`text-sm ${
                    message.peerId === 'user' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {message.message}
                  </p>
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <Avatar 
              peerId="sarah" 
              size="sm" 
              showStatus 
              status="typing"
              animated
            />
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex gap-2">
          <input
            type="text"
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendResponse()}
            placeholder="Respond to your AI peers..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendResponse}
            disabled={!userResponse.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          💡 Earn bonus XP by helping your AI peers understand concepts!
        </div>
      </div>
    </div>
  )
}