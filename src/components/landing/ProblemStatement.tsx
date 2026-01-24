'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Clock, Users, BookOpen, TrendingDown } from 'lucide-react'

export function ProblemStatement() {
  const problems = [
    {
      icon: Users,
      title: "Learning Alone is Isolating",
      description: "85% of developers struggle with motivation when learning solo. No one to ask questions, discuss concepts, or celebrate progress with.",
      stat: "85%",
      color: "text-red-500"
    },
    {
      icon: BookOpen,
      title: "Generic Learning Paths",
      description: "One-size-fits-all courses ignore your specific weaknesses. You waste time on topics you know and skip what you actually need.",
      stat: "73%",
      color: "text-orange-500"
    },
    {
      icon: Clock,
      title: "Slow Feedback Loops",
      description: "Traditional platforms give delayed feedback. By the time you realize you're confused, you've already built bad habits.",
      stat: "68%",
      color: "text-yellow-500"
    },
    {
      icon: TrendingDown,
      title: "High Dropout Rates",
      description: "Most online courses have 90%+ dropout rates. Without engagement and personalization, learners give up quickly.",
      stat: "90%+",
      color: "text-purple-500"
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
          <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <AlertTriangle className="w-4 h-4" />
            The Learning Crisis
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Why Traditional Programming Education{' '}
            <span className="text-red-500">Fails</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Despite billions invested in online education, most developers still struggle to learn effectively. 
            Here's why the current approach is broken:
          </p>
        </motion.div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-700 ${problem.color}`}>
                  <problem.icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {problem.title}
                    </h3>
                    <div className={`text-2xl font-bold ${problem.color}`}>
                      {problem.stat}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Impact Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-8 rounded-2xl border border-red-100 dark:border-red-800"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              The Result? Frustrated Developers Everywhere
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">6 months</div>
                <div className="text-gray-600 dark:text-gray-300">Average time to give up</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">$2,000+</div>
                <div className="text-gray-600 dark:text-gray-300">Wasted on failed courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">70%</div>
                <div className="text-gray-600 dark:text-gray-300">Never complete their goals</div>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Traditional learning platforms treat you like just another number. 
              <strong className="text-gray-900 dark:text-white"> It's time for a better way.</strong>
            </p>
          </div>
        </motion.div>

        {/* Transition to Solution */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-6 py-3 rounded-full text-lg font-medium">
            <span>But what if learning could be different?</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}