'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Code, Target, Lightbulb, Zap, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { OnboardingData, SkillLevel, LearningGoal } from '@/types/database'

interface Question {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  options: Array<{
    value: string
    label: string
    description: string
  }>
}

const questions: Question[] = [
  {
    id: 'skillLevel',
    title: 'What\'s your current programming experience?',
    description: 'This helps us tailor the difficulty of your lessons and challenges',
    icon: <Code className="w-6 h-6" />,
    options: [
      {
        value: 'beginner',
        label: 'Beginner',
        description: 'New to programming or just getting started'
      },
      {
        value: 'intermediate',
        label: 'Intermediate',
        description: 'Comfortable with basics, ready for more complex concepts'
      },
      {
        value: 'advanced',
        label: 'Advanced',
        description: 'Experienced developer looking to expand skills'
      }
    ]
  },
  {
    id: 'learningGoal',
    title: 'What\'s your primary learning goal?',
    description: 'We\'ll customize your learning path based on your objectives',
    icon: <Target className="w-6 h-6" />,
    options: [
      {
        value: 'learning',
        label: 'Learning for Fun',
        description: 'Exploring programming as a hobby or personal interest'
      },
      {
        value: 'projects',
        label: 'Building Projects',
        description: 'Want to create apps, websites, or personal projects'
      },
      {
        value: 'placement',
        label: 'Job Preparation',
        description: 'Preparing for interviews or career transition'
      },
      {
        value: 'productivity',
        label: 'Work Productivity',
        description: 'Improving skills for current job or professional growth'
      }
    ]
  },
  {
    id: 'primaryDomain',
    title: 'Which technology interests you most?',
    description: 'Your AI peers will be specialized in this area',
    icon: <Zap className="w-6 h-6" />,
    options: [
      {
        value: 'javascript',
        label: 'JavaScript & Web Development',
        description: 'React, Node.js, modern web technologies'
      },
      {
        value: 'python',
        label: 'Python & Data Science',
        description: 'Python programming, data analysis, machine learning'
      },
      {
        value: 'java',
        label: 'Java & Backend Development',
        description: 'Enterprise applications, Spring framework'
      },
      {
        value: 'mobile',
        label: 'Mobile Development',
        description: 'iOS, Android, React Native, Flutter'
      },
      {
        value: 'devops',
        label: 'DevOps & Cloud',
        description: 'AWS, Docker, Kubernetes, CI/CD'
      }
    ]
  },
  {
    id: 'preferredLearningStyle',
    title: 'How do you learn best?',
    description: 'We\'ll adapt our teaching approach to match your style',
    icon: <Lightbulb className="w-6 h-6" />,
    options: [
      {
        value: 'visual',
        label: 'Visual Learning',
        description: 'Diagrams, animations, and visual explanations'
      },
      {
        value: 'practical',
        label: 'Hands-on Practice',
        description: 'Coding challenges and interactive exercises'
      },
      {
        value: 'mixed',
        label: 'Mixed Approach',
        description: 'Combination of theory, visuals, and practice'
      },
      {
        value: 'collaborative',
        label: 'Collaborative Learning',
        description: 'Learning through discussion and peer interaction'
      }
    ]
  },
  {
    id: 'voiceCoachingEnabled',
    title: 'Would you like AI voice coaching?',
    description: 'Get real-time spoken guidance while coding (you can change this later)',
    icon: <Users className="w-6 h-6" />,
    options: [
      {
        value: 'true',
        label: 'Yes, enable voice coaching',
        description: 'Get spoken feedback and guidance while coding'
      },
      {
        value: 'false',
        label: 'Text-based coaching only',
        description: 'Prefer written feedback and suggestions'
      }
    ]
  }
]

interface SkillAssessmentProps {
  onComplete: (data: OnboardingData) => void
}

