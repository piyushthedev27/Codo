'use client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { _useEffect, _useRef, _useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Avatar } from '@/components/shared/Avatar'
import { KnowledgeGraphLoadingSkeleton } from '@/components/ui/loading'

// Lazy load D3 to reduce initial bundle size
const D3Component = dynamic(() => import('./D3KnowledgeGraph'), {
  loading: () => <KnowledgeGraphLoadingSkeleton />,
  ssr: false
})

export function AnimatedKnowledgeGraph() {
  return (
    <div className="relative">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Your Learning Journey
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Watch your skills unlock as you progress
        </p>
      </div>
      
      <D3Component />

      {/* Progress Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 grid grid-cols-3 gap-4 text-center"
      >
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">3</div>
          <div className="text-xs text-green-700 dark:text-green-300">Mastered</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">1</div>
          <div className="text-xs text-yellow-700 dark:text-yellow-300">Learning</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">4</div>
          <div className="text-xs text-gray-700 dark:text-gray-300">Locked</div>
        </div>
      </motion.div>

      {/* AI Peer Comments - Enhanced with 3D Avatar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 p-4 rounded-xl shadow-xl border border-pink-200 dark:border-pink-800 max-w-full"
      >
        <div className="flex items-start gap-3">
          <div className="relative">
            {/* Sarah's 3D Avatar */}
            <Avatar 
              peerId="sarah" 
              size="sm" 
              className="w-10 h-10"
              priority={true}
            />
          </div>
          <div className="text-xs flex-1">
            <div className="flex items-center gap-1 mb-1">
              <div className="font-semibold text-gray-900 dark:text-white">Sarah</div>
              <div className="px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-[10px] rounded-full font-medium">
                Codo
              </div>
            </div>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
              &quot;Great progress on JavaScript! Ready for React or Next?&quot;
                 </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}