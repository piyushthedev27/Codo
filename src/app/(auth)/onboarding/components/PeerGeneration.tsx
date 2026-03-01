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
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8 font-mono">
          <div className="mx-auto mb-6 p-4 border border-[#3a86ff]/20 bg-[#3a86ff]/5 rounded-none w-fit animate-pulse">
            <Sparkles className="w-12 h-12 text-[#3a86ff]" />
          </div>
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-[0.2em] text-white">
            BOOT_INIT: AI_PEERS
          </h2>
          <p className="text-[10px] opacity-50 uppercase tracking-widest mb-8">
            synthesizing_personalized_study_buddies
          </p>
        </div>

        <div className="mb-8 border border-white/10 bg-white/[0.02] p-6">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 transition-all duration-500 font-mono border-l-2 ${index <= currentStep
                    ? 'bg-blue-500/5 border-[#3a86ff] text-white'
                    : 'bg-white/[0.02] border-white/10 text-white/20'
                  }`}
              >
                <div className={`w-8 h-8 rounded-none border flex items-center justify-center text-[10px] font-mono ${index < currentStep
                    ? 'bg-green-500/20 border-green-500 text-green-500'
                    : index === currentStep
                      ? 'bg-blue-500/20 border-blue-500 text-blue-500 animate-pulse'
                      : 'bg-white/5 border-white/10 text-white/20'
                  }`}>
                  {index < currentStep ? 'DONE' : `0${index + 1}`}
                </div>
                <span className="text-xs tracking-wider uppercase">{step.replace(' ', '_')}</span>
                {index === currentStep && (
                  <div className="ml-auto flex gap-1">
                    <div className="w-1 h-1 bg-[#3a86ff] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-[#3a86ff] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-[#3a86ff] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <h4 className="text-[9px] font-mono uppercase tracking-[0.3em] text-center mb-6 opacity-30">
              manifesting_peer_profiles...
            </h4>
            <div className="flex justify-center gap-6">
              {allPeers.map((peer, index) => (
                <div
                  key={peer.id}
                  className={`transition-all duration-1000 ${currentStep > index ? 'opacity-100 scale-100' : 'opacity-10 scale-90 blur-sm'
                    }`}
                >
                  <div className="text-center">
                    <Avatar
                      peerId={peer.id}
                      size="md"
                      showRing={false}
                      className={currentStep > index ? 'ring-1 ring-[#3a86ff]/30' : ''}
                    />
                    <p className="font-mono text-[9px] mt-3 opacity-50 uppercase">{peer.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="font-mono text-[8px] opacity-20 uppercase tracking-widest leading-relaxed">
          configuration_context: {onboardingData.skillLevel}_LEVEL // DOMAIN: {onboardingData.primaryDomain.toUpperCase()}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-12">
        <div className="mx-auto mb-6 p-4 border border-green-500/20 bg-green-500/5 rounded-none w-fit animate-pulse">
          <Users className="w-12 h-12 text-[#06d6a0]" />
        </div>
        <h2 className="text-4xl font-mono uppercase tracking-[0.2em] mb-4 text-white">
          PEER_SYNC_COMPLETE! 🎉
        </h2>
        <p className="font-mono text-[10px] opacity-50 uppercase tracking-widest">
          personalized_learning_companions_ready_for_deployment
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12 items-stretch">
        {allPeers.map((peer) => (
          <Card key={peer.id} className="h-full flex flex-col text-left border-2 bg-[#0c0c0e] text-white rounded-none transition-all duration-300 hover:bg-[#161618]" style={{
            borderColor: peer.personality === 'curious' ? '#ff4d6d' :
              peer.personality === 'analytical' ? '#3a86ff' :
                peer.personality === 'supportive' ? '#06d6a0' : '#27272a'
          }}>
            <CardHeader className="text-center pb-6 border-b border-white/5">
              <div className="mx-auto mb-6 relative">
                <Avatar
                  peerId={peer.id}
                  size="xl"
                  showRing={false}
                  animated={true}
                  priority={true}
                  interactive={true}
                />
                <div className={`absolute inset-0 rounded-full opacity-10 animate-pulse blur-2xl ${peer.personality === 'curious' ? 'bg-[#ff4d6d]' :
                    peer.personality === 'analytical' ? 'bg-[#3a86ff]' :
                      peer.personality === 'supportive' ? 'bg-[#06d6a0]' : 'bg-white'
                  }`} />
              </div>
              <CardTitle className="text-xl font-mono uppercase tracking-tighter flex items-center justify-center gap-2 mb-1 text-white">
                {peer.name}
                <span className="text-lg opacity-80">
                  {peer.personality === 'curious' ? '🤔' :
                    peer.personality === 'analytical' ? '🧠' :
                      peer.personality === 'supportive' ? '🤝' : '🤖'}
                </span>
              </CardTitle>
              <CardDescription className="font-mono text-[9px] opacity-40 uppercase tracking-widest">
                ID_{peer.personality.slice(0, 3).toUpperCase()}_{peer.skill_level.toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col gap-6">
              <div className="space-y-6 flex-1">
                <div className="relative pl-4 border-l border-white/10">
                  <h4 className="font-mono text-[9px] mb-2 opacity-30 uppercase tracking-[0.2em]">
                    interaction_protocol
                  </h4>
                  <p className="text-xs font-medium leading-relaxed opacity-90">
                    {peer.interaction_style}
                  </p>
                </div>

                <div className="relative pl-4 border-l border-red-500/30">
                  <h4 className="font-mono text-[9px] mb-2 text-red-400/50 uppercase tracking-[0.2em]">
                    known_error_patterns
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {peer.common_mistakes.slice(0, 2).map((mistake, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono bg-red-500/10 text-red-400 px-2 py-0.5 border border-red-500/20 uppercase"
                      >
                        {mistake}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 mt-auto">
                  <h4 className="font-mono text-[8px] mb-2 opacity-20 uppercase tracking-[0.3em]">
                    system_backstory
                  </h4>
                  <p className="text-[10px] opacity-50 leading-relaxed italic">
                    "{peer.backstory}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-12 border border-white/10 bg-[#0c0c0e] p-10 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-5">
          <Sparkles className="w-32 h-32" />
        </div>
        <h3 className="flex items-center gap-3 text-xl font-mono uppercase tracking-[0.2em] mb-10 text-white">
          <Sparkles className="w-5 h-5 text-[#3a86ff]" />
          SUPPORT_SYSTEM_MODULES
        </h3>
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          <div className="group p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
            <h4 className="font-mono text-xs mb-3 text-[#3a86ff] tracking-widest flex items-center gap-2">
              <span className="opacity-30">01_</span> INQUIRY_SEQUENCE
            </h4>
            <p className="text-[11px] opacity-40 leading-relaxed uppercase tracking-tighter">
              PEERS WILL EXECUTE THOUGHTFUL INQUIRY SEQUENCES TO STIMULATE DEEP KNOWLEDGE RETRIEVAL AND VALIDATION.
            </p>
          </div>

          <div className="group p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
            <h4 className="font-mono text-xs mb-3 text-[#06d6a0] tracking-widest flex items-center gap-2">
              <span className="opacity-30">02_</span> FAULT_INJECTION
            </h4>
            <p className="text-[11px] opacity-40 leading-relaxed uppercase tracking-tighter">
              INTENTIONAL LOGIC FAULTS WILL BE INJECTED INTO SESSIONS FOR SYSTEMATIC IDENTIFICATION AND RESOLUTION TRAINING.
            </p>
          </div>

          <div className="group p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
            <h4 className="font-mono text-xs mb-3 text-[#ff4d6d] tracking-widest flex items-center gap-2">
              <span className="opacity-30">03_</span> MULTI_THREAD_DEV
            </h4>
            <p className="text-[11px] opacity-40 leading-relaxed uppercase tracking-tighter">
              COLLABORATIVE CODE EXECUTION WITH REAL-TIME SYNCHRONIZATION AND MULTI-PERSPECTIVE CONTEXT SHARING.
            </p>
          </div>

          <div className="group p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
            <h4 className="font-mono text-xs mb-3 text-[#ffd166] tracking-widest flex items-center gap-2">
              <span className="opacity-30">04_</span> PERFORMANCE_DUELS
            </h4>
            <p className="text-[11px] opacity-40 leading-relaxed uppercase tracking-tighter">
              SYNCHRONOUS CODING CHALLENGES TO BENCHMARK KNOWLEDGE ACQUISITION AND SYSTEM OPTIMIZATION PATHS.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <button
          onClick={handleContinue}
          className="group relative px-16 py-5 bg-[#3a86ff] text-white font-mono uppercase tracking-[0.3em] overflow-hidden transition-all hover:bg-[#3a86ff]/90 active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-4">
            INIT_LEARNING_HUB
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </span>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </button>
        <p className="font-mono text-[8px] opacity-20 uppercase tracking-widest">
          awaiting_user_confirmation // secure_link_established
        </p>
      </div>
    </div>
  )
}