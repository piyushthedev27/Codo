'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome to Codo, {user?.firstName || 'Learner'}!
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Let's personalize your AI-powered learning experience
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStepIndex + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`text-xs ${index <= currentStepIndex ? 'text-blue-600 font-medium' : 'text-muted-foreground'}`}
                >
                  {step.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">
              {steps[currentStepIndex]?.title}
            </CardTitle>
            <CardDescription className="text-base">
              {steps[currentStepIndex]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>This will only take 2-3 minutes to set up your personalized learning experience</p>
        </div>
      </div>
    </div>
  )
}