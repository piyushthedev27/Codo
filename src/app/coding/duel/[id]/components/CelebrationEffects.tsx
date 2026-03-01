/**
 * Celebration Effects Component
 * Various celebration animations and effects for code duels
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Trophy, Star as _Star, Zap as _Zap, Crown as _Crown, Sparkles as _Sparkles, Heart as _Heart } from 'lucide-react'

interface CelebrationEffectsProps {
  show: boolean
  type: 'victory' | 'milestone' | 'achievement' | 'perfect'
  intensity?: 'low' | 'medium' | 'high'
}

export function CelebrationEffects({ show, type, intensity = 'medium' }: CelebrationEffectsProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; icon: string }>>([])

  useEffect(() => {
    if (show) {
      generateParticles()
    } else {
      setParticles([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, type, intensity])

  const generateParticles = () => {
    const particleCount = intensity === 'high' ? 100 : intensity === 'medium' ? 60 : 30
    const newParticles = []

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        color: getRandomColor(type),
        icon: getRandomIcon(type)
      })
    }

    setParticles(newParticles)
  }

  const getRandomColor = (celebrationType: string) => {
    const colorSets: Record<string, string[]> = {
      victory: ['bg-yellow-400', 'bg-orange-400', 'bg-red-400', 'bg-pink-400'],
      milestone: ['bg-blue-400', 'bg-purple-400', 'bg-indigo-400', 'bg-cyan-400'],
      achievement: ['bg-green-400', 'bg-emerald-400', 'bg-teal-400', 'bg-lime-400'],
      perfect: ['bg-gradient-to-r from-yellow-400 to-pink-400', 'bg-gradient-to-r from-purple-400 to-blue-400']
    }

    const colors = colorSets[celebrationType] || colorSets.victory
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const getRandomIcon = (celebrationType: string) => {
    const iconSets: Record<string, string[]> = {
      victory: ['🏆', '👑', '🎉', '🎊', '✨'],
      milestone: ['⭐', '💫', '🌟', '✨', '🎯'],
      achievement: ['🏅', '🎖️', '🏆', '💎', '🔥'],
      perfect: ['💯', '🌟', '✨', '💫', '🎆']
    }

    const icons = iconSets[celebrationType] || iconSets.victory
    return icons[Math.floor(Math.random() * icons.length)]
  }

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* Confetti Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: particle.x,
                y: -20,
                rotate: 0,
                scale: 0,
                opacity: 1
              }}
              animate={{
                y: window.innerHeight + 100,
                rotate: 360,
                scale: [0, 1, 0.8, 0],
                opacity: [1, 1, 0.8, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 1,
                ease: "easeOut"
              }}
              className={`absolute w-4 h-4 ${particle.color} rounded-full flex items-center justify-center text-xs`}
            >
              {particle.icon}
            </motion.div>
          ))}

          {/* Fireworks Effect */}
          {type === 'victory' && intensity === 'high' && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`firework-${i}`}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.3,
                    ease: "easeOut"
                  }}
                  className="absolute"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${20 + (i % 2) * 30}%`
                  }}
                >
                  <div className="w-2 h-2 bg-yellow-400 rounded-full relative">
                    {[...Array(8)].map((_, j) => (
                      <motion.div
                        key={j}
                        initial={{ scale: 0, x: 0, y: 0 }}
                        animate={{
                          scale: 1,
                          x: Math.cos((j * 45) * Math.PI / 180) * 50,
                          y: Math.sin((j * 45) * Math.PI / 180) * 50
                        }}
                        transition={{
                          duration: 1,
                          delay: i * 0.3 + 0.5,
                          ease: "easeOut"
                        }}
                        className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </>
          )}

          {/* Sparkle Trail */}
          {type === 'perfect' && (
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <svg className="w-full h-full">
                <motion.path
                  d="M 50 50 Q 200 100 400 50 T 800 100"
                  stroke="url(#sparkleGradient)"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2 }}
                />
                <defs>
                  <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          )}

          {/* Pulsing Rings */}
          {type === 'milestone' && (
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`ring-${i}`}
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 4, opacity: 0 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.5,
                    ease: "easeOut",
                    repeat: 2
                  }}
                  className="absolute w-20 h-20 border-4 border-blue-400 rounded-full"
                />
              ))}
            </div>
          )}

          {/* Achievement Badge Animation */}
          {type === 'achievement' && (
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              transition={{ type: "spring", duration: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6 rounded-full shadow-2xl">
                <Trophy className="w-12 h-12 text-white" />
              </div>

              {/* Radiating Lines */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`line-${i}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: [0, 1, 0] }}
                  transition={{
                    duration: 1.5,
                    delay: 0.5 + (i * 0.1),
                    ease: "easeOut"
                  }}
                  className="absolute w-1 h-8 bg-yellow-400 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '50% 0%',
                    transform: `translate(-50%, -100%) rotate(${i * 30}deg)`
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  )
}

// Celebration Trigger Hook
export function useCelebration() {
  const [celebration, setCelebration] = useState<{
    show: boolean
    type: 'victory' | 'milestone' | 'achievement' | 'perfect'
    intensity: 'low' | 'medium' | 'high'
  }>({
    show: false,
    type: 'victory',
    intensity: 'medium'
  })

  const triggerCelebration = (
    type: 'victory' | 'milestone' | 'achievement' | 'perfect',
    intensity: 'low' | 'medium' | 'high' = 'medium',
    duration: number = 3000
  ) => {
    setCelebration({ show: true, type, intensity })

    setTimeout(() => {
      setCelebration(prev => ({ ...prev, show: false }))
    }, duration)
  }

  return { celebration, triggerCelebration }
}

// Sound Effects (using Web Audio API)
export function playVictorySound() {
  if (typeof window !== 'undefined' && 'AudioContext' in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Victory fanfare
    const frequencies = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime + index * 0.2)
      oscillator.stop(audioContext.currentTime + index * 0.2 + 0.5)
    })
  }
}

export function playAchievementSound() {
  if (typeof window !== 'undefined' && 'AudioContext' in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Achievement chime
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3)
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.8)
  }
}