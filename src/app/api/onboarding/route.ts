import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { initializeUserData, userProfileOperations } from '@/lib/database/operations'
import type { OnboardingData } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
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
        return NextResponse.json(
          { error: result.error || 'Failed to initialize user data' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        profile: result.profile,
        message: 'User profile created successfully'
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

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = await userProfileOperations.getByClerkId(userId)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile,
      onboardingComplete: true
    })
  } catch (error) {
    console.error('Get profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}