/**
 * Lesson Completion Modal
 * Beautiful celebration modal when a lesson is completed
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Award, Star, Sparkles, CheckCircle, ArrowRight, Home, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

interface LessonCompletionModalProps {
  isOpen: boolean
  lessonTitle: string
  xpEarned: number
  onClose: () => void
  onContinue?: () => void
  onBackToDashboard?: () => void
}

export function LessonCompletionModal({
  isOpen,
  lessonTitle,
  xpEarned,
  onClose,
  onContinue,
  onBackToDashboard
}: LessonCompletionModalProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    if (isOpen) {
      // Create floating particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2
      }))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParticles(newParticles)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Floating Particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: [0, -100],
                }}
                transition={{
                  duration: 3,
                  delay: particle.delay,
                  repeat: Infinity,
                }}
                className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
              />
            ))}

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative max-w-2xl w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -mr-48 -mt-48" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-32 -mb-32" />

              {/* Content */}
              <div className="relative z-10 p-8 md:p-12 text-center">
                {/* Trophy Icon with Animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mb-6"
                >
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/50">
                    <Trophy className="w-16 h-16 text-white" />
                  </div>
                </motion.div>

                {/* Success Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                    <h2 className="text-4xl md:text-5xl font-black text-white">
                      Congratulations!
                    </h2>
                    <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                  </div>
                  
                  <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                    You&apos;ve successfully completed
                  </p>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                      <h3 className="text-2xl font-black text-white">
                        {lessonTitle}
                      </h3>
                    </div>
                  </div>
                </motion.div>

                {/* XP Reward */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="mb-8"
                >
                  <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-2xl shadow-amber-500/50">
                    <Award className="w-8 h-8 text-white" />
                    <div className="text-left">
                      <div className="text-sm text-amber-100 font-semibold">XP Earned</div>
                      <div className="text-3xl font-black text-white">+{xpEarned} XP</div>
                    </div>
                    <Star className="w-8 h-8 text-white fill-white" />
                  </div>
                </motion.div>

                {/* Achievement Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-3 gap-4 mb-8"
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-3xl font-black text-emerald-400 mb-1">100%</div>
                    <div className="text-sm text-slate-300">Complete</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-3xl font-black text-blue-400 mb-1">
                      <CheckCircle className="w-8 h-8 mx-auto" />
                    </div>
                    <div className="text-sm text-slate-300">Mastered</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-3xl font-black text-purple-400 mb-1">
                      <Star className="w-8 h-8 mx-auto fill-purple-400" />
                    </div>
                    <div className="text-sm text-slate-300">Achieved</div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  {onContinue && (
                    <Button
                      onClick={onContinue}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-black text-lg px-8 py-6 rounded-xl shadow-lg shadow-blue-500/50"
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      Continue Learning
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                  
                  <Button
                    onClick={onBackToDashboard || onClose}
                    size="lg"
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold text-lg px-8 py-6 rounded-xl backdrop-blur-sm"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Back to Dashboard
                  </Button>
                </motion.div>

                {/* Motivational Message */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mt-8 text-blue-200 text-sm italic"
                >
                  &quot;Every lesson completed is a step closer to mastery. Keep going!&quot; 🚀
                     </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