export function SkillAssessment({ onComplete }: SkillAssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const canProceed = answers[currentQuestion.id]

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!canProceed) return

    setIsSubmitting(true)

    try {
      // Convert answers to proper types
      const onboardingData: OnboardingData = {
        skillLevel: answers.skillLevel as SkillLevel,
        learningGoal: answers.learningGoal as LearningGoal,
        primaryDomain: answers.primaryDomain,
        preferredLearningStyle: answers.preferredLearningStyle,
        voiceCoachingEnabled: answers.voiceCoachingEnabled === 'true'
      }

      // Save to database
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Onboarding data saved:', result)

      // Always continue with onboarding, even if database save failed
      onComplete(onboardingData)
    } catch (error) {
      console.warn('Error submitting assessment (continuing anyway):', error)

      // Show a user-friendly message but continue with the flow
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.log('Assessment submission failed:', errorMessage)

      // Continue with the onboarding flow even if save fails
      const onboardingData: OnboardingData = {
        skillLevel: answers.skillLevel as SkillLevel,
        learningGoal: answers.learningGoal as LearningGoal,
        primaryDomain: answers.primaryDomain,
        preferredLearningStyle: answers.preferredLearningStyle,
        voiceCoachingEnabled: answers.voiceCoachingEnabled === 'true'
      }
      onComplete(onboardingData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-10 px-2">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] leading-none">Assessment Progress</span>
          <span className="text-sm font-bold text-blue-400 tabular-nums">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
          />
        </div>
        <div className="flex justify-between mt-4">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 mx-0.5 rounded-full transition-all duration-500 ${index <= currentQuestionIndex
                ? 'bg-blue-500/40 shadow-[0_0_8px_rgba(58,134,255,0.3)]'
                : 'bg-white/5'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="mb-10">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 p-4 bg-gradient-to-b from-blue-500/10 to-indigo-500/5 border border-blue-500/20 rounded-2xl w-fit shadow-lg shadow-blue-500/5">
            <div className="text-blue-400">
              {currentQuestion.icon}
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-3">
            {currentQuestion.title}
          </h2>
          <p className="text-zinc-400 text-base max-w-md mx-auto leading-relaxed">
            {currentQuestion.description}
          </p>
        </div>

        <RadioGroup
          value={answers[currentQuestion.id] || ''}
          onValueChange={handleAnswerChange}
          className="grid gap-4"
        >
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.value
            return (
              <div
                key={option.value}
                onClick={() => handleAnswerChange(option.value)}
                className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${isSelected
                  ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/[0.05]'
                  }`}
              >
                {/* Selection indicator background pulse */}
                {isSelected && (
                  <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                )}

                <div className="flex items-start gap-4 relative z-10">
                  <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-blue-400 bg-blue-400' : 'border-zinc-700 group-hover:border-zinc-500'
                    }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  <div className="flex-1">
                    <Label
                      htmlFor={option.value}
                      className={`text-lg font-bold tracking-tight cursor-pointer transition-colors duration-300 ${isSelected ? 'text-white' : 'text-zinc-300'
                        }`}
                    >
                      {option.label}
                    </Label>
                    <p className={`text-sm mt-1 leading-relaxed transition-colors duration-300 ${isSelected ? 'text-blue-200/70' : 'text-zinc-500'
                      }`}>
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </RadioGroup>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-12 bg-white/[0.02] p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="w-full sm:w-auto text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl px-6 h-12 font-semibold transition-all"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Previous
        </Button>

        <div className="hidden sm:flex gap-1.5 px-3 py-1.5 bg-black/20 rounded-full border border-white/5">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentQuestionIndex
                ? 'bg-blue-500 w-4'
                : index < currentQuestionIndex
                  ? 'bg-blue-500/40'
                  : 'bg-zinc-700'
                }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="w-full sm:w-auto h-12 px-10 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold tracking-tight shadow-xl shadow-white/5 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Processing</span>
            </div>
          ) : isLastQuestion ? (
            'Complete Strategy'
          ) : (
            <span className="flex items-center gap-1">
              Next Step
              <ChevronRight className="w-5 h-5" />
            </span>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center mt-6 text-sm text-muted-foreground">
        <p>Don&apos;t worry - you can always change these preferences later in your settings</p>
      </div>
    </div>
  )
}