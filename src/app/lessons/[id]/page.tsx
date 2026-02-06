/**
 * Lesson Page
 * Displays AI-generated lessons with interactive elements and progress tracking
 */

'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import { getCachedOrDemoLesson } from '@/lib/lessons/lesson-cache'
import { getLessonProgress, initializeLessonProgress } from '@/lib/lessons/progress-tracking'
import { LessonLoadingSkeleton, LoadingWithMessage } from '@/components/ui/loading'
import { cachedFetch, CACHE_CONFIG } from '@/lib/cache/api-cache'
import type { GeneratedLesson } from '@/lib/ai/lesson-generation'
import type { LessonProgress } from '@/lib/lessons/progress-tracking'
import { Loader2, AlertCircle, BookOpen } from 'lucide-react'

// Lazy load the lesson viewer for better performance
const LessonViewer = dynamic(() => import('@/components/lessons/LessonViewer').then(mod => ({ default: mod.LessonViewer })), {
  loading: () => <LessonLoadingSkeleton />
})

interface LessonPageProps {
  params: {
    id: string
  }
}

export default function LessonPage({ params }: LessonPageProps) {
  const { user, isLoaded } = useUser()
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null)
  const [progress, setProgress] = useState<LessonProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    loadLesson()
  }, [params.id, isLoaded, user])

  const loadLesson = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to get lesson from cache or demo
      const cachedLesson = await getCachedOrDemoLesson(params.id, params.id)
      
      if (cachedLesson) {
        setLesson(cachedLesson)
        
        // Load progress if user is authenticated
        if (user) {
          const userProgress = await getLessonProgress(user.id, params.id)
          if (userProgress) {
            setProgress(userProgress)
          } else {
            // Initialize progress for new lesson
            const initialProgress = await initializeLessonProgress(
              user.id,
              params.id,
              cachedLesson.content.sections.length
            )
            setProgress(initialProgress)
          }
        }
      } else {
        // Try to fetch from API with caching
        const data = await cachedFetch<{ success: boolean, lesson?: GeneratedLesson }>(
          `/api/lessons/cache?action=get-lesson&lessonId=${params.id}&topic=${params.id}`,
          {},
          {
            duration: CACHE_CONFIG.DURATIONS.VERY_LONG,
            storage: 'LOCAL'
          }
        )
        if (data.success) {
          setLesson(data.lesson!)
        } else {
          throw new Error('Lesson not found')
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
      const response = await fetch(`/api/lessons/${params.id}/progress`, {
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

      // Show completion message or redirect
      alert(`Congratulations! You've completed "${lesson.title}" and earned ${lesson.xp_reward} XP!`)
    } catch (error) {
      console.error('Error completing lesson:', error)
    }
  }

  if (loading) {
    return <LessonLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Lesson
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadLesson}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Lesson Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The requested lesson could not be found. It may have been removed or the link is incorrect.
          </p>
        </div>
      </div>
    )
  }

  return (
    <LessonViewer
      lesson={lesson}
      progress={progress}
      onProgressUpdate={handleProgressUpdate}
      onComplete={handleLessonComplete}
      voiceCoachingEnabled={user ? true : false}
    />
  )
}