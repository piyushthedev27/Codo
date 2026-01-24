'use client'

import { motion } from 'framer-motion'
import { Star, TrendingUp, Users, Clock, Quote } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'

export function SocialProof() {
  const metrics = [
    {
      icon: Users,
      value: "2,500+",
      label: "Active Learners",
      description: "Developers learning with AI peers",
      color: "text-blue-600"
    },
    {
      icon: TrendingUp,
      value: "3.2x",
      label: "Faster Learning",
      description: "Compared to traditional courses",
      color: "text-green-600"
    },
    {
      icon: Clock,
      value: "89%",
      label: "Completion Rate",
      description: "vs 10% industry average",
      color: "text-purple-600"
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "User Rating",
      description: "From beta testers",
      color: "text-yellow-600"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Frontend Developer", 
      company: "Tech Startup",
      avatar: "sarah", // Use Sarah's 3D avatar
      rating: 5,
      text: "The AI study buddies are game-changing! Sarah and Alex ask the exact questions I would have, and the voice coaching feels like pair programming with a senior dev. I learned React Hooks in 2 weeks instead of 2 months.",
      highlight: "Learned React Hooks in 2 weeks"
    },
    {
      name: "Alex Rodriguez",
      role: "CS Student",
      company: "University of Texas", 
      avatar: "alex", // Use Alex's 3D avatar
      rating: 5,
      text: "I was struggling with JavaScript concepts until I found Codo. The mistake-driven learning is incredible - it generates mini-lessons for my exact errors. The knowledge graph shows me exactly what to learn next.",
      highlight: "Mistake-driven learning is incredible"
    },
    {
      name: "Jordan Watson",
      role: "Career Changer",
      company: "From Marketing to Dev",
      avatar: "jordan", // Use Jordan's 3D avatar
      rating: 5,
      text: "As someone switching careers, the collaborative coding with AI peers made me feel less alone. The voice coaching caught mistakes I would have missed, and the competitive duels kept me motivated every day.",
      highlight: "Made me feel less alone"
    },
    {
      name: "David Kim",
      role: "Senior Developer",
      company: "Fortune 500",
      avatar: "DK", // Keep letter fallback for non-AI peer
      rating: 5,
      text: "I use Codo to stay updated with new frameworks. The AI peers ask challenging questions that make me think deeper. The live insights feature is brilliant - it spots my learning patterns before I do.",
      highlight: "Spots learning patterns before I do"
    }
  ]

  const companies = [
    "Google", "Microsoft", "Amazon", "Meta", "Netflix", "Spotify", "Airbnb", "Uber"
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
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            Proven Results
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Developers Are{' '}
            <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Learning Faster
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers who have transformed their learning experience 
            with AI-powered education. Here's what they're achieving:
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-700"
            >
              <div className={`inline-flex p-4 rounded-2xl bg-white dark:bg-gray-800 ${metric.color} mb-4`}>
                <metric.icon className="w-8 h-8" />
              </div>
              
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {metric.value}
              </div>
              
              <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {metric.label}
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {metric.description}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What Developers Are Saying
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Real feedback from developers who are learning with AI peers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 relative"
              >
                {/* Quote Icon */}
                <Quote className="absolute top-6 right-6 w-8 h-8 text-gray-300 dark:text-gray-600" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>

                {/* Highlight */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-6">
                  <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    💡 "{testimonial.highlight}"
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  {/* Use 3D avatar for Sarah, Alex, Jordan; letter fallback for others */}
                  {['sarah', 'alex', 'jordan'].includes(testimonial.avatar) ? (
                    <Avatar peerId={testimonial.avatar} size="md" />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Companies */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Our learners work at top companies worldwide
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companies.map((company, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.6, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-2xl font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-8 rounded-2xl border border-green-100 dark:border-green-800"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Join the Learning Revolution
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-gray-600 dark:text-gray-300">Free to start</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600 dark:text-gray-300">AI peer support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                <div className="text-gray-600 dark:text-gray-300">Learning possibilities</div>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Start learning with AI study buddies today. No credit card required, 
              no commitments - just better programming education.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}