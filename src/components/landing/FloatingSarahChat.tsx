'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, BookOpen } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'

export function FloatingSarahChat() {
  const [isVisible, setIsVisible] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Show the chat after 2 seconds
    const timer = setTimeout(() => {
      if (!isDismissed) {
        setIsVisible(true)
        // Start typing animation after appearing
        setTimeout(() => setIsTyping(true), 500)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [isDismissed])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
  }

  if (isDismissed) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          {/* Chat Bubble */}
          <div className="relative bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl shadow-2xl p-4 mb-3">
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-pink-100 dark:hover:bg-pink-800/50 transition-colors"
              aria-label="Dismiss chat"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Sarah's Avatar and Info */}
            <div className="flex items-start gap-3 mb-3">
              <div className="relative">
                {/* Sarah's 3D Avatar */}
                <Avatar 
                  peerId="sarah" 
                  size="md" 
                  priority={true}
                  loading="eager"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Sarah</h4>
                  <div className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full font-medium">
                    Codo
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">AI Learning Companion</p>
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  Hey there! 👋 I&apos;m Sarah, your AI study buddy. I noticed you&apos;re checking out Codo - want to see how I can help you learn programming faster?
                </p>
                
                {/* Typing Animation */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1 mt-2 text-gray-500 dark:text-gray-400"
                  >
                    <span className="text-xs">Sarah is typing</span>
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
                          className="w-1 h-1 bg-gray-400 rounded-full"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                Reply
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                <BookOpen className="w-4 h-4" />
                Start Lesson
              </motion.button>
            </div>

            {/* Chat bubble tail */}
            <div className="absolute bottom-0 right-8 transform translate-y-full">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-pink-100 dark:border-t-pink-900/20"></div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}