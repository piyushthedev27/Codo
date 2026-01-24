import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { userProfileOperations, initializeUserData } from '@/lib/database/operations'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await userProfileOperations.getByClerkId(userId)
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      email, 
      firstName, 
      lastName, 
      skillLevel, 
      learningGoal, 
      primaryDomain 
    } = body

    // Check if profile already exists
    const existingProfile = await userProfileOperations.getByClerkId(userId)
    
    if (existingProfile) {
      return NextResponse.json({ error: 'Profile already exists' }, { status: 409 })
    }

    // Initialize user data with profile, AI peers, and knowledge graph
    const result = await initializeUserData(userId, {
      email,
      firstName,
      lastName,
      skillLevel,
      learningGoal,
      primaryDomain
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      profile: result.profile,
      message: 'Profile created successfully'
    })
  } catch (error) {
    console.error('Error creating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const updatedProfile = await userProfileOperations.update(userId, body)
    
    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}