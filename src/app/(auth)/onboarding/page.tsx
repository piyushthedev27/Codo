'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { SkillAssessment } from './components/SkillAssessment'
import { PeerGeneration } from './components/PeerGeneration'
import { OnboardingComplete } from './components/OnboardingComplete'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import type { OnboardingData } from '@/types/database'

type OnboardingStep = 'assessment' | 'peer-generation' | 'complete'

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('assessment')
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const { user } = useUser()
  const router = useRouter()

  const steps = [
    { id: 'assessment', title: 'Skill Assessment', description: 'Tell us about your learning goals' },
    { id: 'peer-generation', title: 'Meet Your AI Peers', description: 'Generate your study buddies' },
    { id: 'complete', title: 'Ready to Learn', description: 'Your personalized experience awaits' }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleAssessmentComplete = (data: OnboardingData) => {
    setOnboardingData(data)
    setCurrentStep('peer-generation')
  }

  const handlePeerGenerationComplete = () => {
    setCurrentStep('complete')
  }

  const handleOnboardingComplete = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 selection:bg-blue-500/30">
      {/* Background radial gradient for depth */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(58,134,255,0.08),transparent_50%)] pointer-events-none" />

      <div className="container mx-auto px-4 py-16 relative z-10 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 group animate-in fade-in slide-in-from-top-4 duration-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400/90">Personalization Protocol</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Welcome to Codo, {user?.firstName || 'Learner'}
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto text-lg leading-relaxed">
            Let's customize your AI-powered learning environment for maximum growth.
          </p>

          {/* Modern Progress Indicator */}
          <div className="max-w-md mx-auto mt-12 mb-4 px-4">
            <div className="flex justify-between items-end mb-3">
              <div className="space-y-1 text-left">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Phase {currentStepIndex + 1} of {steps.length}</span>
                <span className="block text-sm font-semibold text-white tracking-tight">{steps[currentStepIndex].title}</span>
              </div>
              <span className="text-sm font-bold text-blue-400 tabular-nums">{Math.round(progress)}%</span>
            </div>

            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "circOut" }}
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(58,134,255,0.4)]"
              />
            </div>
          </div>
        </div>

        {/* Step Content Card */}
        <div className="relative rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Subtle accent line at the top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="p-8 md:p-12">
            <div className="relative z-10">
              {currentStep === 'assessment' && (
                <SkillAssessment onComplete={handleAssessmentComplete} />
              )}

              {currentStep === 'peer-generation' && onboardingData && (
                <PeerGeneration
                  onboardingData={onboardingData}
                  onComplete={handlePeerGenerationComplete}
                />
              )}

              {currentStep === 'complete' && onboardingData && (
                <OnboardingComplete
                  onboardingData={onboardingData}
                  onComplete={handleOnboardingComplete}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-12 mb-8 animate-in fade-in duration-1000 delay-500">
          <p className="text-[11px] text-zinc-500 uppercase tracking-[0.25em] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-pulse" />
            Encryption Active &bull; Profile Synced
          </p>
        </div>
      </div>
    </div>
  )
}