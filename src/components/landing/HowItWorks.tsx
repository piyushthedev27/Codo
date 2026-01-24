'use client'

import { motion } from 'framer-motion'
import { UserPlus, Brain, Rocket, ArrowRight, CheckCircle, Mic } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Sign Up & Meet Your AI Peers",
      description: "Complete a 5-question skill assessment and get matched with AI study buddies Sarah, Alex, and Jordan - each with unique personalities and learning styles.",
      features: [
        "Personalized skill assessment",
        "AI peer personality matching",
        "Custom learning profile creation"
      ],
      color: "from-blue-400 to-purple-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      number: "02",
      icon: Brain,
      title: "Learn with Voice Coaching & Peers",
      description: "Dive into interactive lessons with real-time voice coaching. Your AI peers ask questions, make mistakes, and learn alongside you - just like real study partners.",
      features: [
        "Real-time voice pair programming",
        "AI peers ask questions during lessons",
        "Collaborative problem solving"
      ],
      color: "from-purple-400 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      number: "03",
      icon: Rocket,
      title: "Master Skills Through Smart Practice",
      description: "Practice in code duels, get mistake-driven micro-lessons, and watch your knowledge graph unlock new skills as you progress through your personalized learning journey.",
      features: [
        "Competitive coding challenges",
        "Mistake-driven learning paths",
        "Visual progress tracking"
      ],
      color: "from-green-400 to-teal-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    }
  ]

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            Simple Process
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How Codo{' '}
            <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Get started in minutes and experience the future of programming education. 
            Here's how our AI-powered learning system transforms your coding journey:
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
            >
              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`text-6xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                    {step.number}
                  </div>
                  <div className={`p-4 rounded-2xl ${step.bgColor}`}>
                    <step.icon className={`w-8 h-8 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`} />
                  </div>
                </div>

                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {step.title}
                </h3>

                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>

                {/* Features List */}
                <div className="space-y-3">
                  {step.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.2 + featureIndex * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className={`w-5 h-5 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`} />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Visual */}
              <div className="flex-1 relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700"
                >
                  {/* Step Visual Content */}
                  {index === 0 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Meet Your AI Study Buddies
                        </h4>
                        <div className="flex justify-center gap-4">
                          <div className="text-center">
                            <Avatar peerId="sarah" size="lg" className="mx-auto mb-2" />
                            <div className="text-sm text-gray-600 dark:text-gray-400">Sarah</div>
                            <div className="text-xs text-gray-500">Curious</div>
                          </div>
                          <div className="text-center">
                            <Avatar peerId="alex" size="lg" className="mx-auto mb-2" />
                            <div className="text-sm text-gray-600 dark:text-gray-400">Alex</div>
                            <div className="text-xs text-gray-500">Analytical</div>
                          </div>
                          <div className="text-center">
                            <Avatar peerId="jordan" size="lg" className="mx-auto mb-2" />
                            <div className="text-sm text-gray-600 dark:text-gray-400">Jordan</div>
                            <div className="text-xs text-gray-500">Supportive</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {index === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <Avatar peerId="sarah" size="sm" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">Sarah asks:</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">"Why do we use const instead of let here?"</div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Mic className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Voice Coach:</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          "Great question! Let me explain the difference between const and let..."
                        </div>
                      </div>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Code Duel: Array Methods</span>
                          <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded">Live</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">You</span>
                            <span className="font-semibold text-green-600">85%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Alex</span>
                            <span className="font-semibold text-blue-600">78%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">+250 XP</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">New skill unlocked: Higher-Order Functions</div>
                      </div>
                    </div>
                  )}

                  {/* Step Number Badge */}
                  <div className={`absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {index + 1}
                  </div>
                </motion.div>
              </div>

              {/* Arrow (except for last step) */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
                  viewport={{ once: true }}
                  className="absolute left-1/2 transform -translate-x-1/2 mt-16 lg:mt-0 lg:left-auto lg:right-1/2 lg:translate-x-1/2"
                >
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
                    <ArrowRight className="w-6 h-6 text-gray-400 lg:rotate-90" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Start Your AI-Powered Learning Journey?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of developers who are learning faster with AI study buddies, 
              voice coaching, and personalized learning paths.
            </p>
            
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
              Get Started Free - No Credit Card Required
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}