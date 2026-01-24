'use client'

import { motion } from 'framer-motion'
import { 
  Users, 
  Mic, 
  Brain, 
  Target, 
  Code2, 
  BarChart3, 
  Gamepad2,
  Star
} from 'lucide-react'

export function FeaturesShowcase() {
  const features = [
    {
      icon: Star,
      title: "Professional Landing Page",
      description: "First impression that hooks judges and explains our unique value proposition with compelling visuals.",
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      textColor: "text-yellow-600 dark:text-yellow-400"
    },
    {
      icon: Users,
      title: "Synthetic Peer Learning",
      description: "Meet Sarah, Alex, and Jordan - AI study buddies with distinct personalities who learn alongside you and ask questions.",
      color: "from-blue-400 to-purple-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Mic,
      title: "AI Voice Coaching",
      description: "Real-time voice pair programming coach using free browser APIs. Like having a senior developer beside you.",
      color: "from-purple-400 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: Brain,
      title: "Interactive Knowledge Graph",
      description: "Visual skill progression with D3.js showing exactly what to learn next and how concepts connect.",
      color: "from-green-400 to-teal-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400"
    },
    {
      icon: Target,
      title: "Mistake-Driven Learning",
      description: "Adaptive paths based on your actual errors. Generate micro-lessons for specific mistakes you make.",
      color: "from-red-400 to-pink-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400"
    },
    {
      icon: Code2,
      title: "Collaborative Code Canvas",
      description: "Real-time coding with AI peers. See live cursors, compare approaches, and spot bugs together.",
      color: "from-indigo-400 to-blue-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      textColor: "text-indigo-600 dark:text-indigo-400"
    },
    {
      icon: BarChart3,
      title: "Live Learning Insights",
      description: "Real-time pattern recognition: 'You've attempted arrays 3 times - this suggests confusion about .map() vs .filter()'",
      color: "from-teal-400 to-green-500",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
      textColor: "text-teal-600 dark:text-teal-400"
    },
    {
      icon: Gamepad2,
      title: "Code Duel Mode",
      description: "Competitive coding challenges against AI peers with live leaderboards and real-time progress tracking.",
      color: "from-orange-400 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400"
    }
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            Revolutionary Features
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            8 Unique Features That{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Change Everything
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Unlike traditional learning platforms, Codo introduces groundbreaking features 
            that make programming education collaborative, intelligent, and engaging.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-2xl ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-8 h-8 ${feature.textColor}`} />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Feature Badge */}
                <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color}`} />
                  <span>Unique to Codo</span>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${feature.color} animate-pulse`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Experience All 8 Features in Our Demo
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              See how AI study buddies, voice coaching, and smart learning paths work together 
              to create the most engaging programming education experience ever built.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                Try All Features Free
              </button>
              <button className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                Watch Feature Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}