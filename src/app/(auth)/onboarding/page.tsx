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
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-[#3a86ff]/30">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-mono uppercase tracking-[0.2em] mb-4 text-white">
            BOOT_INIT: {user?.firstName?.toUpperCase() || 'LEARNER'}
          </h1>
          <p className="text-xs font-mono opacity-50 uppercase tracking-[0.3em] mb-12">
            configuring_personalized_learning_environment
          </p>

          {/* Progress Bar - Technical */}
          <div className="max-w-md mx-auto mb-16 px-4">
            <div className="flex justify-between font-mono text-[10px] opacity-50 mb-3 tracking-widest">
              <span>MODULE_{currentStepIndex + 1}/{steps.length}</span>
              <span>{Math.round(progress)}%_STABLE</span>
            </div>
            <div className="h-1 w-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-[#3a86ff]"
              />
            </div>
            <div className="flex justify-between mt-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`text-[8px] font-mono tracking-tighter uppercase ${index <= currentStepIndex ? 'text-[#3a86ff]' : 'text-white/20'}`}
                >
                  {step.title.replace(' ', '_')}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="relative border border-white/10 bg-[#0c0c0e] p-8">
          <div className="absolute top-0 right-0 p-2 font-mono text-[8px] opacity-20 select-none">
            CODO_V1.1_SYSTEM_CORE
          </div>
          <div className="mb-10 text-left border-l-2 border-[#3a86ff] pl-6">
            <h2 className="text-2xl font-mono uppercase tracking-widest text-white mb-2">
              {steps[currentStepIndex]?.title}
            </h2>
            <p className="text-sm opacity-50 font-mono italic">
              // {steps[currentStepIndex]?.description}
            </p>
          </div>

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

        {/* Footer */}
        <div className="text-center mt-12 mb-8">
          <p className="font-mono text-[9px] opacity-30 uppercase tracking-[0.2em]">
            est_config_duration: 00:03:00 // system_ready
          </p>
        </div>
      </div>
    </div>
  )
}