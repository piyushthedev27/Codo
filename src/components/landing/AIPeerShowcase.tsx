'use client'

import { motion } from 'framer-motion'
import { Users, MessageCircle, Brain, Sparkles, ArrowRight, Code, Trophy, Heart } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { getAllPeers, getPersonalityEmoji, getPersonalityDescription } from '@/lib/avatars'

export function AIPeerShowcase() {
  const peers = getAllPeers()

  const showcaseFeatures = [
    {
      icon: MessageCircle,
      title: "Ask Questions During Lessons",
      description: "Your AI peers will ask thoughtful questions to help reinforce learning",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: Brain,
      title: "Make Deliberate Mistakes", 
      description: "They'll make common errors for you to spot and correct, earning bonus XP",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: Users,
      title: "Collaborate in Real-Time",
      description: "Code together with live cursor presence and compare different approaches",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: Sparkles,
      title: "Celebrate Your Progress",
      description: "Get encouragement and celebrate milestones with your study buddies",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Users className="w-4 h-4" />
            Meet Your AI Study Buddies
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Never Learn{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Alone Again
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Meet Sarah, Alex, and Jordan - your AI-powered study companions with distinct personalities 
            who learn alongside you, ask questions, and help you master programming faster.
          </p>
        </motion.div>

        {/* AI Peer Profiles */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {peers.map((peer, index) => (
            <motion.div
              key={peer.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-all duration-300 group"
            >
              {/* Avatar with Animation */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <Avatar 
                  peerId={peer.id} 
                  size="xl" 
                  className="mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  showRing={true}
                  animated={true}
                  interactive={true}
                  priority={true}
                />
              </motion.div>

              {/* Peer Info */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                  {peer.name}
                  <span className="text-2xl">{getPersonalityEmoji(peer.personality)}</span>
                </h3>
                
                <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  <span className="capitalize">{peer.personality}</span>
                  <span>•</span>
                  <span className="capitalize">{peer.skill_level}</span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {getPersonalityDescription(peer.personality)}
                </p>
              </div>

              {/* Interaction Style */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How I Help:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {peer.interaction_style}
                </p>
              </div>

              {/* Common Mistakes */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Common Learning Areas:</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {peer.common_mistakes.map((mistake, mistakeIndex) => (
                    <span 
                      key={mistakeIndex}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full"
                    >
                      {mistake}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive Demo Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with {peer.name}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Feature Showcase Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            How AI Peers Transform Your Learning
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {showcaseFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${feature.bgColor} p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300`}
              >
                <div className={`w-12 h-12 ${feature.color} bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4 shadow-sm`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h4>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 lg:p-12 border border-gray-100 dark:border-gray-700 shadow-xl"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Demo Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <Code className="w-4 h-4" />
                Live Demo
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Experience Collaborative Learning
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Start a Lesson</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Choose a topic and your AI peers join automatically</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Learn Together</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Ask questions, spot mistakes, and explain concepts</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Earn Bonus XP</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Get rewarded for helping your study buddies</p>
                  </div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-3"
              >
                <Trophy className="w-5 h-5" />
                Try Interactive Demo
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Visual Demo */}
            <div className="relative">
              {/* Mock Chat Interface */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex -space-x-2">
                    {peers.map((peer) => (
                      <Avatar 
                        key={peer.id}
                        peerId={peer.id} 
                        size="sm" 
                        className="border-2 border-white dark:border-gray-900"
                      />
                    ))}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">React Hooks Lesson</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">3 study buddies online</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar peerId="sarah" size="sm" />
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg flex-1 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-900 dark:text-white">
                        "I'm confused about useEffect. When does it run exactly?"
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Avatar peerId="alex" size="sm" />
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg flex-1 border border-blue-200 dark:border-blue-700">
                      <p className="text-sm text-gray-900 dark:text-white">
                        "Great question! It runs after every render by default..."
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Avatar peerId="jordan" size="sm" />
                    <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg flex-1 border border-green-200 dark:border-green-700">
                      <p className="text-sm text-gray-900 dark:text-white">
                        "Nice explanation! Can you spot the bug in my code? 🤔"
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Heart className="w-3 h-3 text-red-400" />
                    <span>+50 XP for helping Sarah understand useEffect</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Meet Your Study Buddies?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are learning faster with AI-powered study companions. 
            Start your collaborative learning journey today.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-3"
          >
            <Users className="w-5 h-5" />
            Get Started with AI Peers
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}