/**
 * Recommendations API Route
 * Provides personalized lesson recommendations
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/database/supabase-client'
import type { LessonMetadata } from '@/lib/recommendations/lesson-recommender'
import { generateHybridRecommendations } from '@/lib/recommendations/recommendation-engine'
import type { RecommendationContext } from '@/lib/recommendations/lesson-recommender'

// Demo lesson catalog for MVP
const DEMO_LESSONS: LessonMetadata[] = [
  {
    id: 'lesson-react-hooks',
    title: 'Advanced React Hooks',
    description: 'Master useState, useEffect, useContext, and custom hooks with real-world examples',
    topic: 'React',
    difficulty: 'intermediate',
    duration: '2.5 hours',
    durationMinutes: 150,
    prerequisites: ['JavaScript Basics', 'React Fundamentals'],
    learningObjectives: [
      'Understand React Hooks lifecycle',
      'Build custom hooks',
      'Optimize performance with useMemo and useCallback'
    ],
    tags: ['react', 'hooks', 'javascript', 'frontend'],
    category: 'Web Development',
    xpReward: 250,
    thumbnail: '/lessons/react-hooks.png'
  },
  {
    id: 'lesson-data-structures',
    title: 'Data Structures Masterclass',
    description: 'Deep dive into trees, graphs, hash tables, and their real-world applications',
    topic: 'Data Structures',
    difficulty: 'advanced',
    duration: '3 hours',
    durationMinutes: 180,
    prerequisites: ['Arrays & Objects', 'Algorithm Basics'],
    learningObjectives: [
      'Implement binary trees and BSTs',
      'Master graph traversal algorithms',
      'Understand hash table internals'
    ],
    tags: ['algorithms', 'data-structures', 'computer-science'],
    category: 'Computer Science',
    xpReward: 350,
    thumbnail: '/lessons/data-structures.png'
  },
  {
    id: 'lesson-system-design',
    title: 'System Design Fundamentals',
    description: 'Learn to design scalable systems with databases, caching, and load balancing',
    topic: 'System Design',
    difficulty: 'advanced',
    duration: '4 hours',
    durationMinutes: 240,
    prerequisites: ['Backend Development', 'Database Basics'],
    learningObjectives: [
      'Design scalable architectures',
      'Implement caching strategies',
      'Understand distributed systems'
    ],
    tags: ['system-design', 'architecture', 'scalability', 'backend'],
    category: 'Software Engineering',
    xpReward: 400,
    thumbnail: '/lessons/system-design.png'
  },
  {
    id: 'lesson-python-basics',
    title: 'Python Programming Essentials',
    description: 'Start your Python journey with variables, functions, and control flow',
    topic: 'Python',
    difficulty: 'beginner',
    duration: '2 hours',
    durationMinutes: 120,
    prerequisites: [],
    learningObjectives: [
      'Write Python programs',
      'Understand data types and variables',
      'Use functions and modules'
    ],
    tags: ['python', 'programming', 'beginner'],
    category: 'Programming',
    xpReward: 150,
    thumbnail: '/lessons/python-basics.png'
  },
  {
    id: 'lesson-async-javascript',
    title: 'Async JavaScript Deep Dive',
    description: 'Master promises, async/await, and handle asynchronous operations like a pro',
    topic: 'JavaScript',
    difficulty: 'intermediate',
    duration: '2 hours',
    durationMinutes: 120,
    prerequisites: ['JavaScript Basics', 'Functions'],
    learningObjectives: [
      'Understand the event loop',
      'Work with promises and async/await',
      'Handle errors in async code'
    ],
    tags: ['javascript', 'async', 'promises', 'web'],
    category: 'Web Development',
    xpReward: 200,
    thumbnail: '/lessons/async-js.png'
  },
  {
    id: 'lesson-git-github',
    title: 'Git & GitHub Workflow',
    description: 'Learn version control, branching strategies, and collaborative development',
    topic: 'Git',
    difficulty: 'beginner',
    duration: '1.5 hours',
    durationMinutes: 90,
    prerequisites: [],
    learningObjectives: [
      'Use Git for version control',
      'Collaborate with GitHub',
      'Resolve merge conflicts'
    ],
    tags: ['git', 'github', 'version-control', 'collaboration'],
    category: 'Developer Tools',
    xpReward: 100,
    thumbnail: '/lessons/git-github.png'
  },
  {
    id: 'lesson-typescript',
    title: 'TypeScript for JavaScript Developers',
    description: 'Add type safety to your JavaScript projects with TypeScript',
    topic: 'TypeScript',
    difficulty: 'intermediate',
    duration: '2.5 hours',
    durationMinutes: 150,
    prerequisites: ['JavaScript Basics'],
    learningObjectives: [
      'Understand TypeScript types',
      'Use interfaces and generics',
      'Configure TypeScript projects'
    ],
    tags: ['typescript', 'javascript', 'types', 'web'],
    category: 'Web Development',
    xpReward: 220,
    thumbnail: '/lessons/typescript.png'
  },
  {
    id: 'lesson-api-design',
    title: 'RESTful API Design',
    description: 'Design and build robust REST APIs with best practices',
    topic: 'API Development',
    difficulty: 'intermediate',
    duration: '3 hours',
    durationMinutes: 180,
    prerequisites: ['Backend Development', 'HTTP Basics'],
    learningObjectives: [
      'Design RESTful endpoints',
      'Implement authentication',
      'Handle errors gracefully'
    ],
    tags: ['api', 'rest', 'backend', 'web'],
    category: 'Backend Development',
    xpReward: 280,
    thumbnail: '/lessons/api-design.png'
  }
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !profile) {
      console.warn('Profile not found, using demo recommendations')
      return NextResponse.json({
        recommendations: DEMO_LESSONS.slice(0, 3).map((lesson, index) => ({
          ...lesson,
          recommendedBy: ['sarah', 'alex', 'jordan'][index],
          recommendationReason: `Recommended based on your interests`,
          relevanceScore: 85 - index * 5,
          difficultyMatch: 0.8,
          prerequisitesMet: true
        })),
        demo: true
      })
    }

    // Fetch AI peers
    const { data: aiPeers } = await supabase
      .from('ai_peer_profiles')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_active', true)

    // Fetch knowledge graph
    const { data: knowledgeGraph } = await supabase
      .from('knowledge_graph_nodes')
      .select('*')
      .eq('user_id', profile.id)

    // Fetch recent activities
    const { data: recentActivities } = await supabase
      .from('enhanced_activities')
      .select('*')
      .eq('user_id', profile.id)
      .order('activity_timestamp', { ascending: false })
      .limit(50)

    // Fetch mistake patterns
    const { data: mistakePatterns } = await supabase
      .from('mistake_patterns')
      .select('error_type, frequency')
      .eq('user_id', profile.id)
      .eq('resolved', false)

    // Build recommendation context
    const context: RecommendationContext = {
      userProfile: profile,
      knowledgeGraph: knowledgeGraph || [],
      recentActivities: recentActivities || [],
      aiPeers: aiPeers || [],
      mistakePatterns: mistakePatterns || []
    }

    // Generate recommendations
    const recommendations = generateHybridRecommendations(
      DEMO_LESSONS,
      context,
      undefined, // No collaborative filtering data for MVP
      3
    )

    return NextResponse.json({
      recommendations,
      demo: false
    })
  } catch (error) {
    console.error('Error generating recommendations:', error)

    // Fallback to demo recommendations
    return NextResponse.json({
      recommendations: DEMO_LESSONS.slice(0, 3).map((lesson, index) => ({
        ...lesson,
        recommendedBy: ['sarah', 'alex', 'jordan'][index],
        recommendationReason: `Recommended for you`,
        relevanceScore: 80,
        difficultyMatch: 0.8,
        prerequisitesMet: true
      })),
      demo: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _activityId } = body

    // This endpoint would refresh recommendations after a new activity
    // For MVP, just return success
    return NextResponse.json({
      success: true,
      message: 'Recommendations will be refreshed'
    })
  } catch (error) {
    console.error('Error refreshing recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to refresh recommendations' },
      { status: 500 }
    )
  }
}
