/**
 * Lesson Page Client Component
 * Client-side logic for lesson display and interaction
 */

'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import { getCachedOrDemoLesson } from '@/lib/lessons/lesson-cache'
import { getLessonProgress, initializeLessonProgress } from '@/lib/lessons/progress-tracking'
import { LessonLoadingSkeleton } from '@/components/ui/loading'
import { cachedFetch, CACHE_CONFIG } from '@/lib/cache/api-cache'
import { LessonCompletionModal } from '@/components/lessons/LessonCompletionModal'
import type { GeneratedLesson } from '@/lib/ai/lesson-generation'
import type { LessonProgress } from '@/lib/lessons/progress-tracking'
import { AlertCircle, BookOpen } from 'lucide-react'

// Lazy load the lesson viewer for better performance
const LessonViewer = dynamic(() => import('@/components/lessons/LessonViewer').then(mod => ({ default: mod.LessonViewer })), {
  loading: () => <LessonLoadingSkeleton />
})

export function LessonPageClient({ lessonId }: { lessonId: string }) {
  const { user, isLoaded } = useUser()
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null)
  const [progress, setProgress] = useState<LessonProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    // Check if lessonId is a UUID (knowledge graph node ID)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonId)
    
    if (isUUID) {
      // UUID-based IDs are knowledge graph nodes, not actual lessons
      // Redirect to lessons browse page
      console.log('UUID-based lesson ID detected, redirecting to lessons page')
      window.location.href = '/lessons'
      return
    }

    loadLesson()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, isLoaded, user])

  const loadLesson = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to get lesson from cache or demo
      const cachedLesson = await getCachedOrDemoLesson(lessonId, lessonId)
      
      if (cachedLesson) {
        setLesson(cachedLesson)
        
        // Load progress if user is authenticated
        if (user) {
          const userProgress = await getLessonProgress(user.id, lessonId)
          if (userProgress) {
            setProgress(userProgress)
          } else {
            // Initialize progress for new lesson
            const initialProgress = await initializeLessonProgress(
              user.id,
              lessonId,
              cachedLesson.content.sections.length
            )
            setProgress(initialProgress)
          }
        }
      } else {
        // Try to fetch from API with caching
        try {
          const data = await cachedFetch<{ success: boolean, lesson?: GeneratedLesson }>(
            `/api/lessons/cache?action=get-lesson&lessonId=${lessonId}&topic=${lessonId}`,
            {},
            {
              duration: CACHE_CONFIG.DURATIONS.VERY_LONG,
              storage: 'LOCAL'
            }
          )
          if (data.success && data.lesson) {
            setLesson(data.lesson)
          } else {
            // Lesson not found - set error without throwing
            setError('Lesson not found. Please check the lesson ID or try generating a new lesson.')
            setLesson(null)
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_apiError) {
          // Silently handle 404 - lesson doesn't exist
          console.log(`Lesson ${lessonId} not found in cache or API`)
          setError('Lesson not found. Please check the lesson ID or try generating a new lesson.')
          setLesson(null)
        }
      }
    } catch (err) {
      console.error('Error loading lesson:', err)
      setError(err instanceof Error ? err.message : 'Failed to load lesson')
    } finally {
      setLoading(false)
    }
  }

  const handleProgressUpdate = async (update: {
    sectionId?: string
    interactionId?: string
    timeSpent?: number
    xpEarned?: number
  }) => {
    if (!user || !lesson) return

    try {
      const response = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_progress',
          ...update
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.progress) {
          setProgress(data.progress)
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleLessonComplete = async () => {
    if (!user || !lesson) return

    try {
      // Mark lesson as completed
      await handleProgressUpdate({
        xpEarned: lesson.xp_reward
      })

      // Show completion modal
      setShowCompletionModal(true)
    } catch (error) {
      console.error('Error completing lesson:', error)
    }
  }

  if (loading) {
    return <LessonLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Lesson
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={loadLesson}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              Try Again
            </button>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Lesson Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The requested lesson could not be found. It may have been removed or the link is incorrect.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <LessonViewer
        lesson={lesson}
        progress={progress || undefined}
        onProgressUpdate={handleProgressUpdate}
        onComplete={handleLessonComplete}
        voiceCoachingEnabled={user ? true : false}
      />
      
      {/* Completion Modal */}
      <LessonCompletionModal
        isOpen={showCompletionModal}
        lessonTitle={lesson.title}
        xpEarned={lesson.xp_reward}
        onClose={() => setShowCompletionModal(false)}
        onContinue={() => {
          setShowCompletionModal(false)
          // Navigate to next lesson or lessons page
          window.location.href = '/lessons'
        }}
        onBackToDashboard={() => {
          window.location.href = '/dashboard'
        }}
      />
    </>
  )
}
