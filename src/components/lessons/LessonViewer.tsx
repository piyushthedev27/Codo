/**
 * Lesson Viewer Component
 * Main component for displaying AI-generated lessons with interactive elements
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Clock, 
  Award, 
  CheckCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { CodeExample } from './CodeExample'
import { InteractiveQuiz } from './InteractiveQuiz'
import { CodeChallenge } from './CodeChallenge'
import { SyntheticPeerChat } from '@/app/lessons/[id]/components/SyntheticPeerChat'
import { VoiceCoachingInterface } from '@/components/unique-features/VoiceCoachingInterface'
import type { GeneratedLesson, LessonSection } from '@/lib/ai/lesson-generation'
import type { LessonProgress } from '@/lib/lessons/progress-tracking'

export interface LessonViewerProps {
  lesson: GeneratedLesson
  progress?: LessonProgress
  onProgressUpdate?: (update: {
    sectionId?: string
    interactionId?: string
    timeSpent?: number
    xpEarned?: number
  }) => void
  onComplete?: () => void
  voiceCoachingEnabled?: boolean
}

export function LessonViewer({
  lesson,
  progress,
  onProgressUpdate,
  onComplete,
  voiceCoachingEnabled = true
}: LessonViewerProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [sectionStartTime, setSectionStartTime] = useState(Date.now())
  const [totalTimeSpent, setTotalTimeSpent] = useState(progress?.timeSpentMinutes || 0)
  const [completedSections, setCompletedSections] = useState<string[]>(
    progress?.sectionsCompleted || []
  )
  const [showPeerChat, setShowPeerChat] = useState(false)
  const [showVoiceCoaching, setShowVoiceCoaching] = useState(false)

  const currentSection = lesson.content.sections[currentSectionIndex]
  const isLastSection = currentSectionIndex === lesson.content.sections.length - 1
  const isFirstSection = currentSectionIndex === 0
  const progressPercentage = ((currentSectionIndex + 1) / lesson.content.sections.length) * 100

  // Update section start time when section changes
  useEffect(() => {
    setSectionStartTime(Date.now())
  }, [currentSectionIndex])

  // Auto-save progress periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - sectionStartTime) / 60000) // minutes
      if (timeSpent > 0) {
        setTotalTimeSpent(prev => prev + timeSpent)
        onProgressUpdate?.({ timeSpent })
        setSectionStartTime(Date.now())
      }
    }, 60000) // Every minute

    return () => clearInterval(interval)
  }, [sectionStartTime, onProgressUpdate])

  const handleNextSection = () => {
    if (isLastSection) {
      handleCompleteLesson()
      return
    }

    // Mark current section as completed
    const timeSpent = Math.floor((Date.now() - sectionStartTime) / 60000)
    const sectionId = currentSection.id
    
    if (!completedSections.includes(sectionId)) {
      setCompletedSections(prev => [...prev, sectionId])
      onProgressUpdate?.({
        sectionId,
        timeSpent,
        xpEarned: 10 // Base XP for completing a section
      })
    }

    setCurrentSectionIndex(prev => prev + 1)
  }

  const handlePreviousSection = () => {
    if (!isFirstSection) {
      setCurrentSectionIndex(prev => prev - 1)
    }
  }

  const handleCompleteLesson = () => {
    const timeSpent = Math.floor((Date.now() - sectionStartTime) / 60000)
    
    // Mark final section as completed if not already
    const sectionId = currentSection.id
    if (!completedSections.includes(sectionId)) {
      onProgressUpdate?.({
        sectionId,
        timeSpent,
        xpEarned: lesson.xp_reward
      })
    }

    onComplete?.()
  }

  const handleQuizAnswer = (correct: boolean, selectedOptions: string[]) => {
    const xpReward = correct ? 25 : 5 // More XP for correct answers
    onProgressUpdate?.({
      xpEarned: xpReward
    })
  }

  const handleCodeChallengeSubmit = (code: string, passed: boolean) => {
    const xpReward = passed ? 50 : 10 // Significant XP for passing challenges
    onProgressUpdate?.({
      xpEarned: xpReward
    })
  }

  const handlePeerInteraction = (interactionId: string) => {
    onProgressUpdate?.({
      interactionId,
      xpEarned: 25 // XP for engaging with peers
    })
  }

  const handleVoiceCoachingUsage = () => {
    onProgressUpdate?.({
      timeSpent: 1
    })
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{lesson.estimated_duration} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>{lesson.xp_reward} XP</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-blue-800 rounded-full h-2 mb-2">
          <motion.div
            className="bg-white rounded-full h-2"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-blue-100">
          <span>Section {currentSectionIndex + 1} of {lesson.content.sections.length}</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Lesson Content */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSectionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Section Header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {currentSection.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>~{currentSection.estimatedDuration} minutes</span>
                  {completedSections.includes(currentSection.id) && (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                      <span className="text-green-600 dark:text-green-400">Completed</span>
                    </>
                  )}
                </div>
              </div>

              {/* Section Content */}
              <div className="prose dark:prose-invert max-w-none mb-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentSection.content}
                </p>
              </div>

              {/* Code Examples */}
              {currentSection.codeExamples?.map((example) => (
                <div key={example.id} className="mb-6">
                  <CodeExample
                    id={example.id}
                    language={example.language}
                    code={example.code}
                    explanation={example.explanation}
                    runnable={example.runnable}
                    onRun={(code) => console.log('Running code:', code)}
                    onCopy={() => console.log('Code copied')}
                  />
                </div>
              ))}

              {/* Interactive Elements */}
              {currentSection.interactiveElements?.map((element) => (
                <div key={element.id} className="mb-6">
                  {element.type === 'quiz' && (
                    <InteractiveQuiz
                      id={element.id}
                      question={element.question}
                      options={element.options?.map((opt, idx) => ({
                        id: idx.toString(),
                        text: opt,
                        isCorrect: Array.isArray(element.correctAnswer) 
                          ? element.correctAnswer.includes(opt)
                          : element.correctAnswer === opt
                      })) || []}
                      explanation={element.explanation}
                      onAnswer={handleQuizAnswer}
                      showHint={true}
                      hint="Think about the core concepts we just covered."
                    />
                  )}
                  
                  {element.type === 'code_challenge' && (
                    <CodeChallenge
                      id={element.id}
                      title={element.question}
                      description={element.explanation}
                      starterCode="// Write your solution here\nfunction solution() {\n  \n}"
                      language="javascript"
                      testCases={[
                        { input: "test input", expected: "expected output", description: "Basic test case" }
                      ]}
                      onSubmit={handleCodeChallengeSubmit}
                      hints={["Start by understanding the problem requirements", "Break down the solution into smaller steps"]}
                    />
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePreviousSection}
              disabled={isFirstSection}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVoiceCoaching(!showVoiceCoaching)}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  showVoiceCoaching
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {showVoiceCoaching ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                Voice Coach
              </button>

              <button
                onClick={() => setShowPeerChat(!showPeerChat)}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  showPeerChat
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                💬 Study Group
              </button>
            </div>

            <button
              onClick={handleNextSection}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              {isLastSection ? 'Complete Lesson' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {/* Voice Coaching */}
          {showVoiceCoaching && voiceCoachingEnabled && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <VoiceCoachingInterface
                context={`Lesson: ${lesson.title}, Section: ${currentSection.title}, Topic: ${lesson.topic}`}
              />
            </div>
          )}

          {/* Peer Chat */}
          {showPeerChat && (
            <div className="p-4">
              <SyntheticPeerChat />
            </div>
          )}

          {/* Lesson Overview */}
          {!showPeerChat && !showVoiceCoaching && (
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Lesson Overview</h3>
              
              <div className="space-y-3 mb-6">
                {lesson.content.sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSectionIndex(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      index === currentSectionIndex
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : completedSections.includes(section.id)
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{section.title}</span>
                      {completedSections.includes(section.id) && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      ~{section.estimatedDuration} min
                    </div>
                  </button>
                ))}
              </div>

              {/* Learning Objectives */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Learning Objectives</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {lesson.content.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Progress Stats */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Progress</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sections:</span>
                    <span className="font-medium">{completedSections.length}/{lesson.content.sections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Time:</span>
                    <span className="font-medium">{totalTimeSpent}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">XP Earned:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {progress?.xpEarned || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}