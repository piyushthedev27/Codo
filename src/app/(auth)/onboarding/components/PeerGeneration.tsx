/**
 * Peer Generation Component for Onboarding
 * Generates and displays AI peer profiles with 3D avatars during onboarding
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { getAllPeers, type AIPeerProfile } from '@/lib/avatars'

export function PeerGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPeers, setGeneratedPeers] = useState<AIPeerProfile[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const allPeers = getAllPeers()

  const generatePeers = async () => {
    setIsGenerating(true)
    setCurrentStep(0)

    // Simulate AI peer generation process
    const steps = [
      'Analyzing your learning style...',
      'Matching personality types...',
      'Generating peer profiles...',
      'Customizing interactions...'
    ]

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    // "Generate" the peers (use our predefined ones)
    setGeneratedPeers(allPeers)
    setIsGenerating(false)
  }

  useEffect(() => {
    // Auto-start generation when component mounts
    generatePeers()
  }, [])

  const getPersonalityDescription = (personality: string) => {
    switch (personality) {
      case 'curious':
        return 'Asks thoughtful questions and loves exploring new concepts'
      case 'analytical':
        return 'Methodical problem-solver who enjoys breaking down complex topics'
      case 'supportive':
        return 'Encouraging mentor who helps others learn from mistakes'
      default:
        return 'Helpful learning companion'
    }
  }

  const getPersonalityColor = (personality: string) => {
    switch (personality) {
      case 'curious': return 'from-pink-400 to-red-500'
      case 'analytical': return 'from-blue-400 to-indigo-500'
      case 'supportive': return 'from-green-400 to-teal-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6"
            >
              <Sparkles className="w-full h-full text-blue-500" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Generating Your AI Study Buddies
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're creating personalized AI peers based on your learning style and goals
            </p>

            {/* Progress Steps */}
            <div className="space-y-4">
              {[
                'Analyzing your learning style...',
                'Matching personality types...',
                'Generating peer profiles...',
                'Customizing interactions...'
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: currentStep >= index ? 1 : 0.5,
                    x: 0 
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    currentStep >= index 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  {currentStep > index ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : currentStep === index ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className={`text-sm ${
                    currentStep >= index 
                      ? 'text-gray-900 dark:text-white font-medium' 
                      : 'text-gray-500'
                  }`}>
                    {step}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <CheckCircle className="w-4 h-4" />
          AI Peers Generated Successfully
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Meet Your AI Study Buddies
        </h2>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          These AI companions will learn alongside you, ask questions, and help you master programming concepts faster.
        </p>
      </motion.div>

      {/* Generated Peers */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <AnimatePresence>
          {generatedPeers.map((peer, index) => (
            <motion.div
              key={peer.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
            >
              {/* Avatar */}
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  <Avatar 
                    peerId={peer.id} 
                    size="xl" 
                    className="mx-auto mb-3"
                    priority={true}
                  />
                  
                  {/* Personality Badge */}
                  <div className={`absolute -bottom-2 -right-2 px-3 py-1 bg-gradient-to-r ${getPersonalityColor(peer.personality)} text-white text-xs font-medium rounded-full shadow-lg`}>
                    {peer.personality}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {peer.name}
                </h3>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {peer.skill_level} Level
                </p>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                  {getPersonalityDescription(peer.personality)}
                </p>
              </div>

              {/* Backstory */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 italic text-center">
                  "{peer.backstory}"
                </p>
              </div>

              {/* Common Mistakes */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Will help you with:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {peer.common_mistakes.slice(0, 2).map((mistake, mistakeIndex) => (
                    <span
                      key={mistakeIndex}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                    >
                      {mistake}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />
            Start Learning with AI Peers
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={generatePeers}
            className="group bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Regenerate Peers
          </button>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          💡 Your AI peers will adapt their teaching style as they learn more about you
        </p>
      </motion.div>
    </div>
  )
}