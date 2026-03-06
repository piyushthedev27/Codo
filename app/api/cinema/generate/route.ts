import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { generateCinemaScript, CinemaRequest } from '@/lib/services/cinemaService';
import { withRateLimit, INTENSIVE_RATE_LIMIT } from '@/lib/middleware/rateLimiter';

async function handler(request: NextRequest) {
    try {
        // 1. Authenticate user
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({
                error: 'Unauthorized: Missing or invalid token'
            }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        try {
            await adminAuth().verifyIdToken(token);
        } catch {
            return NextResponse.json({
                error: 'Unauthorized: Invalid token'
            }, { status: 401 });
        }

        // User is authenticated

        // 2. Parse and validate request body
        const body = await request.json();
        const { topic, challengeId } = body;

        // Validate required fields
        if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
            return NextResponse.json({
                error: 'Missing or invalid required field: topic'
            }, { status: 400 });
        }

        // Validate topic length (reasonable limit)
        if (topic.length > 500) {
            return NextResponse.json({
                error: 'Topic exceeds maximum length of 500 characters'
            }, { status: 400 });
        }

        // Validate optional challengeId if provided
        if (challengeId !== undefined && (typeof challengeId !== 'string' || challengeId.trim().length === 0)) {
            return NextResponse.json({
                error: 'Invalid challengeId: must be a non-empty string if provided'
            }, { status: 400 });
        }

        // 3. Build cinema request
        const cinemaRequest: CinemaRequest = {
            topic: topic.trim(),
            ...(challengeId && { challengeId: challengeId.trim() })
        };

        // 4. Generate cinema script
        const cinemaResponse = await generateCinemaScript(cinemaRequest);

        // 5. Return success response
        return NextResponse.json({
            success: true,
            script: cinemaResponse.script,
            cached: cinemaResponse.cached
        }, { status: 200 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Cinema script generation error:', error);

        // Handle specific error cases
        if (message.includes('AI_REFUSAL:')) {
            const friendlyMessage = message.split('AI_REFUSAL:')[1]?.trim() || 'AI refused to generate for this topic.';
            return NextResponse.json({
                error: friendlyMessage
            }, { status: 400 });
        }

        if (message.includes('Too Many Requests') || message.includes('429')) {
            return NextResponse.json({
                error: 'AI Rate Limit Reached. Please wait a minute and try again.',
                details: message
            }, { status: 429 });
        }

        if (message.includes('Topic is required')) {
            return NextResponse.json({
                error: 'Topic is required for cinema generation',
                details: message
            }, { status: 400 });
        }

        if (message.includes('Invalid cinema script format')) {
            return NextResponse.json({
                error: 'Failed to generate valid cinema script. AI returned badly formatted data.',
                details: message
            }, { status: 500 });
        }

        if (message.includes('must have an intro state')) {
            return NextResponse.json({
                error: 'Failed to generate valid cinema script. AI response was incomplete.',
                details: message
            }, { status: 500 });
        }

        return NextResponse.json({
            error: 'AI Engine Error: ' + message,
            details: message
        }, { status: 500 });
    }
}

// Apply rate limiting for resource-intensive cinema generation
export const POST = withRateLimit(handler, INTENSIVE_RATE_LIMIT, 'cinema-generate');
