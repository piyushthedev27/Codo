'use client'
/* eslint-disable react/jsx-no-comment-textnodes, @typescript-eslint/no-unused-vars */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Users, ArrowRight } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { getAllPeers } from '@/lib/avatars'
import type { OnboardingData } from '@/types/database'
import { motion } from 'framer-motion'

interface PeerGenerationProps {
  onboardingData: OnboardingData
  onComplete: () => void
}

export function PeerGeneration({ onboardingData, onComplete }: PeerGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  const [_isComplete, setIsComplete] = useState(false)

  const allPeers = getAllPeers()

  const steps = [
    'Analyzing your learning preferences...',
    'Selecting compatible AI personalities...',
    'Customizing peer interactions...',
    'Finalizing your study group...'
  ]

  useEffect(() => {
    // Simulate AI peer generation process
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1
        } else {
          setIsGenerating(false)
          setIsComplete(true)
          clearInterval(timer)
          return prev
        }
      })
    }, 1500)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleContinue = () => {
    onComplete()
  }

  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="mb-12">
          <div className="mx-auto mb-8 p-6 bg-gradient-to-b from-blue-500/20 to-indigo-500/10 border border-blue-500/20 rounded-3xl w-fit shadow-2xl shadow-blue-500/10 animate-pulse">
            <Sparkles className="w-12 h-12 text-blue-400 fill-blue-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Finding Your AI Peers
          </h2>
          <p className="text-zinc-400 text-lg max-w-sm mx-auto leading-relaxed">
            Our neural engine is selecting the most compatible learning companions for your journey.
          </p>
        </div>

        <div className="mb-12 space-y-3">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isActive = index === currentStep
            return (
              <div
                key={index}
                className={`relative flex items-center gap-4 p-5 rounded-2xl border transition-all duration-700 overflow-hidden ${isActive
                  ? 'bg-blue-500/10 border-blue-500/30 scale-102 shadow-lg shadow-blue-500/5'
                  : isCompleted
                    ? 'bg-white/[0.03] border-blue-500/20 opacity-100'
                    : 'bg-white/[0.02] border-white/5 opacity-40'
                  }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-bold transition-all duration-500 ${isCompleted
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                  : isActive
                    ? 'bg-blue-500 border-blue-400 text-white animate-pulse'
                    : 'bg-white/5 border-white/10 text-zinc-600'
                  }`}>
                  {isCompleted ? (
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full opacity-50" />
                  ) : `0${index + 1}`}
                </div>

                <span className={`text-base font-semibold tracking-tight ${isActive ? 'text-white' : isCompleted ? 'text-zinc-300' : 'text-zinc-500'
                  }`}>
                  {step}
                </span>

                {isActive && (
                  <div className="ml-auto flex gap-1.5 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}

                {isCompleted && (
                  <div className="ml-auto">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="pt-8 border-t border-white/5">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-8">
            Manifesting Peer Profiles
          </p>
          <div className="flex justify-center gap-8">
            {allPeers.map((peer, index) => (
              <div
                key={peer.id}
                className={`transition-all duration-1000 ${currentStep > index ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-8 blur-md'
                  }`}
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/40 transition-all duration-700" />
                  <Avatar
                    peerId={peer.id}
                    size="md"
                    showRing={false}
                    className="relative ring-2 ring-white/10 group-hover:ring-blue-500/50 transition-all"
                  />
                  <p className="text-[11px] font-bold text-zinc-400 mt-4 uppercase tracking-widest">{peer.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto text-center py-4">
      <div className="mb-16">
        <div className="mx-auto mb-8 p-6 bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 rounded-3xl w-fit shadow-2xl shadow-emerald-500/10">
          <Users className="w-12 h-12 text-emerald-400" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          Peer Network Sync Complete!
        </h2>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
          Your personalized learning companions have been deployed and are ready to assist you.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16 items-stretch">
        {allPeers.map((peer) => {
          const accentColor =
            peer.personality === 'curious' ? 'rgba(255, 77, 109, 0.5)' :
              peer.personality === 'analytical' ? 'rgba(58, 134, 255, 0.5)' :
                'rgba(6, 214, 160, 0.5)';

          const glowColor =
            peer.personality === 'curious' ? 'rgba(255, 77, 109, 0.15)' :
              peer.personality === 'analytical' ? 'rgba(58, 134, 255, 0.15)' :
                'rgba(6, 214, 160, 0.15)';

          return (
            <div
              key={peer.id}
              className="group h-full flex flex-col items-stretch text-left rounded-[2rem] border transition-all duration-500 hover:scale-[1.02] overflow-hidden bg-zinc-900/50 backdrop-blur-md relative"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              {/* Dynamic hover glow overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${glowColor}, transparent 70%)` }}
              />

              <div className="p-8 pb-4 relative z-10">
                <div className="flex justify-center mb-8 relative">
                  <div className="absolute inset-0 blur-3xl rounded-full opacity-20 scale-150 group-hover:opacity-40 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                  />
                  <Avatar
                    peerId={peer.id}
                    size="xl"
                    showRing={false}
                    animated={true}
                    priority={true}
                    interactive={true}
                    className="relative ring-4 ring-white/10 group-hover:ring-white/20 transition-all shadow-2xl"
                  />
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2 mb-1">
                    {peer.name}
                    <span className="text-xl">
                      {peer.personality === 'curious' ? '🤔' :
                        peer.personality === 'analytical' ? '🧠' : '🤝'}
                    </span>
                  </h3>
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    ID-{peer.personality.slice(0, 3)}-{peer.skill_level}
                  </div>
                </div>
              </div>

              <div className="p-8 pt-4 flex-1 flex flex-col gap-6 relative z-10">
                <div className="space-y-6 flex-1">
                  <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                    <h4 className="text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">
                      Protocol Style
                    </h4>
                    <p className="text-sm font-medium leading-relaxed text-zinc-300">
                      {peer.interaction_style}
                    </p>
                  </div>

                  <div className="bg-red-500/5 p-5 rounded-2xl border border-red-500/10 transition-colors">
                    <h4 className="text-[10px] font-bold text-red-400/50 mb-3 uppercase tracking-widest">
                      Known Failures
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {peer.common_mistakes.slice(0, 2).map((mistake, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold bg-red-500/10 text-red-400/80 px-3 py-1 rounded-full border border-red-500/10 uppercase tracking-tighter"
                        >
                          {mistake}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 mt-auto">
                    <p className="text-xs text-zinc-500 leading-relaxed italic text-center px-4">
                      "{peer.backstory}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mb-16 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-zinc-900/50 to-black/50 p-10 md:p-16 text-left relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles className="w-64 h-64 text-blue-500" />
        </div>

        <div className="relative z-10">
          <h3 className="flex items-center gap-3 text-2xl font-bold tracking-tight mb-12 text-white">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            Support Modules Active
          </h3>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="group space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-blue-500/40">01</span>
                <h4 className="text-base font-bold text-blue-400 tracking-tight">Inquiry Sequence</h4>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                Peers will execute thoughtful inquiry sequences to stimulate deep knowledge retrieval and validation during coding sessions.
              </p>
            </div>

            <div className="group space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-emerald-500/40">02</span>
                <h4 className="text-base font-bold text-emerald-400 tracking-tight">Fault Injection</h4>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                Intentional logic faults will be injected into sessions for systematic identification and resolution training.
              </p>
            </div>

            <div className="group space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-rose-500/40">03</span>
                <h4 className="text-base font-bold text-rose-400 tracking-tight">Multi-Thread Dev</h4>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                Collaborative code execution with real-time synchronization and multi-perspective context sharing across peers.
              </p>
            </div>

            <div className="group space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-amber-500/40">04</span>
                <h4 className="text-base font-bold text-amber-400 tracking-tight">Performance Duels</h4>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                Synchronous coding challenges designed to benchmark your knowledge acquisition and system optimization paths.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 py-8">
        <button
          onClick={handleContinue}
          className="group relative h-16 px-16 bg-white text-black font-bold text-lg rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/10"
        >
          <span className="relative z-10 flex items-center gap-4">
            Initialize Dashboard
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </span>
          {/* Subtle light sweep animation */}
          <div className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent group-hover:left-full transition-all duration-1000 ease-in-out" />
        </button>
        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.3em]">
            Secure Neural Link Established
          </p>
        </div>
      </div>
    </div>
  )
}