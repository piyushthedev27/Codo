'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Users, Brain, Mic } from 'lucide-react'
import { AnimatedKnowledgeGraph } from './AnimatedKnowledgeGraph'
import { Avatar } from '@/components/shared/Avatar'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium"
            >
              <Brain className="w-4 h-4" />
              AI-Powered Learning Revolution
            </motion.div>

            {/* Main Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight"
              >
                Learn Programming with{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Study Buddies
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed"
              >
                Never learn alone again. Meet Sarah, Alex, and Jordan - your AI-powered study companions who learn alongside you, ask questions, and help you master programming faster.
              </motion.p>
            </div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-6 text-sm"
            >
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Users className="w-5 h-5 text-blue-500" />
                <span>AI Study Buddies</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Mic className="w-5 h-5 text-purple-500" />
                <span>Voice Coaching</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Brain className="w-5 h-5 text-green-500" />
                <span>Smart Learning Paths</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/sign-up">
                <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto">
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              <button className="group bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-6 pt-4"
            >
              <div className="flex -space-x-2">
                {/* First 3 use Sarah, Alex, Jordan 3D avatars */}
                <Avatar peerId="sarah" size="sm" className="w-10 h-10 border-2 border-white dark:border-gray-800" />
                <Avatar peerId="alex" size="sm" className="w-10 h-10 border-2 border-white dark:border-gray-800" />
                <Avatar peerId="jordan" size="sm" className="w-10 h-10 border-2 border-white dark:border-gray-800" />
                
                {/* Additional avatars using AI peers for consistency */}
                <Avatar peerId="sarah" size="sm" className="w-10 h-10 border-2 border-white dark:border-gray-800" />
                <Avatar peerId="alex" size="sm" className="w-10 h-10 border-2 border-white dark:border-gray-800" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="font-semibold text-gray-900 dark:text-white">2,500+ developers</div>
                <div>learning with AI peers</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Animated Knowledge Graph */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Live Demo Badge - Positioned outside the container */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
              Live Demo
            </div>
            
            {/* Floating AI Peer Avatars - Positioned outside the container */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -left-6 top-1/4 z-10"
            >
              <Avatar peerId="sarah" size="md" className="shadow-lg" />
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -right-6 top-1/2 z-10"
            >
              <Avatar peerId="alex" size="md" className="shadow-lg" />
            </motion.div>
            
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute -left-4 bottom-1/4 z-10"
            >
              <Avatar peerId="jordan" size="md" className="shadow-lg" />
            </motion.div>

            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 overflow-hidden">
              <AnimatedKnowledgeGraph />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}