import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { initializeUserData, userProfileOperations, testDatabaseConnection } from '@/lib/database/operations'
import type { OnboardingData } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    // Test database connection first
    const dbTest = await testDatabaseConnection()
    if (!dbTest.success) {
      console.warn('Database connection failed during onboarding:', dbTest.message)
      return NextResponse.json({
        success: true,
        message: 'Onboarding data received (database unavailable)',
        demo: true
      })
    }

    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const onboardingData: OnboardingData = await request.json()

    // Validate required fields
    if (!onboardingData.skillLevel || !onboardingData.learningGoal || !onboardingData.primaryDomain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      // Check if user profile already exists
      const existingProfile = await userProfileOperations.getByClerkId(userId)

      if (existingProfile) {
        // Update existing profile
        const updatedProfile = await userProfileOperations.update(userId, {
          skill_level: onboardingData.skillLevel,
          learning_goal: onboardingData.learningGoal,
          primary_domain: onboardingData.primaryDomain,
          preferred_learning_style: onboardingData.preferredLearningStyle,
          voice_coaching_enabled: onboardingData.voiceCoachingEnabled
        })

        return NextResponse.json({
          success: true,
          profile: updatedProfile,
          message: 'Profile updated successfully'
        })
      } else {
        // Initialize new user data
        const result = await initializeUserData(userId, {
          skillLevel: onboardingData.skillLevel,
          learningGoal: onboardingData.learningGoal,
          primaryDomain: onboardingData.primaryDomain,
          preferredLearningStyle: onboardingData.preferredLearningStyle,
          voiceCoachingEnabled: onboardingData.voiceCoachingEnabled
        })

        if (!result.success) {
          console.warn('Failed to initialize user data during onboarding:', result.error)
          return NextResponse.json({
            success: true,
            message: 'Onboarding data received (initialization failed)',
            demo: true
          })
        }

        return NextResponse.json({
          success: true,
          profile: result.profile,
          message: 'User profile created successfully'
        })
      }
    } catch (dbError) {
      console.warn('Database error during onboarding, continuing anyway:', dbError)
      return NextResponse.json({
        success: true,
        message: 'Onboarding data received (database error)',
        demo: true
      })
    }
  } catch (error) {
    console.error('Onboarding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    // Test database connection first
    const dbTest = await testDatabaseConnection()
    if (!dbTest.success) {
      console.warn('Database connection failed during profile check:', dbTest.message)
      return NextResponse.json({
        success: true,
        onboardingComplete: false,
        demo: true,
        message: 'Database unavailable'
      })
    }

    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      const profile = await userProfileOperations.getByClerkId(userId)

      if (!profile) {
        return NextResponse.json({
          success: true,
          onboardingComplete: false,
          message: 'Profile not found'
        })
      }

      return NextResponse.json({
        success: true,
        profile,
        onboardingComplete: true
      })
    } catch (dbError) {
      console.warn('Database error during profile check:', dbError)
      return NextResponse.json({
        success: true,
        onboardingComplete: false,
        demo: true,
        message: 'Database error'
      })
    }
  } catch (error) {
    console.error('Get profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}