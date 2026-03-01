/**
 * API Route: Lesson Cache Management
 * Manages lesson caching and offline demo mode
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  lessonCache,
  demoLessonManager,
  getCachedOrDemoLesson,
  generateLessonCacheKey,
  isOfflineMode
} from '@/lib/lessons/lesson-cache'
import { getDemoLesson, getDemoLessons } from '@/lib/ai/lesson-generation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const topic = searchParams.get('topic')
    const lessonId = searchParams.get('lessonId')

    switch (action) {
      case 'stats':
        // Get cache statistics
        const stats = lessonCache.getStats()
        const demoTopics = demoLessonManager.getDemoTopics()

        return NextResponse.json({
          success: true,
          stats: {
            ...stats,
            demoLessonsCount: demoTopics.length,
            demoTopics,
            isOffline: isOfflineMode()
          }
        })

      case 'demo-lessons':
        // Get all available demo lessons
        const demoLessons = getDemoLessons()

        return NextResponse.json({
          success: true,
          lessons: demoLessons
        })

      case 'get-lesson':
        // Get a specific cached or demo lesson
        if (!lessonId || !topic) {
          return NextResponse.json(
            { error: 'lessonId and topic are required' },
            { status: 400 }
          )
        }

        const lesson = await getCachedOrDemoLesson(lessonId, topic)
        if (!lesson) {
          return NextResponse.json(
            { error: 'Lesson not found in cache or demo' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          lesson,
          source: lessonCache.has(lessonId) ? 'cache' : 'demo'
        })

      case 'demo-lesson':
        // Get a specific demo lesson by topic
        if (!topic) {
          return NextResponse.json(
            { error: 'topic is required' },
            { status: 400 }
          )
        }

        const demoLesson = getDemoLesson(topic)
        if (!demoLesson) {
          return NextResponse.json(
            { error: 'Demo lesson not found' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          lesson: demoLesson,
          source: 'demo'
        })

      case 'popular':
        // Get most accessed cached lessons
        const popular = lessonCache.getMostAccessed(10)

        return NextResponse.json({
          success: true,
          lessons: popular.map(cached => ({
            id: cached.id,
            title: cached.lesson.title,
            topic: cached.lesson.topic,
            accessCount: cached.accessCount,
            lastAccessed: cached.lastAccessed
          }))
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (_error) {
    console.error('Error handling cache request:', _error)

    return NextResponse.json(
      { error: 'Failed to process cache request' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, lessonId, lesson, topic, skillLevel, userDomain } = body

    switch (action) {
      case 'cache-lesson':
        // Cache a lesson
        if (!lessonId || !lesson) {
          return NextResponse.json(
            { error: 'lessonId and lesson are required' },
            { status: 400 }
          )
        }

        lessonCache.set(lessonId, lesson)

        return NextResponse.json({
          success: true,
          message: 'Lesson cached successfully'
        })

      case 'generate-cache-key':
        // Generate a cache key for lesson parameters
        if (!topic || !skillLevel || !userDomain) {
          return NextResponse.json(
            { error: 'topic, skillLevel, and userDomain are required' },
            { status: 400 }
          )
        }

        const cacheKey = generateLessonCacheKey(topic, skillLevel, userDomain)

        return NextResponse.json({
          success: true,
          cacheKey
        })

      case 'preload-demos':
        // Preload demo lessons for offline use
        try {
          const demoTopics = ['react-hooks', 'javascript-async', 'python-functions']
          const preloadedLessons = []

          for (const demoTopic of demoTopics) {
            const demoLesson = getDemoLesson(demoTopic)
            if (demoLesson) {
              const key = generateLessonCacheKey(demoTopic, 'intermediate', 'web-development')
              lessonCache.set(key, demoLesson)
              preloadedLessons.push(demoTopic)
            }
          }

          return NextResponse.json({
            success: true,
            preloadedLessons,
            message: `Preloaded ${preloadedLessons.length} demo lessons`
          })
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
          return NextResponse.json(
            { error: 'Failed to preload demo lessons' },
            { status: 500 }
          )
        }

      case 'clear-cache':
        // Clear all cached lessons
        lessonCache.clear()

        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully'
        })

      case 'remove-lesson':
        // Remove a specific lesson from cache
        if (!lessonId) {
          return NextResponse.json(
            { error: 'lessonId is required' },
            { status: 400 }
          )
        }

        const removed = lessonCache.delete(lessonId)

        return NextResponse.json({
          success: true,
          removed,
          message: removed ? 'Lesson removed from cache' : 'Lesson not found in cache'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (_error) {
    console.error('Error handling cache update:', _error)

    return NextResponse.json(
      { error: 'Failed to update cache' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')

    if (lessonId) {
      // Delete specific lesson
      const removed = lessonCache.delete(lessonId)

      return NextResponse.json({
        success: true,
        removed,
        message: removed ? 'Lesson removed from cache' : 'Lesson not found in cache'
      })
    } else {
      // Clear entire cache
      lessonCache.clear()

      return NextResponse.json({
        success: true,
        message: 'All cached lessons cleared'
      })
    }

  } catch (_error) {
    console.error('Error deleting from cache:', _error)

    return NextResponse.json(
      { error: 'Failed to delete from cache' },
      { status: 500 }
    )
  }
}