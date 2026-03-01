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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _RotateCcw,
  Lightbulb,
  TrendingUp
} from 'lucide-react'
import { CodeExample } from './CodeExample'
import { InteractiveQuiz } from './InteractiveQuiz'
import { CodeChallenge } from './CodeChallenge'
import { SyntheticPeerChat } from '@/app/lessons/[id]/components/SyntheticPeerChat'
import { VoiceCoachingInterface } from '@/components/unique-features/VoiceCoachingInterface'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { GeneratedLesson, _LessonSection } from '@/lib/ai/lesson-generation'
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
  // eslint-disable-next-line react-hooks/purity
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
    // eslint-disable-next-line react-hooks/purity
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleQuizAnswer = (correct: boolean, _selectedOptions: string[]) => {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handlePeerInteraction = (interactionId: string) => {
    onProgressUpdate?.({
      interactionId,
      xpEarned: 25 // XP for engaging with peers
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleVoiceCoachingUsage = () => {
    onProgressUpdate?.({
      timeSpent: 1
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">{lesson.title}</h1>
                <p className="text-blue-100 text-sm mt-1">Section {currentSectionIndex + 1} of {lesson.content.sections.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <Clock className="w-5 h-5" />
                <span className="font-bold">{lesson.estimated_duration} min</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 backdrop-blur-md border border-amber-400/30">
                <Award className="w-5 h-5 text-amber-300" />
                <span className="font-black text-amber-100">{lesson.xp_reward} XP</span>
              </div>
            </div>
          </div>

          {/* Modern Progress Bar */}
          <div className="relative">
            <div className="w-full bg-blue-800/50 rounded-full h-3 backdrop-blur-sm border border-blue-700/50">
              <motion.div
                className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 rounded-full h-3 shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-blue-100 font-semibold">
              <span>{Math.round(progressPercentage)}% Complete</span>
              <span>{completedSections.length}/{lesson.content.sections.length} Sections</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lesson Content - Main Column */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSectionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  {/* Section Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-lg">
                        {currentSectionIndex + 1}
                      </div>
                      <h2 className="text-2xl font-black text-white">
                        {currentSection.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">~{currentSection.estimatedDuration} minutes</span>
                      </div>
                      {completedSections.includes(currentSection.id) && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300 font-bold">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section Content */}
                  <div className="prose prose-invert prose-lg max-w-none mb-12">
                    {currentSection.content.split('\n\n').map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-slate-300 leading-relaxed text-lg mb-8 last:mb-0 font-medium tracking-tight"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Code Examples */}
                  {currentSection.codeExamples?.map((example) => (
                    <div key={example.id} className="mb-12">
                      <CodeExample
                        id={example.id}
                        language={example.language}
                        code={example.code}
                        explanation={example.explanation}
                        runnable={example.runnable}
                        onRun={(code) => {
                          // Optional: perform additional logic here
                          console.log('User ran code:', code)
                        }}
                        onCopy={() => console.log('Code copied')}
                      />
                    </div>
                  ))}

                  {/* Interactive Elements */}
                  {currentSection.interactiveElements?.map((element) => (
                    <div key={element.id} className="mb-8">
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

              {/* Navigation Footer */}
              <div className="flex items-center justify-between px-8 py-6 border-t border-slate-700/50 bg-slate-800/30">
                <button
                  onClick={handlePreviousSection}
                  disabled={isFirstSection}
                  className="flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-xl font-bold"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowVoiceCoaching(!showVoiceCoaching)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${showVoiceCoaching
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      }`}
                  >
                    {showVoiceCoaching ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    Voice Coach
                  </button>

                  <button
                    onClick={() => setShowPeerChat(!showPeerChat)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${showPeerChat
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      }`}
                  >
                    💬 Study Group
                  </button>
                </div>

                <button
                  onClick={handleNextSection}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all font-black shadow-lg shadow-blue-500/50"
                >
                  {isLastSection ? 'Complete Lesson' : 'Next'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Lesson Overview & Features */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Voice Coaching Panel (Self-contained) */}
              {showVoiceCoaching && voiceCoachingEnabled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full"
                >
                  <VoiceCoachingInterface
                    userCode={currentSection.codeExamples?.[0]?.code || ''}
                    context={`Lesson: ${lesson.title}, Section: ${currentSection.title}, Topic: ${lesson.topic}`}
                  />
                </motion.div>
              )}

              {/* Peer Chat Panel */}
              {showPeerChat && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden"
                >
                  <SyntheticPeerChat />
                </motion.div>
              )}

              {/* Lesson Overview Panel */}
              {!showPeerChat && !showVoiceCoaching && (
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                    <h3 className="font-black text-white">Lesson Overview</h3>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Section Navigation */}
                    <div className="space-y-3">
                      {lesson.content.sections.map((section, index) => (
                        <button
                          key={section.id}
                          onClick={() => setCurrentSectionIndex(index)}
                          className={`w-full text-left p-4 rounded-xl transition-all ${index === currentSectionIndex
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50'
                            : completedSections.includes(section.id)
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-black">Section {index + 1}</span>
                            {completedSections.includes(section.id) && (
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                            )}
                          </div>
                          <div className="font-bold text-base mb-1">{section.title}</div>
                          <div className="text-xs opacity-75 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ~{section.estimatedDuration} min
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Learning Objectives */}
                    <div className="bg-slate-700/30 rounded-2xl p-4 border border-slate-600/30">
                      <h4 className="font-black text-white mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                        Learning Objectives
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-300">
                        {lesson.content.learningObjectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1 font-bold">✓</span>
                            <span className="leading-relaxed">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Progress Stats */}
                    <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-4 border border-slate-600/30">
                      <h4 className="font-black text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Your Progress
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm font-semibold">Sections:</span>
                          <span className="font-black text-white text-lg">
                            {completedSections.length}/{lesson.content.sections.length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm font-semibold">Time Spent:</span>
                          <span className="font-black text-white text-lg">{totalTimeSpent}m</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm font-semibold">XP Earned:</span>
                          <span className="font-black text-amber-400 text-lg flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {progress?.xpEarned || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}