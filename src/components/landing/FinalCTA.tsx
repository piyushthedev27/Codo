'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Users, Mic, Brain, CheckCircle, Clock } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import Link from 'next/link'

export function FinalCTA() {
  const benefits = [
    "AI study buddies Sarah, Alex & Jordan",
    "Real-time voice pair programming coach",
    "Interactive knowledge graph progression",
    "Mistake-driven personalized learning",
    "Collaborative coding with live cursors",
    "Competitive code duels & challenges"
  ]

  const urgencyFeatures = [
    {
      icon: Users,
      text: "2,500+ developers already learning"
    },
    {
      icon: Clock,
      text: "Limited beta access available"
    },
    {
      icon: Sparkles,
      text: "Free forever - no credit card needed"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute bottom-20 right-10 w-32 h-32 bg-purple-300/10 rounded-full blur-xl"
      />

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Limited Time: Free Beta Access
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Start Learning with{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                AI Study Buddies
              </span>{' '}
              Today
            </h2>
            
            <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Join the programming education revolution. Never learn alone again with 
              Sarah, Alex, and Jordan - your AI-powered study companions.
            </p>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl text-white"
              >
                <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Main CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <Link href="/sign-up">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-white text-blue-600 px-12 py-6 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-white/25 transition-all duration-300 inline-flex items-center gap-3"
              >
                <Users className="w-6 h-6" />
                Meet Your AI Study Buddies - Free
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Secondary Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <button className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2">
              <Mic className="w-5 h-5" />
              Try Voice Coaching Demo
            </button>
            
            <button className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2">
              <Brain className="w-5 h-5" />
              Explore Knowledge Graph
            </button>
          </motion.div>

          {/* Urgency Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8"
          >
            {urgencyFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-blue-100">
                <feature.icon className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Trust Signals */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-blue-200 text-sm mb-4">
              Trusted by developers at Google, Microsoft, Amazon, and more
            </div>
            
            {/* Avatars */}
            <div className="flex justify-center -space-x-2 mb-4">
              {/* All positions use Sarah, Alex, Jordan 3D avatars for consistency */}
              <Avatar peerId="sarah" size="sm" className="w-10 h-10 border-2 border-white" />
              <Avatar peerId="alex" size="sm" className="w-10 h-10 border-2 border-white" />
              <Avatar peerId="jordan" size="sm" className="w-10 h-10 border-2 border-white" />
              <Avatar peerId="sarah" size="sm" className="w-10 h-10 border-2 border-white" />
              <Avatar peerId="alex" size="sm" className="w-10 h-10 border-2 border-white" />
              <Avatar peerId="jordan" size="sm" className="w-10 h-10 border-2 border-white" />
              <Avatar peerId="sarah" size="sm" className="w-10 h-10 border-2 border-white" />
              <Avatar peerId="alex" size="sm" className="w-10 h-10 border-2 border-white" />
              <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-white font-semibold text-xs">
                +2K
              </div>
            </div>
            
            <div className="text-blue-200 text-sm">
              Join 2,500+ developers learning with AI peers
            </div>
          </motion.div>

          {/* Final Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-12 bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20"
          >
            <div className="text-white text-center">
              <div className="text-lg font-semibold mb-2">
                🚀 Start in 30 seconds • 🎯 No credit card required • 🔄 Cancel anytime
              </div>
              <div className="text-blue-200 text-sm">
                Experience the future of programming education with AI study buddies, 
                voice coaching, and personalized learning paths.
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" fill="none" className="w-full h-auto">
          <path
            d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
            fill="white"
            className="dark:fill-gray-800"
          />
        </svg>
      </div>
    </section>
  )
}