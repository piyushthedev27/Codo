'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Code, Target, Lightbulb, Zap, Users } from 'lucide-react'
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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save onboarding data')
      }

      const result = await response.json()
      console.log('Onboarding data saved:', result)
      
      onComplete(onboardingData)
    } catch (error) {
      console.error('Error submitting assessment:', error)
      // For now, continue with the flow even if save fails
      // In production, you might want to show an error message
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
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="mb-8">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit">
            {currentQuestion.icon}
          </div>
          <CardTitle className="text-xl mb-2">
            {currentQuestion.title}
          </CardTitle>
          <CardDescription className="text-base">
            {currentQuestion.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={handleAnswerChange}
            className="space-y-4"
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="relative">
                <div className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer">
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value}
                    className="mt-1"
                  />
                  <div className="flex-1 cursor-pointer" onClick={() => handleAnswerChange(option.value)}>
                    <Label 
                      htmlFor={option.value}
                      className="text-base font-medium cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index < currentQuestionIndex
                  ? 'bg-green-500'
                  : index === currentQuestionIndex
                  ? 'bg-blue-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : isLastQuestion ? (
            'Complete Assessment'
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center mt-6 text-sm text-muted-foreground">
        <p>Don't worry - you can always change these preferences later in your settings</p>
      </div>
    </div>
  )
}